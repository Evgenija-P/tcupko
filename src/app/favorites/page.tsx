import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/base/Container";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { FavoritesList } from "./FavoritesList";

export const metadata: Metadata = {
  title: "Вибране",
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <main className="flex-1 py-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Вибране" }]} />
        <h1 className="text-[32px] leading-10 font-bold lg:text-h1">Вибране</h1>
        <Suspense fallback={<p className="text-ink-muted">Завантаження…</p>}>
          <FavoritesList />
        </Suspense>
      </Container>
    </main>
  );
}
