"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import type { CategoryNode } from "@/db/queries/catalog";
import { CategoryIcon } from "./CategoryIcon";

/** Mobile burger + full-screen catalog with 2 levels (Figma "Catalog drawer / Mobile"). */
export function CatalogDrawer({ tree }: { tree: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);
  const parent = tree.find((c) => c.id === parentId);

  const close = () => {
    setOpen(false);
    setParentId(null);
  };

  // lock page scroll while the drawer covers the screen
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const row = "flex items-center gap-3 border-b border-line-subtle py-4 text-base";

  return (
    <>
      <button
        type="button"
        aria-label="Відкрити каталог"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-ml-2 p-2"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Каталог"
          className="fixed inset-0 z-50 flex flex-col bg-page"
          onClick={(e) => (e.target as HTMLElement).closest("a") && close()}
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line-subtle px-4">
            {parent ? (
              <>
                <button
                  type="button"
                  onClick={() => setParentId(null)}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                  Назад
                </button>
                <p className="flex-1 truncate text-lg font-semibold">{parent.name}</p>
              </>
            ) : (
              <p className="flex-1 text-lg font-semibold">Каталог</p>
            )}
            <button type="button" aria-label="Закрити" onClick={close} className="p-1" autoFocus>
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto px-4">
            {parent ? (
              <>
                <li>
                  <Link href={`/catalog/${parent.slug}`} className={`${row} font-medium`}>
                    <span className="flex-1">Всі товари категорії</span>
                    <ChevronRight className="size-5" aria-hidden />
                  </Link>
                </li>
                {parent.children.map((s) => (
                  <li key={s.id}>
                    <Link href={`/catalog/${s.slug}`} className={row}>
                      <span className="flex-1">{s.name}</span>
                      <ChevronRight className="size-5" aria-hidden />
                    </Link>
                  </li>
                ))}
              </>
            ) : (
              tree.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setParentId(c.id)}
                    className={`${row} w-full text-left`}
                  >
                    <CategoryIcon slug={c.slug} className="size-8 shrink-0" />
                    <span className="flex-1">{c.name}</span>
                    <ChevronRight className="size-5" aria-hidden />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </>
  );
}
