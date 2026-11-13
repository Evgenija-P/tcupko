# tcupko

Інтернет-магазин. Next.js + TypeScript + Tailwind CSS, Cloudflare Workers (D1, R2), Resend.

- `main` — прод
- `dev` — актуальна розробка
- гілки задач: `feat/…`, `fix/…`, `chore/…` від `dev`, ПР у `dev`

План: [docs/PLAN.md](docs/PLAN.md)

## База (Cloudflare D1 + Drizzle)

1. Змінила `src/db/schema.ts` → `npm run db:generate` (нова SQL-міграція в `drizzle/`).
2. `npm run db:migrate:local` — локальна база; `npm run db:migrate:remote` — прод.
3. Товари: `data/catalog.json` (категорії, теги, товари; ціни в гривнях) →
   `npm run db:seed:local` (+ тестові `data/demo-products.json`) або `npm run db:seed:remote`.
   Повторний запуск безпечний: оновлює ціни/описи, **не скидає залишки** існуючих варіантів
   (для примусового залишку — `"forceStock": true` у варіанті). Товари, яких немає у файлі,
   ховаються. Фото — у `public/products/`, у JSON шлях відносно цієї папки.

## Команди

| Команда                                                       | Що робить                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `npm run dev`                                                 | локальна розробка                                         |
| `npm run lint` / `npm run typecheck` / `npm run format:check` | перевірки                                                 |
| `npm run build`                                               | білд Next (обов'язковий перед комітом)                    |
| `npm run build:cf`                                            | білд під Cloudflare Workers (OpenNext)                    |
| `npm run preview`                                             | білд + локальний запуск у рантаймі Workers                |
| `npm run deploy`                                              | ручний деплой (зазвичай деплоїть Workers Builds з GitHub) |
