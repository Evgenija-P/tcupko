import Link from "next/link";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import { listProducts, getFacets, PAGE_SIZE, type Scope } from "@/db/queries/listing";
import { listingHref, parseListingParams, type RawSearchParams } from "@/lib/listing-params";
import { pluralUk, productsWord } from "@/lib/plural";
import { AutoSubmitForm } from "./AutoSubmitForm";
import { ProductCard } from "./ProductCard";
import { SortSelect } from "./SortSelect";

type Props = {
  path: string;
  scope: Scope;
  searchParams: RawSearchParams;
  /** Params that filters must not drop, e.g. `{ q }` on /search. */
  keep?: Record<string, string>;
};

/** Filters + sort + grid + pagination (Figma "Б · Рукавиці брезентові"). */
export async function ProductListing({ path, scope, searchParams: sp, keep = {} }: Props) {
  const params = parseListingParams(sp);
  const resetHref = listingHref(path, keep);
  const [{ items, total }, facets] = await Promise.all([
    listProducts(scope, params),
    getFacets(scope),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const chips: { label: string; drop: [string, string?] }[] = [
    ...(params.min || params.max
      ? [{ label: `Ціна: ${params.min ?? 0}–${params.max ?? "…"} ₴`, drop: ["min"] as [string] }]
      : []),
    ...(params.sale ? [{ label: "Зі знижкою", drop: ["sale"] as [string] }] : []),
    ...(params.isNew ? [{ label: "Новинки", drop: ["new"] as [string] }] : []),
    ...(params.bestseller ? [{ label: "Бестселери", drop: ["bestseller"] as [string] }] : []),
    ...params.conds.map((c) => ({
      label: c === "markdown" ? "Уцінка" : "Новий",
      drop: ["cond", c] as [string, string],
    })),
    ...params.sizes.map((s) => ({ label: `Розмір: ${s}`, drop: ["size", s] as [string, string] })),
    ...params.tags.map((t) => ({
      label:
        facets.groups.find((g) => g.param === "tag")?.values.find((v) => v.value === t)?.label ?? t,
      drop: ["tag", t] as [string, string],
    })),
    ...Object.entries(params.attrs).flatMap(([k, vals]) =>
      vals.map((v) => ({ label: `${k}: ${v}`, drop: ["f", `${k}:${v}`] as [string, string] })),
    ),
  ];
  // the max chip also drops "max"
  const chipHref = (drop: [string, string?]) =>
    drop[0] === "min"
      ? listingHref(path, { ...sp, max: undefined }, drop)
      : listingHref(path, sp, drop);

  const isChecked = (param: string, value: string) =>
    param === "size"
      ? params.sizes.includes(value)
      : param === "tag"
        ? params.tags.includes(value)
        : param === "cond"
          ? (params.conds as string[]).includes(value)
          : false;

  const filters = (
    <AutoSubmitForm
      action={path}
      id="filters"
      className="mt-4 hidden flex-col divide-y divide-line-subtle peer-checked:flex lg:mt-0 lg:flex"
    >
      {Object.entries(keep).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <fieldset className="pb-4">
        <legend className="mb-3 font-medium">Ціна, ₴</legend>
        <div className="flex gap-3">
          <label className="flex-1 text-sm text-ink-muted">
            Від
            <input
              type="number"
              name="min"
              min={0}
              inputMode="numeric"
              defaultValue={params.min ?? ""}
              placeholder={String(facets.priceMin)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-base text-ink"
            />
          </label>
          <label className="flex-1 text-sm text-ink-muted">
            До
            <input
              type="number"
              name="max"
              min={0}
              inputMode="numeric"
              defaultValue={params.max ?? ""}
              placeholder={String(facets.priceMax)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-base text-ink"
            />
          </label>
        </div>
      </fieldset>

      {facets.groups.map((g) => (
        <fieldset key={g.key} className="py-4">
          <legend className="mb-3 font-medium">{g.title}</legend>
          <ul className="flex flex-col gap-2">
            {g.values.map((v) => {
              const value = g.param === "f" ? `${g.key}:${v.value}` : v.value;
              const checked =
                g.param === "f"
                  ? (params.attrs[g.key] ?? []).includes(v.value)
                  : isChecked(g.param, v.value);
              return (
                <li key={v.value}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name={g.param}
                      value={value}
                      defaultChecked={checked}
                      className="size-4 accent-accent"
                    />
                    {v.label} <span className="text-ink-muted">({v.count})</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      {facets.saleCount > 0 && (
        <fieldset className="py-4">
          <legend className="mb-3 font-medium">Акції</legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="sale"
              value="1"
              defaultChecked={params.sale}
              className="size-4 accent-accent"
            />
            Товари зі знижкою <span className="text-ink-muted">({facets.saleCount})</span>
          </label>
        </fieldset>
      )}
      {params.isNew && <input type="hidden" name="new" value="1" />}
      {params.bestseller && <input type="hidden" name="bestseller" value="1" />}

      <div className="pt-4">
        <button type="submit" className={buttonClass("secondary", "s", "w-full")}>
          Застосувати
        </button>
      </div>
    </AutoSubmitForm>
  );

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* One form: a sidebar on desktop, toggled by a CSS checkbox on mobile */}
      <aside className="rounded-lg border border-line p-4 lg:w-[248px] lg:shrink-0 lg:border-0 lg:p-0">
        <input type="checkbox" id="filters-toggle" className="peer sr-only" />
        <label
          htmlFor="filters-toggle"
          className="flex cursor-pointer items-center gap-2 font-medium lg:hidden"
        >
          <SlidersHorizontal className="size-5" aria-hidden /> Фільтри
          {chips.length > 0 && <span className="text-ink-accent">({chips.length})</span>}
        </label>
        <h2 className="mb-4 hidden text-lg font-semibold lg:block">Фільтри</h2>
        {filters}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <p className="flex-1 text-sm text-ink-muted">Знайдено {pluralUk(total, productsWord)}</p>
          <SortSelect formId="filters" value={params.sort} />
        </div>

        {chips.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <li key={c.label}>
                <Link
                  href={chipHref(c.drop)}
                  className="flex items-center gap-1 rounded-full bg-accent-subtle px-3 py-1.5 text-xs hover:bg-line-subtle"
                  aria-label={`Прибрати фільтр ${c.label}`}
                >
                  {c.label} <X className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
            <li>
              <Link href={resetHref} className="px-2 text-xs font-medium text-ink-accent">
                Скинути все
              </Link>
            </li>
          </ul>
        )}

        {items.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
            {items.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-surface p-10 text-center">
            <p className="text-lg font-medium">Немає товарів за цими фільтрами</p>
            <Link href={resetHref} className={buttonClass("secondary")}>
              Скинути фільтри
            </Link>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Сторінки" className="mt-4 flex items-center justify-center gap-2">
            {params.page > 1 && (
              <Link
                href={listingHref(path, sp, undefined, params.page - 1)}
                aria-label="Попередня сторінка"
                className="flex size-10 items-center justify-center rounded-lg border border-line"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </Link>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={listingHref(path, sp, undefined, n)}
                aria-current={n === params.page ? "page" : undefined}
                className={`flex size-10 items-center justify-center rounded-lg text-sm ${
                  n === params.page ? "bg-accent text-white" : "hover:bg-surface"
                }`}
              >
                {n}
              </Link>
            ))}
            {params.page < pages && (
              <Link
                href={listingHref(path, sp, undefined, params.page + 1)}
                aria-label="Наступна сторінка"
                className="flex size-10 items-center justify-center rounded-lg border border-line"
              >
                <ChevronRight className="size-5" aria-hidden />
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
