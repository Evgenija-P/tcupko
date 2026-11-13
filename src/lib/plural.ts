const rules = new Intl.PluralRules("uk-UA");

/** pluralUk(5, ["товар", "товари", "товарів"]) → "5 товарів" */
export function pluralUk(n: number, [one, few, many]: [string, string, string]): string {
  const form = rules.select(n);
  return `${n} ${form === "one" ? one : form === "few" ? few : many}`;
}

export const productsWord: [string, string, string] = ["товар", "товари", "товарів"];
