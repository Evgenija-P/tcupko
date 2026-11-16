"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Package, Search } from "lucide-react";
import { getSuggestions, type Suggestions } from "@/app/search/actions";
import { buttonClass } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

/** Header search with suggestions; a plain GET form to /search without JS. */
export function SearchBox({
  defaultValue = "",
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState(defaultValue);
  const [data, setData] = useState<Suggestions | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLFormElement>(null);
  const reqId = useRef(0);

  function onInput(value: string) {
    setQ(value);
    setOpen(true);
    const id = ++reqId.current;
    if (value.trim().length < 2) {
      setData(null);
      return;
    }
    // debounce; a later keystroke makes this request stale
    setTimeout(async () => {
      if (id !== reqId.current) return;
      const res = await getSuggestions(value);
      if (id === reqId.current) setData(res);
    }, 250);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const empty = data && !data.products.length && !data.categories.length;
  const show = open && q.trim().length >= 2 && data;

  return (
    <form
      ref={rootRef}
      action="/search"
      role="search"
      className="relative flex-1"
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
    >
      <label className="flex items-center gap-2 rounded-lg border border-line bg-page px-4 py-3 focus-within:border-line-strong">
        <Search className="size-6 shrink-0 text-ink" aria-hidden />
        <span className="sr-only">Пошук товарів</span>
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => onInput(e.target.value)}
          onFocus={() => setOpen(true)}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          placeholder="Пошук товарів або код товару"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={Boolean(show)}
          className="w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
        />
      </label>

      {show && (
        <div
          id="search-suggestions"
          className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl bg-page py-3 shadow-xl"
        >
          {empty ? (
            <p className="px-4 py-2 text-sm text-ink-muted">Нічого не знайдено</p>
          ) : (
            <>
              {data.products.length > 0 && (
                <>
                  <p className="px-4 pb-1 text-xs font-semibold text-ink-muted uppercase">Товари</p>
                  <ul>
                    {data.products.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/product/${p.slug}`}
                          className="flex items-center gap-3 px-4 py-1.5 hover:bg-surface"
                        >
                          <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                            {p.image ? (
                              <Image
                                src={p.image}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-contain"
                              />
                            ) : (
                              <Package className="size-5 text-ink-muted" aria-hidden />
                            )}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm">{p.name}</span>
                            <span className="text-xs text-ink-muted">Код: {p.sku}</span>
                          </span>
                          <span className="font-semibold">{formatPrice(p.price)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {data.categories.length > 0 && (
                <>
                  <p className="mt-2 border-t border-line-subtle px-4 pt-3 pb-1 text-xs font-semibold text-ink-muted uppercase">
                    Категорії
                  </p>
                  <ul>
                    {data.categories.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block px-4 py-1.5 text-sm hover:bg-surface">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="px-2 pt-2">
                <button type="submit" className={buttonClass("ghost", "s")}>
                  Показати всі результати
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </form>
  );
}
