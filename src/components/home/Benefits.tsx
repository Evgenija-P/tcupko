import { BadgePercent, MapPin, Package, Truck, type LucideIcon } from "lucide-react";
import { DISCOUNT_MIN_QTY, DISCOUNT_MIN_SUBTOTAL, DISCOUNT_PERCENT } from "@/constants/pricing";
import { formatPrice } from "@/lib/format";

const items: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Package,
    title: "В наявності на складі",
    text: "Відправляємо з власного складу, без передзамовлень",
  },
  {
    icon: Truck,
    title: "Відправка щосереди та щосуботи",
    text: "Замовлення до 11:00 у день відправки їде того ж дня",
  },
  {
    icon: BadgePercent,
    title: `Знижка ${DISCOUNT_PERCENT}% на замовлення`,
    text: `Від ${DISCOUNT_MIN_QTY} шт одного товару або від ${formatPrice(DISCOUNT_MIN_SUBTOTAL)} — автоматично в кошику`,
  },
  {
    icon: MapPin,
    title: "Самовивіз у Дніпрі",
    text: "Ринок «Курчатовський», а також центр і лівий берег — за домовленістю",
  },
];

export function Benefits() {
  return (
    <ul className="grid gap-6 rounded-xl bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
      {items.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent-strong">
            <Icon className="size-6" aria-hidden />
          </span>
          <span className="flex flex-col gap-1">
            <span className="font-medium">{title}</span>
            <span className="text-sm text-ink-muted">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
