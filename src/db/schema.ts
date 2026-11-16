import { sql } from "drizzle-orm";
import {
  type AnySQLiteColumn,
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Rows of a size chart: first row is the header. */
export type SizeChart = string[][];

// Money columns are integers in kopecks.

export const categories = sqliteTable("categories", {
  id: integer().primaryKey({ autoIncrement: true }),
  parentId: integer().references((): AnySQLiteColumn => categories.id),
  slug: text().notNull().unique(),
  name: text().notNull(),
  description: text(),
  tip: text(), // «Порада з вибору»
  sizeChart: text({ mode: "json" }).$type<SizeChart>(),
  sort: integer().notNull().default(0),
});

export const products = sqliteTable(
  "products",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    sku: text().notNull().unique(), // «Код товару»
    slug: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    categoryId: integer()
      .notNull()
      .references(() => categories.id),
    price: integer().notNull(),
    oldPrice: integer(), // set = on sale
    isNew: integer({ mode: "boolean" }).notNull().default(false),
    isBestseller: integer({ mode: "boolean" }).notNull().default(false),
    sort: integer().notNull().default(0),
    isActive: integer({ mode: "boolean" }).notNull().default(true),
    /**
     * Lower-cased name + sku + category + attribute values (see `toSearchText`). SQLite's
     * LIKE/lower() are case-insensitive for ASCII only, so Cyrillic is normalised in JS.
     */
    searchText: text().notNull().default(""),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    check("products_price_positive", sql`${t.price} > 0`),
  ],
);

/**
 * Every product has ≥ 1 variant; `size` is "" for products without sizes (not NULL: SQLite
 * treats NULLs as distinct, which would break the unique index and seed upserts).
 * Stock lives here.
 */
export const productVariants = sqliteTable(
  "product_variants",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    productId: integer()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text().notNull().default(""),
    price: integer(), // null = product price
    stock: integer().notNull().default(0),
    sort: integer().notNull().default(0),
  },
  (t) => [
    uniqueIndex("variants_product_size_uq").on(t.productId, t.size),
    check("variants_stock_non_negative", sql`${t.stock} >= 0`),
  ],
);

/** Free-form characteristics (material, brand, diameter…) — filters are built from these. */
export const productAttributes = sqliteTable(
  "product_attributes",
  {
    productId: integer()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    key: text().notNull(),
    value: text().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.key, t.value] }),
    index("attributes_key_value_idx").on(t.key, t.value),
  ],
);

/** Cross-category "purpose" (захист рук, зварювання…). */
export const tags = sqliteTable("tags", {
  id: integer().primaryKey({ autoIncrement: true }),
  slug: text().notNull().unique(),
  name: text().notNull(),
});

export const productTags = sqliteTable(
  "product_tags",
  {
    productId: integer()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: integer()
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.tagId] })],
);

/** Requests that are not orders: "buy in one click", contact form, wholesale form. */
export const leads = sqliteTable("leads", {
  id: integer().primaryKey({ autoIncrement: true }),
  type: text({ enum: ["one_click", "contact", "wholesale"] }).notNull(),
  name: text(),
  phone: text().notNull(),
  email: text(),
  /** one_click: { variantId, qty, productName, size, price }; forms: { message } */
  payload: text({ mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  ownerNotifiedAt: integer({ mode: "timestamp" }),
});

/** `path` is relative to `public/products/`. */
export const productImages = sqliteTable(
  "product_images",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    productId: integer()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    path: text().notNull(),
    alt: text().notNull(),
    sort: integer().notNull().default(0),
  },
  (t) => [index("images_product_idx").on(t.productId)],
);
