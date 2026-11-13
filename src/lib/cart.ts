"use client";

import { createLocalStore } from "./local-store";

/** Only ids and quantities live in the browser; prices are always taken from the DB. */
export type CartLine = { variantId: number; qty: number };

const EMPTY: CartLine[] = [];
const store = createLocalStore<CartLine[]>("tcupko:cart", EMPTY);

export const useCart = store.useValue;

/** Adds `qty` of a variant, never above `max` (its stock). Returns the resulting quantity. */
export function addToCart(variantId: number, max: number, qty = 1): number {
  const lines = store.read();
  const current = lines.find((l) => l.variantId === variantId)?.qty ?? 0;
  const next = Math.min(current + qty, max);
  store.write(
    current
      ? lines.map((l) => (l.variantId === variantId ? { ...l, qty: next } : l))
      : [...lines, { variantId, qty: next }],
  );
  return next;
}
