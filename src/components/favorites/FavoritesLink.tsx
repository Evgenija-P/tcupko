"use client";

import { Heart } from "lucide-react";
import { HeaderAction } from "@/components/layout/HeaderAction";
import { useFavorites } from "@/lib/favorites";

export function FavoritesLink({ showLabel = true }: { showLabel?: boolean }) {
  const favorites = useFavorites();
  return (
    <HeaderAction
      href="/favorites"
      icon={<Heart aria-hidden />}
      label="Вибране"
      showLabel={showLabel}
      count={favorites.length}
    />
  );
}
