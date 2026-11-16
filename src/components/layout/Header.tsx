import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "@/components/base/Container";
import { CartLink } from "@/components/cart/CartLink";
import { CatalogDrawer } from "@/components/catalog/CatalogDrawer";
import { MegaMenu } from "@/components/catalog/MegaMenu";
import { FavoritesLink } from "@/components/favorites/FavoritesLink";
import { SearchBox } from "@/components/search/SearchBox";
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
        <SearchBox />
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
