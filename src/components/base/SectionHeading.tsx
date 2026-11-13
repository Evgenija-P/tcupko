import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  link?: { href: string; label: string };
  /** e.g. carousel arrows */
  aside?: ReactNode;
};

/** Figma "Section Title": H2 + accent link, optional controls on the right. */
export function SectionHeading({ id, title, link, aside }: Props) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 id={id} className="flex-1 text-2xl font-bold lg:text-h2">
        {title}
      </h2>
      {link && (
        <Link
          href={link.href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink-accent lg:text-base"
        >
          {link.label}
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      )}
      {aside}
    </div>
  );
}
