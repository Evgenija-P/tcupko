import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Badge } from "@/components/ui/Badge";
import { DISCOUNT_MIN_QTY, DISCOUNT_PERCENT } from "@/constants/pricing";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  sku: string;
  price: number; // kopecks
  oldPrice: number | null; // kopecks, set = on sale
  stock: number; // sum over variants
  /** true → the size is chosen on the product page, the card links there instead of adding. */
  hasSizes: boolean;
  /** The only/first variant — what "В кошик" adds when there are no sizes. */
  variantId: number;
  image: { src: string; alt: string } | null;
  isNew: boolean;
  isBestseller: boolean;
  /** "Уцінка": final price, no order discount */
  isMarkdown: boolean;
};

export function ProductCard({ product: p }: { product: ProductCardData }) {
  const href = `/product/${p.slug}`;
  const salePercent = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-line-subtle bg-page p-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-0">
          {p.image && (
            <Image
              src={p.image.src}
              alt={p.image.alt}
              fill
              sizes="(min-width: 1024px) 278px, 45vw"
              className="object-contain"
            />
          )}
        </Link>
        <div className="absolute top-2 right-14 left-2 flex flex-wrap gap-1">
          {p.isMarkdown ? (
            <Badge tone="markdown">Уцінка</Badge>
          ) : (
            p.oldPrice && <Badge tone="sale">Акція</Badge>
          )}
          {salePercent > 0 && <Badge tone="sale">−{salePercent}%</Badge>}
          {p.isNew && <Badge tone="new">Новинка</Badge>}
          {p.isBestseller && <Badge tone="bestseller">Бестселер</Badge>}
        </div>
        <FavoriteButton productId={p.id} className="absolute top-2 right-2" />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 h-10 text-sm font-medium">
          <Link href={href} className="hover:text-ink-accent">
            {p.name}
          </Link>
        </h3>
        <p className="text-xs text-ink-muted">Код: {p.sku}</p>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="flex items-baseline gap-2">
          <span className={`text-xl font-bold ${p.oldPrice ? "text-ink-error" : ""}`}>
            {formatPrice(p.price)}
          </span>
          {p.oldPrice && (
            <s className="text-sm text-ink-muted">
              <span className="sr-only">Стара ціна: </span>
              {formatPrice(p.oldPrice)}
            </s>
          )}
        </p>
        <p className="text-xs text-ink-accent">
          {p.isMarkdown
            ? "Вітринний екземпляр, ціна остаточна"
            : `−${DISCOUNT_PERCENT}% від ${DISCOUNT_MIN_QTY} шт`}
        </p>
      </div>

      <p className="mt-auto flex items-center gap-1.5 text-xs">
        <span className="size-2 rounded-full bg-success" aria-hidden />В наявності: {p.stock} шт
      </p>
      <AddToCartButton href={href} variantId={p.variantId} stock={p.stock} hasSizes={p.hasSizes} />
    </article>
  );
}
