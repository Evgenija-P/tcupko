import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/base/Container";
import { Breadcrumbs, type Crumb } from "@/components/catalog/Breadcrumbs";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductListing } from "@/components/catalog/ProductListing";
import { getCategoryPage } from "@/db/queries/catalog";
import { listProducts } from "@/db/queries/listing";
import { parseListingParams } from "@/lib/listing-params";
import { pluralUk, productsWord } from "@/lib/plural";

export async function generateMetadata({
  params,
}: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const page = await getCategoryPage((await params).slug);
  if (!page) return {};
  return {
    title: page.node.name,
    description:
      page.description?.slice(0, 160) ??
      `${page.node.name} — в наявності на складі в Дніпрі, відправка Новою поштою, Укрпоштою, Meest.`,
    alternates: { canonical: `/catalog/${page.node.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/catalog/[slug]">) {
  const page = await getCategoryPage((await params).slug);
  if (!page) notFound();
  const { node, parent } = page;
  const sp = await searchParams;

  const crumbs: Crumb[] = [
    { label: "Головна", href: "/" },
    ...(parent ? [{ label: parent.name, href: `/catalog/${parent.slug}` }] : []),
    { label: node.name },
  ];
  const isTop = !parent && node.children.length > 0;

  return (
    <main className="flex-1 py-6">
      <Container className="flex flex-col gap-6">
        <Breadcrumbs items={crumbs} />
        <div>
          <h1 className="text-[32px] leading-10 font-bold lg:text-h1">{node.name}</h1>
          {!isTop && (
            <p className="mt-2 text-sm text-ink-muted">
              {pluralUk(node.productCount, productsWord)}
            </p>
          )}
        </div>

        {isTop ? (
          <TopCategory page={page} />
        ) : (
          <ProductListing
            path={`/catalog/${node.slug}`}
            scope={{ categoryIds: [node.id] }}
            searchParams={sp}
          />
        )}

        {page.description && (
          <section className="flex max-w-[860px] flex-col gap-3">
            <h2 className="text-2xl font-bold">{node.name}</h2>
            <p className="whitespace-pre-line text-ink-muted">{page.description}</p>
            {page.tip && <p className="whitespace-pre-line text-ink-muted">{page.tip}</p>}
          </section>
        )}
      </Container>
    </main>
  );
}

/** Figma "А · Захист рук": subcategory tiles + popular products of the whole category. */
async function TopCategory({
  page,
}: {
  page: NonNullable<Awaited<ReturnType<typeof getCategoryPage>>>;
}) {
  const ids = [page.node.id, ...page.node.children.map((c) => c.id)];
  const { items } = await listProducts({ categoryIds: ids }, parseListingParams({}));

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {page.node.children.map((c) => (
          <li key={c.id}>
            <Link
              href={`/catalog/${c.slug}`}
              className="flex h-full flex-col gap-2 rounded-xl bg-surface p-4 hover:bg-accent-subtle"
            >
              <span className="font-medium">{c.name}</span>
              <span className="mt-auto text-xs text-ink-muted">
                {pluralUk(c.productCount, productsWord)}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <section aria-labelledby="popular" className="flex flex-col gap-6">
          <h2 id="popular" className="text-2xl font-bold lg:text-h2">
            Популярні в категорії
          </h2>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
            {items.slice(0, 8).map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
