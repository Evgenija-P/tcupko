"use client";

import { use } from "react";
import { ProductCard, type ProductCardData } from "@/components/catalog/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { useFavorites } from "@/lib/favorites";
import { getFavoriteCards } from "./actions";

// One request per distinct set of ids (a stable promise is required by `use`).
const requests = new Map<string, Promise<ProductCardData[]>>();
function load(ids: number[]) {
  const key = [...ids].sort((a, b) => a - b).join(",");
  if (!requests.has(key)) requests.set(key, getFavoriteCards(ids));
  return requests.get(key)!;
}

export function FavoritesList() {
  const ids = useFavorites();
  if (!ids.length) return <Empty />;
  return <Cards promise={load(ids)} />;
}

function Cards({ promise }: { promise: Promise<ProductCardData[]> }) {
  const cards = use(promise);
  if (!cards.length) return <Empty />;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {cards.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-surface p-10 text-center">
      <p className="text-lg font-medium">У вибраному поки порожньо</p>
      <p className="text-ink-muted">
        Натисніть на сердечко на картці товару, щоб зберегти його тут.
      </p>
      <ButtonLink href="/catalog">Перейти до каталогу</ButtonLink>
    </div>
  );
}
