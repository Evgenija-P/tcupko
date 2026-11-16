/**
 * Catalog JSON в†’ SQL for D1 (`.wrangler/seed.sql`). Run via `npm run db:seed:local|remote`.
 *
 * Safe to re-run: everything is an upsert keyed by slug / sku / (product, size).
 * - Prices, names, descriptions, flags, attributes, tags, images are overwritten from the file.
 * - Stock of an EXISTING variant is never overwritten (orders decrement it). New variants get
 *   the stock from the file. To force a stock value set `"forceStock": true` on that variant.
 * - Products missing from the file are hidden (`is_active = 0`), never deleted.
 *
 * Prices in the file are in UAH (e.g. 42.5); the DB stores kopecks.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Category = {
  slug: string;
  name: string;
  parent?: string;
  description?: string;
  tip?: string;
  sizeChart?: string[][];
  sort?: number;
};
type Variant = { size?: string; price?: number; stock: number; forceStock?: boolean };
type Product = {
  sku: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  description?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  sort?: number;
  tags?: string[];
  attributes?: Record<string, string | string[]>;
  variants: Variant[];
  images?: { path: string; alt: string }[];
};
type Catalog = {
  categories: Category[];
  tags: { slug: string; name: string }[];
  products: Product[];
};

// Several files are merged (e.g. catalog.json + demo-products.json for the local DB).
const files = process.argv.slice(2);
if (!files.length) throw new Error("Usage: node scripts/seed.mts <catalog.json> [more.jsonвЂ¦]");
const catalog: Catalog = { categories: [], tags: [], products: [] };
for (const f of files) {
  const part = JSON.parse(readFileSync(f, "utf8")) as Partial<Catalog>;
  catalog.categories.push(...(part.categories ?? []));
  catalog.tags.push(...(part.tags ?? []));
  catalog.products.push(...(part.products ?? []));
}

// ---------- validation: fail loudly before touching the DB ----------
const errors: string[] = [];
const catSlugs = new Set(catalog.categories.map((c) => c.slug));
const tagSlugs = new Set(catalog.tags.map((t) => t.slug));
const seen = { sku: new Set<string>(), slug: new Set<string>() };

for (const c of catalog.categories) {
  if (c.parent && !catSlugs.has(c.parent))
    errors.push(`category ${c.slug}: unknown parent ${c.parent}`);
}
for (const p of catalog.products) {
  const at = `product ${p.sku}`;
  if (seen.sku.has(p.sku)) errors.push(`${at}: duplicate sku`);
  if (seen.slug.has(p.slug)) errors.push(`${at}: duplicate slug ${p.slug}`);
  seen.sku.add(p.sku);
  seen.slug.add(p.slug);
  if (!catSlugs.has(p.category)) errors.push(`${at}: unknown category ${p.category}`);
  if (!(p.price > 0)) errors.push(`${at}: price must be > 0`);
  if (p.oldPrice !== undefined && p.oldPrice <= p.price)
    errors.push(`${at}: oldPrice must be > price`);
  if (!p.variants?.length) errors.push(`${at}: needs at least one variant`);
  const sizes = p.variants.map((v) => v.size ?? "");
  if (new Set(sizes).size !== sizes.length) errors.push(`${at}: duplicate variant size`);
  if (sizes.includes("") && sizes.length > 1)
    errors.push(`${at}: mix of sized and size-less variants`);
  for (const v of p.variants) {
    if (!Number.isInteger(v.stock) || v.stock < 0)
      errors.push(`${at}: stock must be an integer в‰Ґ 0`);
  }
  for (const t of p.tags ?? []) if (!tagSlugs.has(t)) errors.push(`${at}: unknown tag ${t}`);
}
if (errors.length) {
  console.error(`Catalog has ${errors.length} error(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

// ---------- SQL ----------
const q = (v: string | number | boolean | null | undefined): string => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "number") return String(v);
  return `'${v.replaceAll("'", "''")}'`;
};
const kop = (uah: number | undefined) => (uah === undefined ? null : Math.round(uah * 100));
// KEEP IN SYNC with toSearchText in src/lib/search-text.ts
const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'ʼ`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
const catName = new Map(catalog.categories.map((c) => [c.slug, c]));
const searchText = (p: Product) => {
  const cat = catName.get(p.category);
  const parent = cat?.parent ? catName.get(cat.parent) : undefined;
  const attrs = Object.values(p.attributes ?? {}).flat();
  return norm([p.name, p.sku, cat?.name, parent?.name, ...attrs].filter(Boolean).join(" "));
};
const catId = (slug: string) => `(SELECT id FROM categories WHERE slug = ${q(slug)})`;
const prodId = (sku: string) => `(SELECT id FROM products WHERE sku = ${q(sku)})`;

const sql: string[] = [];

// parents first, so the parent subquery resolves
const ordered = [...catalog.categories].sort((a, b) => Number(!!a.parent) - Number(!!b.parent));
for (const c of ordered) {
  sql.push(
    `INSERT INTO categories (slug, name, parent_id, description, tip, size_chart, sort)
VALUES (${q(c.slug)}, ${q(c.name)}, ${c.parent ? catId(c.parent) : "NULL"}, ${q(c.description)}, ${q(c.tip)}, ${q(c.sizeChart ? JSON.stringify(c.sizeChart) : null)}, ${c.sort ?? 0})
ON CONFLICT (slug) DO UPDATE SET name = excluded.name, parent_id = excluded.parent_id, description = excluded.description, tip = excluded.tip, size_chart = excluded.size_chart, sort = excluded.sort;`,
  );
}

for (const t of catalog.tags) {
  sql.push(
    `INSERT INTO tags (slug, name) VALUES (${q(t.slug)}, ${q(t.name)}) ON CONFLICT (slug) DO UPDATE SET name = excluded.name;`,
  );
}

sql.push(
  `UPDATE products SET is_active = 0 WHERE sku NOT IN (${catalog.products.map((p) => q(p.sku)).join(", ") || "''"});`,
);

for (const p of catalog.products) {
  sql.push(
    `INSERT INTO products (sku, slug, name, description, category_id, price, old_price, is_new, is_bestseller, sort, is_active, search_text)
VALUES (${q(p.sku)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.description)}, ${catId(p.category)}, ${kop(p.price)}, ${q(kop(p.oldPrice))}, ${q(!!p.isNew)}, ${q(!!p.isBestseller)}, ${p.sort ?? 0}, 1, ${q(searchText(p))})
ON CONFLICT (sku) DO UPDATE SET slug = excluded.slug, name = excluded.name, description = excluded.description, category_id = excluded.category_id, price = excluded.price, old_price = excluded.old_price, is_new = excluded.is_new, is_bestseller = excluded.is_bestseller, sort = excluded.sort, is_active = 1, search_text = excluded.search_text;`,
  );

  const id = prodId(p.sku);
  p.variants.forEach((v, i) => {
    const stockUpdate = v.forceStock ? ", stock = excluded.stock" : "";
    sql.push(
      `INSERT INTO product_variants (product_id, size, price, stock, sort) VALUES (${id}, ${q(v.size ?? "")}, ${q(kop(v.price))}, ${v.stock}, ${i})
ON CONFLICT (product_id, size) DO UPDATE SET price = excluded.price, sort = excluded.sort${stockUpdate};`,
    );
  });
  const sizes = p.variants.map((v) => q(v.size ?? "")).join(", ");
  // a removed size can still be referenced by past orders в†’ keep the row, just empty its stock
  sql.push(
    `UPDATE product_variants SET stock = 0 WHERE product_id = ${id} AND size NOT IN (${sizes});`,
  );

  sql.push(`DELETE FROM product_attributes WHERE product_id = ${id};`);
  for (const [key, value] of Object.entries(p.attributes ?? {})) {
    for (const v of Array.isArray(value) ? value : [value]) {
      sql.push(
        `INSERT INTO product_attributes (product_id, key, value) VALUES (${id}, ${q(key)}, ${q(v)});`,
      );
    }
  }

  sql.push(`DELETE FROM product_tags WHERE product_id = ${id};`);
  for (const t of p.tags ?? []) {
    sql.push(
      `INSERT INTO product_tags (product_id, tag_id) VALUES (${id}, (SELECT id FROM tags WHERE slug = ${q(t)}));`,
    );
  }

  sql.push(`DELETE FROM product_images WHERE product_id = ${id};`);
  (p.images ?? []).forEach((img, i) => {
    sql.push(
      `INSERT INTO product_images (product_id, path, alt, sort) VALUES (${id}, ${q(img.path)}, ${q(img.alt)}, ${i});`,
    );
  });
}

mkdirSync(".wrangler", { recursive: true });
writeFileSync(".wrangler/seed.sql", sql.join("\n") + "\n");
console.log(
  `seed.sql: ${catalog.categories.length} categories, ${catalog.tags.length} tags, ${catalog.products.length} products`,
);
