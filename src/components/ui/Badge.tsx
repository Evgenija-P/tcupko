type Tone = "sale" | "new" | "bestseller" | "markdown";

const tones: Record<Tone, string> = {
  sale: "bg-error",
  new: "bg-info",
  bestseller: "bg-accent",
  markdown: "bg-warning",
};

/** Figma "Label": 12/16 semibold, white on colour, radius 4. */
export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`rounded-sm px-2 py-1 text-xs font-semibold text-white ${tones[tone]}`}>
      {children}
    </span>
  );
}
