import type { Metadata } from "next";
import { Container } from "@/components/base/Container";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { ProductListing } from "@/components/catalog/ProductListing";
import { SearchBox } from "@/components/search/SearchBox";
import { getCategoryTree } from "@/db/queries/catalog";
import { listProducts } from "@/db/queries/listing";
import { parseListingParams } from "@/lib/listing-params";
import { searchWords } from "@/lib/search-text";

export const metadata: Metadata = { title: "Пошук", robots: { index: false } };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = String([sp.q].flat()[0] ?? "").slice(0, 100);
  const words = searchWords(q);
  // empty result for the bare query → show the catalog instead of an empty filter panel
  const found = words.length ? (await listProducts({ words }, parseListingParams({}))).total : 0;

  return (
    <main className="flex-1 py-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: "Пошук" }]} />
        {/* mobile: the header has only an icon, the field lives here */}
        <div className="lg:hidden">
          <SearchBox defaultValue={q} autoFocus={!q} />
        </div>
        <h1 className="text-[32px] leading-10 font-bold lg:text-h1">
          {q ? `Пошук «${q}»` : "Пошук"}
        </h1>

        {words.length && found ? (
          <ProductListing path="/search" scope={{ words }} searchParams={sp} keep={{ q }} />
        ) : (
          <NothingFound q={q} />
        )}
      </Container>
    </main>
  );
}

async function NothingFound({ q }: { q: string }) {
  const tree = await getCategoryTree();
  return (
    <div className="flex flex-col gap-6">
      {q && (
        <div className="rounded-xl bg-surface p-6">
          <p className="text-lg font-medium">За запитом «{q}» нічого не знайдено</p>
          <p className="mt-1 text-ink-muted">
            Перевірте написання, спробуйте коротше слово або код товару. Або подивіться категорії:
          </p>
        </div>
      )}
      <CategoryTiles categories={tree} />
    </div>
  );
}
