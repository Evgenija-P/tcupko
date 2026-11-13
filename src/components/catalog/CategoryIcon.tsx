import {
  Disc3,
  Flame,
  Glasses,
  Hand,
  HardHat,
  type LucideIcon,
  Package,
  Shirt,
  Wind,
  Wrench,
} from "lucide-react";

// Top-level category slug → icon (Figma left these as placeholders; picked from lucide).
const icons: Record<string, LucideIcon> = {
  "zakhyst-ochei": Glasses,
  "zakhyst-dykhannia": Wind,
  "zakhyst-ruk": Hand,
  spetsodiah: Shirt,
  abrazyvy: Disc3,
  zvariuvannia: Flame,
  "zakhyst-holovy": HardHat,
  "hospodarski-tovary": Wrench,
};

export function CategoryIcon({ slug, className = "size-6" }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Package;
  return <Icon className={className} aria-hidden />;
}
