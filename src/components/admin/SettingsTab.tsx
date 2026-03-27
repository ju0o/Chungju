import { EventSettings } from "@/lib/types";

export function SettingsTab({
  settings,
  onChange,
}: {
  settings: EventSettings;
  onChange: (next: EventSettings) => void;
}) {
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">기본 설정</h2>
      <div className="mt-4 grid gap-3">
        <input className="festival-input" value={settings.eventName} onChange={(e) => onChange({ ...settings, eventName: e.target.value })} />
        <input className="festival-input" value={settings.heroTitle} onChange={(e) => onChange({ ...settings, heroTitle: e.target.value })} />
        <textarea className="festival-input festival-textarea" value={settings.heroDescription} onChange={(e) => onChange({ ...settings, heroDescription: e.target.value })} />
        <label className="grid gap-1 text-sm">
          <span className="text-xs text-[var(--foreground-soft)]">오늘의 추천 도서</span>
          <select
            className="festival-input"
            value={settings.featuredBookBoothId ?? ""}
            onChange={(e) => onChange({ ...settings, featuredBookBoothId: e.target.value })}
          >
            {settings.booths.map((booth) => (
              <option key={booth.id} value={booth.id}>
                {booth.bookTitle} · {booth.authorName ?? booth.name}
              </option>
            ))}
          </select>
        </label>
        <input className="festival-input" value={settings.eventDate} onChange={(e) => onChange({ ...settings, eventDate: e.target.value })} />
        <input className="festival-input" value={settings.eventPlace} onChange={(e) => onChange({ ...settings, eventPlace: e.target.value })} />
        <input className="festival-input" value={settings.operationHours} onChange={(e) => onChange({ ...settings, operationHours: e.target.value })} />
        <textarea className="festival-input festival-textarea" value={settings.notice} onChange={(e) => onChange({ ...settings, notice: e.target.value })} />
      </div>
    </section>
  );
}
