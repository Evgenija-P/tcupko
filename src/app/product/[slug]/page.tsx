import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgePercent, Banknote, RotateCcw, TriangleAlert, Truck } from "lucide-react";
import { Container } from "@/components/base/Container";
import { JsonLd } from "@/components/base/JsonLd";
import { Breadcrumbs, type Crumb } from "@/components/catalog/Breadcrumbs";
import { ProductCard } from "@/components/catalog/ProductCard";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Badge } from "@/components/ui/Badge";
import { DISCOUNT_MIN_QTY, DISCOUNT_MIN_SUBTOTAL, DISCOUNT_PERCENT } from "@/constants/pricing";
import { SITE_URL } from "@/constants/site";
import { getProductPage, getSimilar } from "@/db/queries/product";
import { formatPrice } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/product/[slug]">): Promise<Metadata> {
  const p = await getProductPage((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description:
      p.description?.slice(0, 160) ??
      `${p.name} — ${formatPrice(p.price)}. В наявності в Дніпрі, відправка Новою поштою, Укрпоштою, Meest.`,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { images: p.images[0] ? [p.images[0].src] : undefined },
  };
}

const conditions = [
  {
    icon: Truck,
    title: "Доставка",
    text: "Нова пошта, Укрпошта, Meest, самовивіз у Дніпрі. Відправка щосереди та щосуботи",
  },
  {
    icon: Banknote,
    title: "Оплата",
    text: "На рахунок (IBAN), накладений платіж (Нова пошта), готівкою при самовивозі",
  },
  { icon: RotateCcw, title: "Повернення", text: "Обмін та повернення протягом 14 днів" },
];

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const p = await getProductPage((await params).slug);
  const stock = p?.variants.reduce((n, v) => n + v.stock, 0) ?? 0;
  // sold out = removed from the shop (no restocking), see CLAUDE.md
  if (!p || stock === 0) notFound();
  const similar = await getSimilar(p.id, p.category.id);

  const salePercent = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const discounted = Math.round(p.price * (1 - DISCOUNT_PERCENT / 100));

  const crumbs: Crumb[] = [
    { label: "Головна", href: "/" },
    ...(p.parentCategory
      ? [{ label: p.parentCategory.name, href: `/catalog/${p.parentCategory.slug}` }]
      : []),
    { label: p.category.name, href: `/catalog/${p.category.slug}` },
    { label: p.name },
  ];

  return (
    <main className="flex-1 py-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          sku: p.sku,
          description: p.description ?? undefined,
          image: p.images.map((i) => `${SITE_URL}${i.src}`),
          offers: {
            "@type": "Offer",
            url: `${SITE_URL}/product/${p.slug}`,
            priceCurrency: "UAH",
            price: (p.price / 100).toFixed(2),
            availability: "https://schema.org/InStock",
          },
        }}
      />
      <Container className="flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-6">
          <Breadcrumbs items={crumbs} />

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <div className="lg:w-[624px] lg:shrink-0">
              <ProductGallery images={p.images} name={p.name} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {p.defectNote ? (
                    <Badge tone="markdown">Уцінка</Badge>
                  ) : (
                    p.oldPrice && <Badge tone="sale">Акція</Badge>
                  )}
                  {p.isNew && <Badge tone="new">Новинка</Badge>}
                  {p.isBestseller && <Badge tone="bestseller">Бестселер</Badge>}
                </div>
                <FavoriteButton productId={p.id} />
              </div>
              <h1 className="text-[28px] leading-9 font-bold tracking-[-0.3px] lg:text-h1">
                {p.name}
              </h1>
              <p className="text-sm text-ink-muted">Код товару: {p.sku}</p>

              <p className="flex flex-wrap items-center gap-3">
                <span className="text-h2 font-bold">{formatPrice(p.price)}</span>
                {p.oldPrice && (
                  <>
                    <s className="text-ink-muted">
                      <span className="sr-only">Стара ціна: </span>
                      {formatPrice(p.oldPrice)}
                    </s>
                    <Badge tone="sale">−{salePercent}%</Badge>
                  </>
                )}
              </p>

              {p.defectNote ? (
                <div className="flex gap-3 rounded-lg border border-warning bg-accent-subtle p-4 text-sm">
                  <TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden />
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-medium">Чому дешевше</p>
                    <p>{p.defectNote}</p>
                    <p className="text-ink-muted">
                      Ціна остаточна, загальна знижка на неї не діє. Повернення через описаний
                      недолік не приймається, з інших причин — на загальних умовах.
                    </p>
                    {p.related[0] && (
                      <Link
                        href={`/product/${p.related[0].slug}`}
                        className="font-medium text-ink-accent underline underline-offset-2"
                      >
                        Новий товар — {formatPrice(p.related[0].price)}
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 rounded-lg bg-surface p-4 text-sm">
                    <BadgePercent className="size-5 shrink-0 text-ink-accent" aria-hidden />
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-medium">
                        Знижка {DISCOUNT_PERCENT}% на замовлення
                      </p>
                      <p className="text-ink-muted">
                        Від {DISCOUNT_MIN_QTY} шт цього товару — {formatPrice(discounted)} / шт, або
                        на весь кошик від {formatPrice(DISCOUNT_MIN_SUBTOTAL)}. Рахується
                        автоматично.
                      </p>
                    </div>
                  </div>
                  {p.related[0] && (
                    <Link
                      href={`/product/${p.related[0].slug}`}
                      className="flex items-center gap-2 rounded-lg border border-line p-3 text-sm hover:bg-surface"
                    >
                      <Badge tone="markdown">Уцінка</Badge>Є вітринний екземпляр за{" "}
                      {formatPrice(p.related[0].price)}
                    </Link>
                  )}
                </>
              )}

              <BuyBox name={p.name} sku={p.sku} variants={p.variants} sizeChart={p.sizeChart} />

              <ul className="flex flex-col gap-4 border-t border-line-subtle pt-4 text-sm">
                {conditions.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex gap-3">
                    <Icon className="size-6 shrink-0" aria-hidden />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{title}</span>
                      <span className="text-ink-muted">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {(p.description || p.attributes.length > 0) && (
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {p.description && (
              <section className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold">Опис</h2>
                <p className="whitespace-pre-line text-ink-muted">{p.description}</p>
              </section>
            )}
            {p.attributes.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold">Характеристики</h2>
                <dl className="text-sm">
                  {p.attributes.map((a) => (
                    <div
                      key={`${a.key}:${a.value}`}
                      className="grid grid-cols-2 gap-4 border-b border-line-subtle py-3"
                    >
                      <dt className="text-ink-muted">{a.key}</dt>
                      <dd className="font-medium">{a.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        )}

        <section className="flex flex-col gap-3 rounded-xl bg-surface p-6 lg:p-8">
          <h2 className="text-2xl font-bold">Доставка та оплата</h2>
          <p className="text-ink-muted">
            Нова пошта (відділення або поштомат), Укрпошта та Meest — за тарифами перевізника.
            Відправляємо щосереди та щосуботи; замовлення до 11:00 у день відправки їде того ж дня.
            Самовивіз у Дніпрі — за домовленістю.
          </p>
          <p className="text-ink-muted">
            Оплата на рахунок (IBAN — реквізити прийдуть листом), накладений платіж Новою поштою,
            готівкою при самовивозі. Обмін і повернення протягом 14 днів: збережіть товарний вигляд
            і комплектацію.
          </p>
        </section>

        {similar.length > 0 && (
          <section aria-labelledby="similar" className="flex flex-col gap-6">
            <h2 id="similar" className="text-2xl font-bold lg:text-h2">
              Схожі товари
            </h2>
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
              {similar.map((s) => (
                <li key={s.id}>
                  <ProductCard product={s} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </main>
  );
}
