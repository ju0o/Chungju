type Props = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: Props) {
  return (
    <div className="space-y-3">
      <p className="section-eyebrow">{eyebrow}</p>
      <div className="space-y-2">
        <h2 className="section-title max-w-[12ch] text-[var(--foreground)]">{title}</h2>
        <div className="torn-divider" />
        {description ? <p className="section-description">{description}</p> : null}
      </div>
    </div>
  );
}
