"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { createOneClickLead, type OneClickState } from "@/app/product/[slug]/actions";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { addToCart, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { ProductVariant } from "@/db/queries/product";

type Props = {
  name: string;
  sku: string;
  variants: ProductVariant[];
  sizeChart: string[][] | null;
};

/** Size, quantity, "В кошик", "Купити в один клік" (Figma "Блок покупки"). */
export function BuyBox({ name, sku, variants, sizeChart }: Props) {
  const sized = variants.some((v) => v.size);
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(firstInStock.id);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const [oneClick, setOneClick] = useState(false);
  const [chart, setChart] = useState(false);

  const variant = variants.find((v) => v.id === variantId) ?? firstInStock;
  const inCart = useCart().find((l) => l.variantId === variant.id)?.qty ?? 0;
  const left = Math.max(0, variant.stock - inCart); // what can still be added
  const soldOut = variant.stock === 0;

  function pickSize(id: number) {
    setVariantId(id);
    setQty(1);
  }

  function add() {
    addToCart(variant.id, variant.stock, qty);
    setQty(1);
    setToast(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className={`font-medium ${soldOut ? "text-ink-muted" : "text-success"}`}>
        {soldOut ? "Цього розміру немає в наявності" : `В наявності: ${variant.stock} шт`}
      </p>

      {sized && (
        <fieldset className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <legend className="text-sm">Розмір</legend>
            {sizeChart && (
              <button
                type="button"
                onClick={() => setChart(true)}
                className="text-sm font-semibold text-ink-accent"
              >
                Таблиця розмірів
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <label key={v.id}>
                <input
                  type="radio"
                  name="size"
                  value={v.id}
                  checked={v.id === variant.id}
                  disabled={v.stock === 0}
                  onChange={() => pickSize(v.id)}
                  className="peer sr-only"
                />
                <span className="flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-lg border border-line px-3 text-sm peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:text-ink-accent peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-disabled:cursor-not-allowed peer-disabled:text-ink-disabled peer-disabled:line-through">
                  {v.size}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <div className="flex h-12 items-center rounded-lg border border-line">
            <button
              type="button"
              aria-label="Менше"
              disabled={qty <= 1}
              onClick={() => setQty((q) => q - 1)}
              className="flex size-12 items-center justify-center disabled:text-ink-disabled"
            >
              <Minus className="size-5" aria-hidden />
            </button>
            <input
              type="number"
              aria-label="Кількість"
              min={1}
              max={Math.max(1, left)}
              value={qty}
              onChange={(e) =>
                setQty(Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(1, left)))
              }
              className="w-14 [appearance:textfield] bg-transparent text-center font-medium [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              aria-label="Більше"
              disabled={qty >= left}
              onClick={() => setQty((q) => q + 1)}
              className="flex size-12 items-center justify-center disabled:text-ink-disabled"
            >
              <Plus className="size-5" aria-hidden />
            </button>
          </div>
          <Button
            className="flex-1"
            icon={<ShoppingCart aria-hidden />}
            disabled={left === 0}
            onClick={add}
          >
            {soldOut ? "Немає в наявності" : left === 0 ? "Весь залишок у кошику" : "В кошик"}
          </Button>
        </div>
        {inCart > 0 && left > 0 && (
          <p className="text-xs text-ink-muted">
            У кошику вже {inCart} шт, можна додати ще {left}
          </p>
        )}
        <Button variant="secondary" disabled={soldOut} onClick={() => setOneClick(true)}>
          Купити в один клік
        </Button>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed right-4 bottom-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-inverse p-4 text-sm text-white shadow-xl sm:left-auto sm:w-80"
        >
          <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
          <span className="flex-1">
            Товар додано до кошика
            <br />
            <Link href="/cart" className="underline underline-offset-2">
              Оформити замовлення
            </Link>
          </span>
          <button type="button" aria-label="Закрити" onClick={() => setToast(false)}>
            <X className="size-5" aria-hidden />
          </button>
        </div>
      )}

      {sizeChart && (
        <Modal open={chart} onClose={() => setChart(false)} title="Таблиця розмірів">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {sizeChart[0]?.map((h) => (
                  <th
                    key={h}
                    className="border-b border-line-subtle py-2 text-left font-normal text-ink-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeChart.slice(1).map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border-b border-line-subtle py-2 font-medium">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={() => setChart(false)}>Зрозуміло</Button>
        </Modal>
      )}

      <Modal open={oneClick} onClose={() => setOneClick(false)} title="Купити в один клік">
        <OneClickForm
          key={`${variant.id}-${oneClick}`}
          name={name}
          sku={sku}
          variant={variant}
          qty={qty}
        />
      </Modal>
    </div>
  );
}

function OneClickForm({
  name,
  sku,
  variant,
  qty,
}: {
  name: string;
  sku: string;
  variant: ProductVariant;
  qty: number;
}) {
  const [state, action, pending] = useActionState<OneClickState, FormData>(
    createOneClickLead,
    null,
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden />
        <p className="text-lg font-semibold">Заявку прийнято</p>
        <p className="text-ink-muted">Ми зателефонуємо, щоб уточнити деталі замовлення.</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="text-sm">
        <p className="font-medium">
          {name}
          {variant.size && `, розмір ${variant.size}`}
        </p>
        <p className="text-ink-muted">
          Код: {sku} · {qty} шт
        </p>
        <p className="mt-1 text-base font-bold">{formatPrice(variant.price * qty)}</p>
      </div>
      <input type="hidden" name="variantId" value={variant.id} />
      <input type="hidden" name="qty" value={qty} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <label className="flex flex-col gap-1 text-sm">
        Ім&apos;я*
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Введіть ім'я"
          className="rounded-lg border border-line px-4 py-3 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Телефон*
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="+380 __ ___ __ __"
          className="rounded-lg border border-line px-4 py-3 text-base"
        />
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-ink-error">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending}>
        Замовити
      </Button>
      <p className="text-sm text-ink-muted">Ми зателефонуємо, щоб уточнити деталі</p>
    </form>
  );
}
