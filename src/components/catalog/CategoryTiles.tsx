import Link from "next/link";
import type { CategoryNode } from "@/db/queries/catalog";
import { CategoryIcon } from "./CategoryIcon";

/** Figma "Category Tile". No category photos yet → the icon sits in the image slot. */
export function CategoryTiles({ categories }: { categories: CategoryNode[] }) {
  return (
    <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-8 lg:gap-4 lg:px-0 [&::-webkit-scrollbar]:hidden">
      {categories.map((c) => (
        <li key={c.id} className="w-[120px] shrink-0 lg:w-auto">
          <Link
            href={`/catalog/${c.slug}`}
            className="flex h-full flex-col gap-3 rounded-xl bg-surface p-3 hover:bg-accent-subtle"
          >
            <span className="flex h-16 items-center justify-center rounded-lg bg-page text-ink-accent lg:h-28">
              <CategoryIcon slug={c.slug} className="size-8 lg:size-10" />
            </span>
            <span className="text-sm font-medium">{c.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
