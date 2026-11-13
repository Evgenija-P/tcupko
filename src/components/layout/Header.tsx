import Link from "next/link";
import { LayoutGrid, Search, ShoppingCart } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/base/Container";
import { contacts } from "@/constants/contacts";
import { FavoritesLink } from "@/components/favorites/FavoritesLink";
import { HeaderAction } from "./HeaderAction";
import { Logo } from "./Logo";

// TODO(feat/cart): cart counter + total; TODO(feat/catalog): mega menu, mobile catalog drawer.
export function Header() {
  return (
    <header className="border-b border-line-subtle bg-page">
      {/* Desktop */}
      <Container className="hidden h-20 items-center gap-6 lg:flex">
        <Logo />
        <ButtonLink href="/catalog" icon={<LayoutGrid aria-hidden />}>
          Каталог
        </ButtonLink>
        <form action="/search" role="search" className="flex-1">
          <label className="flex items-center gap-2 rounded-lg border border-line bg-page px-4 py-3 focus-within:border-line-strong">
            <Search className="size-6 shrink-0 text-ink" aria-hidden />
            <span className="sr-only">Пошук товарів</span>
            <input
              type="search"
              name="q"
              placeholder="Пошук товарів або код товару"
              className="w-full bg-transparent text-base outline-none placeholder:text-ink-muted"
            />
          </label>
        </form>
        <div className="flex shrink-0 flex-col">
          <a href={contacts.phoneHref || undefined} className="text-base font-medium text-ink">
            {contacts.phone}
          </a>
          <span className="text-xs text-ink-muted">{contacts.hours}</span>
        </div>
        <div className="flex items-center gap-2">
          <FavoritesLink />
          <HeaderAction href="/cart" icon={<ShoppingCart aria-hidden />} label="Кошик" />
        </div>
      </Container>

      {/* Mobile */}
      <Container className="flex h-14 items-center gap-2 lg:hidden">
        <Logo compact />
        <div className="flex-1" />
        <Link href="/search" aria-label="Пошук" className="p-2 text-ink">
          <Search className="size-6" aria-hidden />
        </Link>
        <FavoritesLink showLabel={false} />
        <HeaderAction
          href="/cart"
          icon={<ShoppingCart aria-hidden />}
          label="Кошик"
          showLabel={false}
        />
      </Container>
    </header>
  );
}
