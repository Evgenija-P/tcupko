import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/base/Container";
import { CartLink } from "@/components/cart/CartLink";
import { CatalogDrawer } from "@/components/catalog/CatalogDrawer";
import { MegaMenu } from "@/components/catalog/MegaMenu";
import { FavoritesLink } from "@/components/favorites/FavoritesLink";
import { contacts } from "@/constants/contacts";
import { getCategoryTree } from "@/db/queries/catalog";
import { Logo } from "./Logo";

export async function Header() {
  const tree = await getCategoryTree();

  return (
    <header className="relative z-40 border-b border-line-subtle bg-page">
      {/* Desktop */}
      <Container className="hidden h-20 items-center gap-6 lg:flex">
        <Logo />
        <MegaMenu tree={tree} />
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
          <a href={contacts.phoneHref} className="text-base font-medium text-ink">
            {contacts.phone}
          </a>
          <span className="text-xs text-ink-muted">{contacts.hours}</span>
        </div>
        <div className="flex items-center gap-2">
          <FavoritesLink />
          <CartLink />
        </div>
      </Container>

      {/* Mobile */}
      <Container className="flex h-14 items-center gap-2 lg:hidden">
        <CatalogDrawer tree={tree} />
        <Logo compact />
        <div className="flex-1" />
        <Link href="/search" aria-label="Пошук" className="p-2 text-ink">
          <Search className="size-6" aria-hidden />
        </Link>
        <FavoritesLink showLabel={false} />
        <CartLink showLabel={false} />
      </Container>
    </header>
  );
}
