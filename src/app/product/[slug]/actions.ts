"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { leads, products, productVariants } from "@/db/schema";
import { normalizeUaPhone } from "@/lib/phone";

export type OneClickState = { ok: true } | { ok: false; error: string } | null;

const schema = z.object({
  name: z.string().trim().min(2, "Вкажіть ім'я").max(80),
  phone: z.string().trim(),
  variantId: z.coerce.number().int().positive(),
  qty: z.coerce.number().int().min(1).max(999),
  website: z.string().max(0).optional(), // honeypot: bots fill every field
});

/** "Купити в один клік": saves a lead; the owner calls back. Stock is NOT reserved. */
export async function createOneClickLead(_: OneClickState, form: FormData): Promise<OneClickState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Перевірте поля форми" };
  }
  const phone = normalizeUaPhone(parsed.data.phone);
  if (!phone) return { ok: false, error: "Вкажіть номер у форматі +380 XX XXX XX XX" };

  const db = getDb();
  // product data is taken from the DB, never from the form
  const [row] = await db
    .select({
      name: products.name,
      sku: products.sku,
      size: productVariants.size,
      price: productVariants.price,
      productPrice: products.price,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.id, parsed.data.variantId));
  if (!row) return { ok: false, error: "Товар не знайдено, оновіть сторінку" };

  await db.insert(leads).values({
    type: "one_click",
    name: parsed.data.name,
    phone,
    payload: {
      variantId: parsed.data.variantId,
      qty: parsed.data.qty,
      productName: row.name,
      sku: row.sku,
      size: row.size,
      price: row.price ?? row.productPrice,
    },
  });
  // TODO(feat/telegram): notify the owner.
  return { ok: true };
}
