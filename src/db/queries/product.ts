import "server-only";
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import type { ProductCardData } from "@/components/catalog/ProductCard";
import { getDb } from "@/db";
import {
  categories,
  productAttributes,
  productImages,
  products,
  productVariants,
} from "@/db/schema";
import { available, getCategoryTree, selectCards, toCard, type CategoryNode } from "./catalog";

export type ProductVariant = { id: number; size: string; price: number; stock: number };

export type ProductPage = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  isNew: boolean;
  isBestseller: boolean;
  variants: ProductVariant[];
  images: { src: string; alt: string }[];
  attributes: { key: string; value: string }[];
  category: CategoryNode;
  parentCategory: CategoryNode | null;
  sizeChart: string[][] | null;
  /** set ⇔ markdown item */
  defectNote: string | null;
  /** markdown → its available original; original → its available markdown copies */
  related: { slug: string; price: number }[];
};

/** Active product by slug (even when sold out — the page then says so); null → 404. */
export async function getProductPage(slug: string): Promise<ProductPage | null> {
  const db = getDb();
  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)));
  if (!p) return null;

  const [variants, images, attributes, tree] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, p.id))
      .orderBy(asc(productVariants.sort)),
    db
      .select({ path: productImages.path, alt: productImages.alt })
      .from(productImages)
      .where(eq(productImages.productId, p.id))
      .orderBy(asc(productImages.sort)),
    db
      .select({ key: productAttributes.key, value: productAttributes.value })
      .from(productAttributes)
      .where(eq(productAttributes.productId, p.id)),
    getCategoryTree(),
  ]);

  let category: CategoryNode | undefined;
  let parentCategory: CategoryNode | null = null;
  for (const root of tree) {
    if (root.id === p.categoryId) category = root;
    const child = root.children.find((c) => c.id === p.categoryId);
    if (child) [category, parentCategory] = [child, root];
    if (category) break;
  }
  if (!category) return null;

  // size chart: the product's category first, then its parent
  const charts = await db
    .select({ id: categories.id, chart: categories.sizeChart })
    .from(categories)
    .where(inArray(categories.id, [category.id, parentCategory?.id ?? 0]));
  const sizeChart =
    charts.find((c) => c.id === category!.id)?.chart ??
    charts.find((c) => c.id === parentCategory?.id)?.chart ??
    null;

  const related = await db
    .select({ slug: products.slug, price: products.price })
    .from(products)
    .where(
      and(available, p.originalId ? eq(products.id, p.originalId) : eq(products.originalId, p.id)),
    );

  return {
    defectNote: p.defectNote,
    related,
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: p.price,
    oldPrice: p.oldPrice,
    isNew: p.isNew,
    isBestseller: p.isBestseller,
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      price: v.price ?? p.price,
      stock: v.stock,
    })),
    images: images.map((i) => ({ src: `/products/${i.path}`, alt: i.alt })),
    attributes,
    category,
    parentCategory,
    sizeChart,
  };
}

/** Other available products of the same category. */
export async function getSimilar(
  productId: number,
  categoryId: number,
  limit = 4,
): Promise<ProductCardData[]> {
  const rows = await selectCards()
    .where(and(available, eq(products.categoryId, categoryId), ne(products.id, productId)))
    .orderBy(asc(products.sort))
    .limit(limit);
  return rows.map(toCard);
}
