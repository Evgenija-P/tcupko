# Як додати товари

Товари лежать у `data/catalog.json`, масив `"products"`. Після змін — сказати Claude
«залий товари» (або самій: `npm run db:seed:remote`). Повторне заливання безпечне: оновлює
ціни й описи, **не скидає залишки**, що вже зменшили замовлення.

## Звичайний товар

```json
{
  "sku": "204871",
  "slug": "maska-zvariuvalnyka-khameleon-din-9-13",
  "name": "Маска зварювальника хамелеон, DIN 9–13",
  "category": "shchytky-maski",
  "price": 1275,
  "stock": 37,
  "description": "Маска з автоматичним світлофільтром…",
  "attributes": { "Матеріал": "поліпропілен", "Бренд": "Vitals" },
  "tags": ["zakhyst-ochei", "zvariuvannia"],
  "images": [
    { "path": "maska-khameleon-1.webp", "alt": "Маска хамелеон, вигляд спереду" },
    { "path": "maska-khameleon-2.webp", "alt": "Маска хамелеон, збоку" }
  ]
}
```

| Поле                    | Обов'язкове | Що це                                                                                                                                                         |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sku`                   | так         | Код товару — унікальний, показується покупцю, за ним шукають                                                                                                  |
| `slug`                  | так         | Адреса сторінки: латиниця, дефіси, унікальна, **не змінювати** після запуску                                                                                  |
| `name`                  | так         | Назва                                                                                                                                                         |
| `category`              | так         | `slug` **підкатегорії** з `categories` (див. нижче)                                                                                                           |
| `price`                 | так         | Ціна в гривнях (`42` або `42.5`)                                                                                                                              |
| `stock`                 | так*        | Скільки є. *Для товарів з розмірами — `variants` замість `stock`                                                                                              |
| `oldPrice`              | ні          | Стара ціна → товар стає «Акція» з перекресленою ціною                                                                                                         |
| `description`           | ні          | Опис; новий рядок — `\n`                                                                                                                                      |
| `attributes`            | ні          | Характеристики → з них самі будуються **фільтри** (матеріал, бренд, діаметр…). Пиши значення однаково: «брезент», а не то «Брезент», то «брезентові»          |
| `tags`                  | ні          | Призначення: `zakhyst-ochei`, `zakhyst-dykhannia`, `zakhyst-ruk`, `zakhyst-slukhu`, `zvariuvannia`, `obrobka-metalu`, `elektryka`, `rozmitka`, `hospodarstvo` |
| `images`                | ні          | Фото з папки `public/products/`. Перше — головне                                                                                                              |
| `isNew`, `isBestseller` | ні          | `true` → мітка й карусель на головній                                                                                                                         |

## Товар з розмірами

Замість `stock`:

```json
"variants": [
  { "size": "M", "stock": 10 },
  { "size": "L", "stock": 4 },
  { "size": "XL", "stock": 0 }
]
```

Якщо розмір коштує інакше — `{ "size": "XXL", "stock": 2, "price": 520 }`.

## Уцінка (вітринний / пошкоджене пакування)

Окремий запис, оригінал має бути в цьому ж файлі. Решту (назву, фото, опис, характеристики)
скрипт скопіює з оригіналу; код буде `204871-У`, стара ціна = ціна оригіналу.

```json
{
  "markdownOf": "204871",
  "price": 950,
  "stock": 2,
  "defect": "Пошкоджене пакування, сама маска ціла"
}
```

Свої фото дефекту — додати `"images": [...]`. Ціна уцінки остаточна (загальна знижка −10 %
на неї не діє); повернення через описаний дефект не приймається.

## Фото

- Папка `public/products/`, у JSON — лише ім'я файлу.
- Квадрат 1:1, **WebP або JPG, до 1600 px і до 300 КБ** (стиснути: squoosh.app).
- Імена латиницею без пробілів: `kragy-spylkovi-1.webp`.
- Фон бажано світлий однотонний.

## Категорії (`category`)

Захист очей та обличчя: `okuliary`, `shchytky-maski`, `skeltsia` ·
Захист органів дихання: `respiratory` ·
Захист рук: `rukavytsi-brezentovi`, `kragy-zvariuvalnyka`, `rukavychky-hb-pvkh`, `rukavychky-nitrylovi` ·
Спецодяг: `zakhysni-kostiumy`, `fartukhy`, `nakolinnyky-nalokitnyky` ·
Абразиви: `vidrizni-kruhy`, `shlifuvalni-kruhy`, `shchitky` ·
Зварювання: `elektrody`, `zvariuvalnyi-drit`, `khimiia-dlia-zvariuvannia`, `forsunky` ·
Захист голови та слуху: `kasky`, `berushi` ·
Інструмент та господарські товари: `izolenta`, `markery`, `ruletky`, `ushchilniuvachi`, `petli`

Нова підкатегорія — додати в `categories` (або попросити Claude).

## Простіше: таблиця

Можна вести товари в Excel / Google Таблиці з колонками
`sku, name, category, price, stock, oldPrice, description, Матеріал, Бренд, …, фото` —
Claude перетворить її на `catalog.json`.
