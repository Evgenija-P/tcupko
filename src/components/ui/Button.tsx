import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "m" | "s";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed";

const sizes: Record<Size, string> = {
  m: "px-6 py-3 text-base [&_svg]:size-6",
  s: "px-4 py-2 text-sm [&_svg]:size-5",
};

// Secondary keeps its 1px border in every state so the size never changes.
const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:bg-disabled disabled:text-ink-disabled",
  secondary:
    "border border-line bg-page text-ink hover:bg-surface disabled:border-disabled disabled:bg-disabled disabled:text-ink-disabled",
  ghost:
    "text-ink-accent hover:bg-accent-subtle disabled:bg-transparent disabled:text-ink-disabled",
};

export function buttonClass(variant: Variant = "primary", size: Size = "m", className = "") {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  variant,
  size,
  icon,
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {loading ? "Зачекайте…" : children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
