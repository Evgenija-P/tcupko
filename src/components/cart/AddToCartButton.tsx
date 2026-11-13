"use client";

import { ShoppingCart } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { addToCart, useCart } from "@/lib/cart";

type Props = { href: string; variantId: number; stock: number; hasSizes: boolean };

/** Card CTA. Products with sizes go to the product page to pick a size. */
export function AddToCartButton({ href, variantId, stock, hasSizes }: Props) {
  const inCart = useCart().find((l) => l.variantId === variantId)?.qty ?? 0;

  if (hasSizes) {
    return (
      <ButtonLink href={href} variant="secondary" className="w-full">
        Обрати розмір
      </ButtonLink>
    );
  }

  const full = inCart >= stock;
  return (
    <Button
      className="w-full"
      icon={<ShoppingCart aria-hidden />}
      disabled={full}
      onClick={() => addToCart(variantId, stock)}
    >
      {full ? "Весь залишок у кошику" : inCart ? `У кошику: ${inCart}` : "В кошик"}
    </Button>
  );
}
