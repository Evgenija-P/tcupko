"use client";

import { createLocalStore } from "./local-store";

const EMPTY: number[] = [];
const store = createLocalStore<number[]>("tcupko:favorites", EMPTY);

/** Product ids the visitor marked as favourite (stored in this browser only). */
export const useFavorites = store.useValue;

export function toggleFavorite(productId: number) {
  const current = store.read();
  store.write(
    current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId],
  );
}
