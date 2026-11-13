const uah = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 2 });

/** Money is stored in kopecks (integers). 4200 → "42 ₴". */
export function formatPrice(kopecks: number): string {
  return `${uah.format(kopecks / 100)} ₴`;
}
