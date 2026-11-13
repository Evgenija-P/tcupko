"use client";

import { Heart } from "lucide-react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

/** Heart toggle on a product card / product page. */
export function FavoriteButton({
  productId,
  className = "",
}: {
  productId: number;
  className?: string;
}) {
  const active = useFavorites().includes(productId);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Прибрати з вибраного" : "Додати у вибране"}
      onClick={() => toggleFavorite(productId)}
      className={`flex size-10 items-center justify-center rounded-lg border border-line bg-page text-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      <Heart className={`size-5 ${active ? "fill-accent text-accent" : ""}`} aria-hidden />
    </button>
  );
}
