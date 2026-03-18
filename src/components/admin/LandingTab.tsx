import { EventSettings } from "@/lib/types";

export function LandingTab({
  settings,
  onChange,
}: {
  settings: EventSettings;
  onChange: (next: EventSettings) => void;
}) {
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">랜딩 관리</h2>
      <div className="mt-4 grid gap-3">
        {Object.entries(settings.sectionVisibility).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between rounded-2xl border border-[var(--line)] p-4 text-sm">
            <span>{key}</span>
            <input
              type="checkbox"
              checked={value}
              onChange={() =>
                onChange({
                  ...settings,
                  sectionVisibility: { ...settings.sectionVisibility, [key]: !value },
                })
              }
            />
          </label>
        ))}
        <textarea
          className="festival-input festival-textarea"
          value={settings.archiveNotice}
          onChange={(e) => onChange({ ...settings, archiveNotice: e.target.value })}
        />
      </div>
    </section>
  );
}
