"use client";

import { ShoppingCart } from "lucide-react";
import { HeaderAction } from "@/components/layout/HeaderAction";
import { useCart } from "@/lib/cart";

// TODO(feat/cart): show the cart total under the icon (needs prices from the server).
export function CartLink({ showLabel = true }: { showLabel?: boolean }) {
  const count = useCart().reduce((n, l) => n + l.qty, 0);
  return (
    <HeaderAction
      href="/cart"
      icon={<ShoppingCart aria-hidden />}
      label="Кошик"
      showLabel={showLabel}
      count={count}
    />
  );
}
