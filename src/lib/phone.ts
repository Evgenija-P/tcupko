/**
 * Ukrainian mobile/landline → "+380XXXXXXXXX", or null if it can't be one.
 * Accepts "063 204 66 48", "+38 (063) 204-66-48", "380632046648", "0632046648".
 */
export function normalizeUaPhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("380")) d = d.slice(3);
  else if (d.startsWith("80")) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);
  return /^\d{9}$/.test(d) ? `+380${d}` : null;
}
