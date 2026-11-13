import type { Metadata } from "next";
import { Container } from "@/components/base/Container";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CategoryTiles } from "@/components/catalog/CategoryTiles";
import { ProductListing } from "@/components/catalog/ProductListing";
import { getCategoryTree } from "@/db/queries/catalog";
import { parseListingParams } from "@/lib/listing-params";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Усі засоби захисту та витратні матеріали в наявності.",
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const sp = await searchParams;
  const p = parseListingParams(sp);
  const tree = await getCategoryTree();
  const title = p.sale ? "Акції" : p.isNew ? "Новинки" : p.bestseller ? "Бестселери" : "Каталог";

  return (
    <main className="flex-1 py-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumbs items={[{ label: "Головна", href: "/" }, { label: title }]} />
        <h1 className="text-[32px] leading-10 font-bold lg:text-h1">{title}</h1>
        {title === "Каталог" && <CategoryTiles categories={tree} />}
        <ProductListing path="/catalog" scope={{}} searchParams={sp} />
      </Container>
    </main>
  );
}
