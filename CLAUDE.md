# tcupko

## Project Guidelines & Agent Skills

Skills live in `.claude/skills/*`. **`.claude/` is local and is never committed.** Before a
task, pick every relevant skill and read its SKILL.md. If a skill conflicts with this
document, this document wins.

- `reuse-before-build` — what already exists; reuse before building
- `structure-and-element-anti-patterns` — semantic markup, one H1, no `div onClick`. Any JSX
- `tailwind-token-naming` — tokens in `@theme` never reuse stock Tailwind names
- `nextjs-image-weight` — `next/image`, `sizes`, `priority`, photos in `public/products/` pre-compressed
- `nextjs-developer`, `nextjs-anti-patterns`, `react-expert` — App Router / React 19
- `seo-skill` — metadata, canonical, sitemap/robots, `Product` JSON-LD
- `sitemap-integrity` — only public, 200, canonical, indexable URLs in the sitemap
- `structured-output-escaping` — JSON-LD, `dangerouslySetInnerHTML`, HTML in emails
- `external-call-safety` — Resend / Nova Poshta API: timeouts, no leaking upstream errors
- `responsive-shell-single-source` — header/mobile menu/footer share one source of links
- `ui-focus-no-layout-shift` — focus/hover states never change geometry
- `task-planner` — multi-step work follows `docs/PLAN.md`
- `pre-commit-review` — only on an explicit request ("перевір перед комітом", "готуємо ПР");
  **build is mandatory before every commit**

## This Project

- **tcupko** («Цупко») — online shop of PPE and work consumables. Design: Figma file
  `j2QGPnHMNhNLILfHKyDile` (1:1; pages "05 Акаунт" and "07 Адмінка" are not release 1).
- Stack: Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4, npm.
  Hosting: Cloudflare Workers via `@opennextjs/cloudflare`. DB: Cloudflare D1 + Drizzle.
  Product photos: in the repo, `public/products/` (R2 comes with the admin). Email: Resend. Plan and decisions: `docs/PLAN.md`.
- No online payment, no customer accounts, no admin in release 1.
- Branches: `main` = production, `dev` = current development, task branches from `dev`
  (`feat/…`, `fix/…`, `chore/…`) → PR into `dev`; `dev` → `main` = release.

## Business rules (source of truth for code)

- Order flow: cart → guest order form → order saved in D1 → customer email (Resend) +
  owner Telegram. No checkout/payment gateway, no accounts. Owner gets Telegram only, never email.
- Carrier ↔ payment (enforced on the server too): Nova Poshta (branch/locker, no courier) —
  IBAN or COD; Ukrposhta — IBAN only; Meest — IBAN only; pickup (by arrangement) — IBAN
  prepayment or cash. No free shipping.
- Products have variants (size or none), stock lives on the variant. Filters are built from
  product attributes of the current category; tags = cross-category "purpose".
- Shipping days: Wednesday and Saturday, cut-off 11:00 Europe/Kyiv.
- Discount: 10% on the whole order if any product qty ≥ 15 OR cart subtotal ≥ 3500 UAH;
  never stacked.
- Markdown ("уцінка", `products.defect_note` set): a separate copy of a product with its own
  sku/price/stock. Its price is FINAL — excluded from the 10% discount and from the discount
  thresholds. Shown after new items; returns for the described defect are not accepted.
  Data format for the owner: `docs/PRODUCTS.md`.
- Stock is finite (sell-out, no restock): order decrements stock atomically, never below 0;
  `stock = 0` → product hidden from catalog and sitemap, product page 404.
- Prices, discount and totals are computed **on the server** from the DB; the client sends
  only product ids and quantities. One pricing function in `src/lib/pricing.ts`.

## Main Rule: KISS / YAGNI

- Code for the task at hand; nothing "for the future" (admin is the next release — do not
  pre-build it).
- Design 1:1: existing components, tokens, sizes, colours, fonts. A block missing in the
  design — ask first.
- Never invent prices, product texts, terms, reviews. No data → `TODO` and ask.

## Frontend

- Server Components by default; `'use client'` only on the lowest interactive component.
- No `useEffect` + `useState` for data, URL reads or browser detection.
- `<Link>` for navigation; `next/image` for raster images.
- `any` is forbidden. DB types come from the Drizzle schema.
- Only Workers-compatible APIs (no `fs`, no native Node modules at runtime).
- Secrets only from env / Cloudflare secrets (`RESEND_API_KEY`, `NP_API_KEY`, `SHOP_IBAN`, …),
  never in code, logs or the client bundle.

## Verification & Response

- After a change: `npm run lint`. Before **every** commit: `npm run build` (see
  `pre-commit-review`). Checks are run with the user's consent.
- **Any failed check = no commit** (tsc, lint, prettier, build, preview — each checked on its own).
- **Builds do not execute code on Workers.** `npm run preview` + HTTP 200 on key pages + no
  runtime errors is mandatory before merging into `main` and after changes to config,
  dependencies, server code, DB or env. A check that could not run is reported as such and
  blocks the merge.
- New Next.js defaults/flags are checked for OpenNext/Workers compatibility before use
  (`cacheComponents` / `partialPrefetching` hang on Workers → Error 1101).
- Commits only when asked, files added by name, messages in Ukrainian.
- Answers in Ukrainian, short. No intros/outros; show only changed code. Missing context — ask.
