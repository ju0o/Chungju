import { EventSettings, StampPoint } from "@/lib/types";

export function AdminPreviewPanel({
  settings,
  stampPoints,
}: {
  settings: EventSettings;
  stampPoints: StampPoint[];
}) {
  return (
    <aside className="section-card hidden rounded-[1.75rem] p-5 xl:block">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Preview</p>
      <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl">{settings.heroTitle}</h2>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{settings.heroDescription}</p>
      <div className="mt-4 grid gap-2">
        {settings.programs.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-2xl border border-[var(--line)] p-3 text-sm">
            {item.time} · {item.title}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {stampPoints.filter((item) => item.isPublished).map((point) => (
          <span key={point.id} className="rounded-full border border-[var(--line)] px-3 py-2 text-xs">
            {point.title}
          </span>
        ))}
      </div>
    </aside>
  );
}
