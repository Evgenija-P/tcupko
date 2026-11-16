/**
 * Normalisation for search: lower case (Unicode-aware), unified apostrophes, single spaces.
 * KEEP IN SYNC with `norm` in scripts/seed.mts (it fills products.search_text).
 */
export function toSearchText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'ʼ`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Краги  спилок" → ["краги", "спилок"]; every word must match. */
export function searchWords(q: string): string[] {
  return toSearchText(q)
    .split(" ")
    .filter((w) => w.length >= 2)
    .slice(0, 6);
}
