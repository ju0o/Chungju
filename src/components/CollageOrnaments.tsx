type Props = {
  className?: string;
};

export function CollageOrnaments({ className = "" }: Props) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="floating-orb floating-orb--petal left-[-1rem] top-8 h-16 w-16" />
      <div className="floating-orb floating-orb--leaf right-8 top-14 h-12 w-12" />
      <div className="floating-orb floating-orb--sky bottom-10 right-[-0.5rem] h-20 w-20" />
      <div className="absolute left-5 top-5 rotate-[-6deg] rounded-[1.1rem] border border-white/70 bg-[rgba(255,252,244,0.74)] px-3 py-2 text-[10px] tracking-[0.22em] text-[var(--foreground-soft)] shadow-[0_10px_20px_rgba(90,75,58,0.08)]">
        PAPER NOTE
      </div>
      <div className="absolute bottom-5 left-6 h-10 w-20 rotate-[8deg] rounded-[999px] bg-[rgba(240,222,170,0.5)] blur-[2px]" />
    </div>
  );
}

export function PaperLabel({
  text,
  tone = "default",
}: {
  text: string;
  tone?: "default" | "leaf" | "petal";
}) {
  const toneClass =
    tone === "leaf"
      ? "bg-[rgba(123,151,117,0.1)] text-[var(--leaf-deep)]"
      : tone === "petal"
        ? "bg-[rgba(234,183,190,0.16)] text-[var(--accent-strong)]"
        : "bg-[rgba(255,250,243,0.92)] text-[var(--foreground-soft)]";

  return <span className={`paper-label text-xs font-medium ${toneClass}`}>{text}</span>;
}
