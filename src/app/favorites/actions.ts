"use server";

import type { ProductCardData } from "@/components/catalog/ProductCard";
import { getProductCards } from "@/db/queries/catalog";

const MAX = 100;

/** Favourite ids live in the browser; cards (prices, stock) always come from the DB. */
export async function getFavoriteCards(ids: unknown): Promise<ProductCardData[]> {
  if (!Array.isArray(ids)) return [];
  const clean = ids.filter((id): id is number => Number.isInteger(id) && id > 0).slice(0, MAX);
  return getProductCards(clean);
}
