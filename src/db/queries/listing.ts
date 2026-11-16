import "server-only";
import { and, asc, desc, eq, inArray, isNotNull, isNull, sql, type SQL } from "drizzle-orm";
import type { ProductCardData } from "@/components/catalog/ProductCard";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import type { ListingParams } from "@/lib/listing-params";
import { available, selectCards, toCard } from "./catalog";

export const PAGE_SIZE = 24;

/**
 * `categoryIds` = the category and its children; undefined = whole catalog.
 * `words` = normalised search words (see searchWords); every word must occur.
 */
export type Scope = { categoryIds?: number[]; words?: string[] };

export type FacetValue = { value: string; label: string; count: number };
export type Facet = {
  param: "f" | "size" | "tag" | "cond";
  key: string;
  title: string;
  values: FacetValue[];
};
export type Facets = { groups: Facet[]; priceMin: number; priceMax: number; saleCount: number };

const inList = (values: string[]) =>
  sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  );

/** LIKE pattern with %, _ and \ escaped (user input). */
const likeContains = (w: string) => `%${w.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

export function scopeWhere(scope: Scope): SQL | undefined {
  return and(
    available,
    scope.categoryIds ? inArray(products.categoryId, scope.categoryIds) : undefined,
    ...(scope.words ?? []).map(
      (w) => sql`${products.searchText} LIKE ${likeContains(w)} ESCAPE '\\'`,
    ),
  );
}

function filterWhere(p: ListingParams): SQL | undefined {
  const parts: (SQL | undefined)[] = [
    p.min ? sql`${products.price} >= ${Math.round(p.min * 100)}` : undefined,
    p.max ? sql`${products.price} <= ${Math.round(p.max * 100)}` : undefined,
    p.sale ? and(isNotNull(products.oldPrice), isNull(products.defectNote)) : undefined,
    p.conds.length === 1
      ? p.conds[0] === "markdown"
        ? isNotNull(products.defectNote)
        : isNull(products.defectNote)
      : undefined,
    p.isNew ? eq(products.isNew, true) : undefined,
    p.bestseller ? eq(products.isBestseller, true) : undefined,
    p.sizes.length
      ? sql`EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = products.id AND v.stock > 0 AND v.size IN (${inList(p.sizes)}))`
      : undefined,
    p.tags.length
      ? sql`EXISTS (SELECT 1 FROM product_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.product_id = products.id AND t.slug IN (${inList(p.tags)}))`
      : undefined,
    ...Object.entries(p.attrs).map(
      ([key, values]) =>
        sql`EXISTS (SELECT 1 FROM product_attributes a WHERE a.product_id = products.id AND a.key = ${key} AND a.value IN (${inList(values)}))`,
    ),
  ];
  return and(...parts);
}

// markdown ("уцінка") goes after new items, except when the visitor sorts by price
const markdownLast = sql`${products.defectNote} IS NOT NULL`;
const orderBy = {
  popular: [markdownLast, desc(products.isBestseller), asc(products.sort), desc(products.id)],
  "price-asc": [asc(products.price), desc(products.id)],
  "price-desc": [desc(products.price), desc(products.id)],
  new: [markdownLast, desc(products.isNew), desc(products.id)],
};

export async function listProducts(
  scope: Scope,
  params: ListingParams,
): Promise<{ items: ProductCardData[]; total: number }> {
  const where = and(scopeWhere(scope), filterWhere(params));
  const [rows, [{ total }]] = await Promise.all([
    selectCards()
      .where(where)
      .orderBy(...orderBy[params.sort])
      .limit(PAGE_SIZE)
      .offset((params.page - 1) * PAGE_SIZE),
    getDb()
      .select({ total: sql<number>`count(*)` })
      .from(products)
      .where(where),
  ]);
  return { items: rows.map(toCard), total };
}

/**
 * Filter groups available in the scope (counts ignore the other active filters — simple and
 * predictable). A group is shown only when it has ≥ 2 values.
 */
export async function getFacets(scope: Scope): Promise<Facets> {
  const db = getDb();
  const ids = db.select({ id: products.id }).from(products).where(scopeWhere(scope));

  const [attrs, sizes, tagRows, [bounds]] = await Promise.all([
    db.all<{ key: string; value: string; count: number }>(
      sql`SELECT a.key AS key, a.value AS value, count(DISTINCT a.product_id) AS count FROM product_attributes a WHERE a.product_id IN (${ids}) GROUP BY a.key, a.value ORDER BY a.key, a.value`,
    ),
    db.all<{ value: string; count: number }>(
      sql`SELECT v.size AS value, count(DISTINCT v.product_id) AS count FROM product_variants v WHERE v.size <> '' AND v.stock > 0 AND v.product_id IN (${ids}) GROUP BY v.size ORDER BY min(v.sort), v.size`,
    ),
    db.all<{ value: string; label: string; count: number }>(
      sql`SELECT t.slug AS value, t.name AS label, count(*) AS count FROM product_tags pt JOIN tags t ON t.id = pt.tag_id WHERE pt.product_id IN (${ids}) GROUP BY t.id ORDER BY t.name`,
    ),
    db
      .select({
        min: sql<number>`coalesce(min(${products.price}), 0)`,
        max: sql<number>`coalesce(max(${products.price}), 0)`,
        sale: sql<number>`count(CASE WHEN ${products.oldPrice} IS NOT NULL AND ${products.defectNote} IS NULL THEN 1 END)`,
        markdown: sql<number>`count(${products.defectNote})`,
        total: sql<number>`count(*)`,
      })
      .from(products)
      .where(scopeWhere(scope)),
  ]);

  const groups: Facet[] = [];
  if (bounds.markdown > 0 && bounds.markdown < bounds.total) {
    groups.push({
      param: "cond",
      key: "cond",
      title: "Стан",
      values: [
        { value: "new", label: "Новий", count: bounds.total - bounds.markdown },
        { value: "markdown", label: "Уцінка", count: bounds.markdown },
      ],
    });
  }
  if (tagRows.length >= 2)
    groups.push({ param: "tag", key: "tag", title: "Призначення", values: tagRows });
  if (sizes.length >= 2) {
    groups.push({
      param: "size",
      key: "size",
      title: "Розмір",
      values: sizes.map((s) => ({ ...s, label: s.value })),
    });
  }
  const byKey = new Map<string, FacetValue[]>();
  for (const a of attrs) {
    byKey.set(a.key, [
      ...(byKey.get(a.key) ?? []),
      { value: a.value, label: a.value, count: a.count },
    ]);
  }
  for (const [key, values] of byKey) {
    if (values.length >= 2) groups.push({ param: "f", key, title: key, values });
  }

  return {
    groups,
    priceMin: Math.floor(bounds.min / 100),
    priceMax: Math.ceil(bounds.max / 100),
    saleCount: bounds.sale,
  };
}
