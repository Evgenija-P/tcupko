/**
 * Catalog listing state lives in the URL (GET form → shareable, works without JS).
 *   ?min=35&max=250        price, UAH
 *   ?f=Матеріал:брезент    attribute filter, repeatable (OR within a key, AND across keys)
 *   ?size=M&tag=slug       repeatable
 *   ?sale=1&new=1&bestseller=1
 *   ?sort=popular|price-asc|price-desc|new   ?page=2
 */
export const SORTS = {
  popular: "За популярністю",
  "price-asc": "Спочатку дешевші",
  "price-desc": "Спочатку дорожчі",
  new: "Спочатку нові",
} as const;
export type Sort = keyof typeof SORTS;

export type ListingParams = {
  min: number | null; // UAH
  max: number | null;
  attrs: Record<string, string[]>;
  sizes: string[];
  tags: string[];
  sale: boolean;
  isNew: boolean;
  bestseller: boolean;
  sort: Sort;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (v === undefined ? [] : [v].flat()).filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(list(v)[0]);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function parseListingParams(sp: RawSearchParams): ListingParams {
  const attrs: Record<string, string[]> = {};
  for (const pair of list(sp.f)) {
    const i = pair.indexOf(":");
    if (i <= 0) continue;
    (attrs[pair.slice(0, i)] ??= []).push(pair.slice(i + 1));
  }
  const sort = list(sp.sort)[0];
  return {
    min: num(sp.min),
    max: num(sp.max),
    attrs,
    sizes: list(sp.size),
    tags: list(sp.tag),
    sale: list(sp.sale)[0] === "1",
    isNew: list(sp.new)[0] === "1",
    bestseller: list(sp.bestseller)[0] === "1",
    sort: sort && sort in SORTS ? (sort as Sort) : "popular",
    page: Math.max(1, Math.floor(num(sp.page) ?? 1)),
  };
}

/** Same params without one value (for "remove filter" chips) or with another page. */
export function listingHref(
  path: string,
  sp: RawSearchParams,
  drop?: [string, string?],
  page?: number,
) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    for (const val of list(v)) {
      if (drop && drop[0] === k && (drop[1] === undefined || drop[1] === val)) continue;
      q.append(k, val);
    }
  }
  if (page && page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}
