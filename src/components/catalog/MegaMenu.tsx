"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, LayoutGrid, X } from "lucide-react";
import { buttonClass } from "@/components/ui/Button";
import type { CategoryNode } from "@/db/queries/catalog";
import { pluralUk, productsWord } from "@/lib/plural";
import { CategoryIcon } from "./CategoryIcon";

/** Desktop "Каталог" button + mega menu (Figma "Mega menu / Desktop"). */
export function MegaMenu({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(tree[0]?.id);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = tree.find((c) => c.id === activeId) ?? tree[0];

  // close on Escape and outside click (link clicks close it via onClick on the panel)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mega-menu"
        onClick={() => setOpen((o) => !o)}
        className={buttonClass("primary", "m")}
      >
        {open ? <X aria-hidden /> : <LayoutGrid aria-hidden />}
        Каталог
      </button>

      {open && (
        <>
          <div className="fixed inset-x-0 top-20 bottom-0 z-30 bg-inverse/40" aria-hidden />
          <div
            id="mega-menu"
            onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
            className="absolute inset-x-0 top-[88px] z-40 mx-auto flex max-w-[1280px] overflow-hidden rounded-xl bg-page shadow-xl"
          >
            <ul className="w-80 shrink-0 border-r border-line-subtle py-3">
              {tree.map((c) => (
                <li key={c.id} className="px-2">
                  <Link
                    href={`/catalog/${c.slug}`}
                    onMouseEnter={() => setActiveId(c.id)}
                    onFocus={() => setActiveId(c.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base ${
                      c.id === active?.id ? "bg-accent-subtle text-ink-accent" : "hover:bg-surface"
                    }`}
                  >
                    <CategoryIcon slug={c.slug} className="size-7 shrink-0" />
                    <span className="flex-1">{c.name}</span>
                    <ChevronRight className="size-5 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {active && (
              <div className="flex-1 p-8">
                <div className="mb-6 flex items-center gap-4">
                  <p className="flex-1 text-2xl font-bold">{active.name}</p>
                  <Link
                    href={`/catalog/${active.slug}`}
                    className="flex items-center gap-1 font-medium text-ink-accent"
                  >
                    Всі товари категорії <ChevronRight className="size-5" aria-hidden />
                  </Link>
                </div>
                <ul className="grid grid-cols-4 gap-4">
                  {active.children.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/catalog/${s.slug}`}
                        className="flex h-full flex-col gap-3 rounded-xl bg-surface p-4 hover:bg-accent-subtle"
                      >
                        <span className="font-medium">{s.name}</span>
                        <span className="mt-auto text-xs text-ink-muted">
                          {pluralUk(s.productCount, productsWord)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
