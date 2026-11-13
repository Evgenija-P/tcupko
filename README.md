# tcupko

Інтернет-магазин. Next.js + TypeScript + Tailwind CSS, Cloudflare Workers (D1, R2), Resend.

- `main` — прод
- `dev` — актуальна розробка
- гілки задач: `feat/…`, `fix/…`, `chore/…` від `dev`, ПР у `dev`

План: [docs/PLAN.md](docs/PLAN.md)

## Команди

| Команда                                                       | Що робить                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| `npm run dev`                                                 | локальна розробка                                         |
| `npm run lint` / `npm run typecheck` / `npm run format:check` | перевірки                                                 |
| `npm run build`                                               | білд Next (обов'язковий перед комітом)                    |
| `npm run build:cf`                                            | білд під Cloudflare Workers (OpenNext)                    |
| `npm run preview`                                             | білд + локальний запуск у рантаймі Workers                |
| `npm run deploy`                                              | ручний деплой (зазвичай деплоїть Workers Builds з GitHub) |
