"use server";

import { asc, desc } from "drizzle-orm";
import { getCategoryTree, selectCards } from "@/db/queries/catalog";
import { scopeWhere } from "@/db/queries/listing";
import { products } from "@/db/schema";
import { searchWords, toSearchText } from "@/lib/search-text";

export type Suggestions = {
  products: { slug: string; name: string; sku: string; price: number; image: string | null }[];
  categories: { href: string; label: string }[];
};

const EMPTY: Suggestions = { products: [], categories: [] };

/** Header dropdown: 5 products + 3 categories (Figma "Search suggestions"). */
export async function getSuggestions(q: unknown): Promise<Suggestions> {
  if (typeof q !== "string" || q.length > 100) return EMPTY;
  const words = searchWords(q);
  if (!words.length) return EMPTY;

  const [rows, tree] = await Promise.all([
    selectCards()
      .where(scopeWhere({ words }))
      .orderBy(desc(products.isBestseller), asc(products.sort))
      .limit(5),
    getCategoryTree(),
  ]);

  const categories: Suggestions["categories"] = [];
  for (const root of tree) {
    for (const node of [root, ...root.children]) {
      const label = node === root ? node.name : `${root.name} → ${node.name}`;
      const text = toSearchText(node.name);
      if (node.productCount > 0 && words.every((w) => text.includes(w))) {
        categories.push({ href: `/catalog/${node.slug}`, label });
      }
    }
  }

  return {
    products: rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      sku: r.sku,
      price: r.price,
      image: r.imagePath ? `/products/${r.imagePath}` : null,
    })),
    categories: categories.slice(0, 3),
  };
}
