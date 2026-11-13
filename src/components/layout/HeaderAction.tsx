import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  icon: ReactNode;
  /** Visible caption under the icon (desktop); also the accessible name. */
  label: string;
  showLabel?: boolean;
  count?: number;
};

/** Icon + optional counter badge + caption, as in Figma "Header Action". */
export function HeaderAction({ href, icon, label, showLabel = true, count = 0 }: Props) {
  return (
    <Link
      href={href}
      aria-label={count > 0 ? `${label}: ${count}` : label}
      className="flex shrink-0 flex-col items-center gap-0.5 px-2 py-1 text-ink"
    >
      <span className="relative flex size-7 items-center justify-center [&_svg]:size-6">
        {icon}
        {count > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 left-4 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-[5px] text-xs font-semibold text-white"
          >
            {count}
          </span>
        )}
      </span>
      {showLabel && (
        <span aria-hidden className="text-xs">
          {label}
        </span>
      )}
    </Link>
  );
}
