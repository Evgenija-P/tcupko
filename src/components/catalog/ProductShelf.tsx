"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/base/SectionHeading";
import { ProductCard, type ProductCardData } from "./ProductCard";

type Props = {
  id: string;
  title: string;
  link: { href: string; label: string };
  products: ProductCardData[];
};

const arrow =
  "hidden size-10 items-center justify-center rounded-lg border border-line bg-page hover:bg-surface lg:flex";

/** Home carousel: horizontal scroll-snap row; arrows scroll by one viewport (desktop). */
export function ProductShelf({ id, title, link, products }: Props) {
  const rowRef = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) =>
    rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth, behavior: "smooth" });

  return (
    <section aria-labelledby={id}>
      <SectionHeading
        id={id}
        title={title}
        link={link}
        aside={
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Попередні"
              onClick={() => scroll(-1)}
              className={arrow}
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" aria-label="Наступні" onClick={() => scroll(1)} className={arrow}>
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </div>
        }
      />
      <ul
        ref={rowRef}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:scroll-px-0 lg:gap-6 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <li key={p.id} className="w-[171px] shrink-0 snap-start lg:w-[302px]">
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
