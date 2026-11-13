import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Навігаційний шлях" className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-ink-muted">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="size-4" aria-hidden />}
            {c.href ? (
              <Link
                href={c.href}
                className="text-ink underline underline-offset-2 hover:text-ink-accent"
              >
                {c.label}
              </Link>
            ) : (
              <span aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
