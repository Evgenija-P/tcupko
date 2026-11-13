import Link from "next/link";

/** Spark asset is 21×21 in the design (15×15 in the mobile header). */
export function Logo({ compact = false }: { compact?: boolean }) {
  const spark = compact ? 15 : 21;
  return (
    <Link
      href="/"
      aria-label="Цупко — на головну"
      className={`flex shrink-0 items-center ${compact ? "gap-1.5" : "gap-2"}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand SVG, nothing to optimize */}
      <img src="/brand/spark.svg" alt="" width={spark} height={spark} />
      <span
        className={`leading-none font-extrabold text-ink ${
          compact ? "text-2xl tracking-[-0.48px]" : "text-[32px] tracking-[-0.64px]"
        }`}
      >
        ЦУПКО
      </span>
    </Link>
  );
}
