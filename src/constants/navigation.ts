export type NavLink = { label: string; href: string };

// TODO(feat/catalog): top-level categories will come from D1; slugs here must match the seed.
export const catalogLinks: NavLink[] = [
  { label: "Захист очей та обличчя", href: "/catalog/zakhyst-ochei" },
  { label: "Захист органів дихання", href: "/catalog/zakhyst-dykhannia" },
  { label: "Захист рук", href: "/catalog/zakhyst-ruk" },
  { label: "Спецодяг", href: "/catalog/spetsodiah" },
  { label: "Абразиви", href: "/catalog/abrazyvy" },
  { label: "Зварювання", href: "/catalog/zvariuvannia" },
  { label: "Захист голови та слуху", href: "/catalog/zakhyst-holovy" },
  { label: "Інструмент та господарські товари", href: "/catalog/hospodarski-tovary" },
];

export const customerLinks: NavLink[] = [
  { label: "Про магазин", href: "/about" },
  { label: "Доставка та оплата", href: "/delivery" },
  { label: "Обмін та повернення", href: "/returns" },
  { label: "Публічна оферта", href: "/offer" },
  { label: "Політика конфіденційності", href: "/privacy" },
  { label: "Контакти", href: "/contacts" },
];
