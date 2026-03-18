import { SiteMode } from "@/lib/types";

export function StatusTab({
  siteMode,
  onChange,
  allowedModes,
}: {
  siteMode: SiteMode;
  onChange: (next: SiteMode) => void;
  allowedModes: SiteMode[];
}) {
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">사이트 상태 관리</h2>
      <div className="mt-4 grid gap-3">
        {(["preparing", "live", "ended", "archive"] as SiteMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={!allowedModes.includes(mode)}
            onClick={() => onChange(mode)}
            className={`rounded-2xl border px-4 py-4 text-left disabled:opacity-40 ${siteMode === mode ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--line)]"}`}
          >
            {mode}
          </button>
        ))}
      </div>
    </section>
  );
}
