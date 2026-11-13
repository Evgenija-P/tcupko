// TODO(owner): real phone, hours, pickup address, email, legal name, social links.
export const contacts = {
  phone: "+380 XX XXX XX XX",
  phoneHref: "",
  hours: "Пн–Пт 9:00–18:00",
  pickup: "Самовивіз: [адреса складу]",
  email: "info@tcupko.shop",
  legal: "ФОП [ПІБ]",
} as const;

/** Empty href = link is hidden until the owner provides it. */
export const socialLinks: { label: string; href: string }[] = [
  { label: "Instagram", href: "" },
  { label: "Facebook", href: "" },
  { label: "Telegram", href: "" },
];
