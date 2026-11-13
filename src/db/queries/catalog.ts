import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, inArray, isNotNull, sql, type SQL } from "drizzle-orm";
import type { ProductCardData } from "@/components/catalog/ProductCard";
import { getDb } from "@/db";
import { categories, products, type SizeChart } from "@/db/schema";

export type CategoryNode = {
  id: number;
  slug: string;
  name: string;
  productCount: number;
  children: CategoryNode[];
};

// Correlated subqueries reference the outer table by its literal name: `${products.id}` would
// render as a bare "id" here, which SQLite resolves to the INNER table's id (wrong rows).
const stockSum = sql<number>`(SELECT coalesce(sum(v.stock), 0) FROM product_variants v WHERE v.product_id = products.id)`;
const sizedVariants = sql<number>`(SELECT count(*) FROM product_variants v WHERE v.product_id = products.id AND v.size <> '')`;
const firstVariantId = sql<number>`(SELECT v.id FROM product_variants v WHERE v.product_id = products.id ORDER BY v.sort LIMIT 1)`;
const imagePath = sql<
  string | null
>`(SELECT i.path FROM product_images i WHERE i.product_id = products.id ORDER BY i.sort LIMIT 1)`;
const imageAlt = sql<
  string | null
>`(SELECT i.alt FROM product_images i WHERE i.product_id = products.id ORDER BY i.sort LIMIT 1)`;
// Available = active and at least one unit in stock across variants.
const available = and(eq(products.isActive, true), sql`${stockSum} > 0`);

const cardFields = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  sku: products.sku,
  price: products.price,
  oldPrice: products.oldPrice,
  isNew: products.isNew,
  isBestseller: products.isBestseller,
  stock: stockSum,
  sizedVariants,
  firstVariantId,
  imagePath,
  imageAlt,
};

const selectCards = () => getDb().select(cardFields).from(products);
type CardRow = Awaited<ReturnType<typeof selectCards>>[number];

function toCard(r: CardRow): ProductCardData {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    sku: r.sku,
    price: r.price,
    oldPrice: r.oldPrice,
    isNew: r.isNew,
    isBestseller: r.isBestseller,
    stock: r.stock,
    hasSizes: r.sizedVariants > 0,
    variantId: r.firstVariantId,
    image: r.imagePath ? { src: `/products/${r.imagePath}`, alt: r.imageAlt ?? r.name } : null,
  };
}

/**
 * Whole tree (2 levels) with counts of available products, for menus and category pages.
 * `cache` → one query per request even though the header and the page both ask for it.
 */
export const getCategoryTree = cache(async (): Promise<CategoryNode[]> => {
  const db = getDb();
  const rows = await db
    .select({
      id: categories.id,
      parentId: categories.parentId,
      slug: categories.slug,
      name: categories.name,
      productCount: sql<number>`(SELECT count(*) FROM products p WHERE p.category_id = categories.id AND p.is_active = 1 AND (SELECT coalesce(sum(v.stock), 0) FROM product_variants v WHERE v.product_id = p.id) > 0)`,
    })
    .from(categories)
    .orderBy(asc(categories.sort), asc(categories.name));

  const nodes = new Map<number, CategoryNode>(
    rows.map((r) => [
      r.id,
      { id: r.id, slug: r.slug, name: r.name, productCount: r.productCount, children: [] },
    ]),
  );
  const roots: CategoryNode[] = [];
  for (const r of rows) {
    const node = nodes.get(r.id)!;
    const parent = r.parentId ? nodes.get(r.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  for (const root of roots) {
    root.productCount += root.children.reduce((n, c) => n + c.productCount, 0);
  }
  return roots;
});

export type CategoryPage = {
  node: CategoryNode;
  parent: CategoryNode | null;
  description: string | null;
  tip: string | null;
  sizeChart: SizeChart | null;
};

/** Category by slug with its place in the tree; null → 404. */
export async function getCategoryPage(slug: string): Promise<CategoryPage | null> {
  const tree = await getCategoryTree();
  let node: CategoryNode | undefined;
  let parent: CategoryNode | null = null;
  for (const root of tree) {
    if (root.slug === slug) node = root;
    const child = root.children.find((c) => c.slug === slug);
    if (child) [node, parent] = [child, root];
    if (node) break;
  }
  if (!node) return null;

  const [row] = await getDb()
    .select({
      description: categories.description,
      tip: categories.tip,
      sizeChart: categories.sizeChart,
    })
    .from(categories)
    .where(eq(categories.id, node.id));
  return { node, parent, ...row };
}

/** Exported for listing.ts — same card shape everywhere. */
export { available, selectCards, toCard };

type Shelf = "sale" | "new" | "bestseller";
const shelfWhere: Record<Shelf, SQL | undefined> = {
  sale: isNotNull(products.oldPrice),
  new: eq(products.isNew, true),
  bestseller: eq(products.isBestseller, true),
};

/** Home page carousels. */
export async function getShelf(shelf: Shelf, limit = 12): Promise<ProductCardData[]> {
  const rows = await selectCards()
    .where(and(available, shelfWhere[shelf]))
    .orderBy(asc(products.sort), desc(products.id))
    .limit(limit);
  return rows.map(toCard);
}

/** Cards for given ids, in the given order (favourites). Unavailable products are skipped. */
export async function getProductCards(ids: number[]): Promise<ProductCardData[]> {
  if (!ids.length) return [];
  const rows = await selectCards().where(and(available, inArray(products.id, ids)));
  const byId = new Map(rows.map((r) => [r.id, toCard(r)]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}
