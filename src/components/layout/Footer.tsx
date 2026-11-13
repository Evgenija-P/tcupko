import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/base/Container";
import { contacts, socialLinks } from "@/constants/contacts";
import { catalogLinks, customerLinks, type NavLink } from "@/constants/navigation";
import { Logo } from "./Logo";

export function Footer() {
  const socials = socialLinks.filter((s) => s.href);

  return (
    <footer className="mt-auto bg-surface pt-14 pb-8">
      <Container className="flex flex-col gap-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-sm text-ink-muted">
              Засоби індивідуального захисту та витратні матеріали для майстерень і виробництв.
            </p>
            {socials.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-sm border border-line bg-page px-2.5 py-1 text-xs text-ink-muted hover:text-ink"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <LinkColumn title="Каталог" links={catalogLinks} />
          <LinkColumn title="Покупцям" links={customerLinks} />

          <div className="flex flex-col gap-3">
            <h2 className="text-base font-medium">Контакти</h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="size-5 shrink-0" aria-hidden />
                <a href={contacts.phoneHref || undefined}>{contacts.phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-5 shrink-0" aria-hidden />
                {contacts.hours}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-5 shrink-0" aria-hidden />
                {contacts.pickup}
              </li>
              <li>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="border-t border-line pt-6 text-xs text-ink-muted">
          © {new Date().getFullYear()} Цупко. {contacts.legal}
        </p>
      </Container>
    </footer>
  );
}

function LinkColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-base font-medium">{title}</h2>
      <ul className="flex flex-col gap-3 text-sm text-ink-muted">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
