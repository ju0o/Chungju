'use client';

import { useEffect, useState } from 'react';

const LEVEL_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  LOW: { label: '여유', color: 'bg-green-100 text-green-700', emoji: '🟢' },
  MODERATE: { label: '보통', color: 'bg-yellow-100 text-yellow-700', emoji: '🟡' },
  HIGH: { label: '붐빔', color: 'bg-red-100 text-red-700', emoji: '🔴' },
};

interface CrowdStatus {
  boothId: string;
  level: string;
  waitMin: number;
  note: string | null;
  booth: { id: string; name: string; location: string };
}

export function BoothCrowdBar() {
  const [statuses, setStatuses] = useState<CrowdStatus[]>([]);

  useEffect(() => {
    fetch('/api/crowd')
      .then((r) => r.json())
      .then((d) => { if (d.success) setStatuses(d.data); })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch('/api/crowd')
        .then((r) => r.json())
        .then((d) => { if (d.success) setStatuses(d.data); })
        .catch(() => {});
    }, 30000); // 30초마다 갱신

    return () => clearInterval(interval);
  }, []);

  if (statuses.length === 0) return null;

  return (
    <section className="section-card rounded-[1.75rem] p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span>📊</span> 실시간 혼잡도
      </h3>
      <div className="mt-3 grid gap-2">
        {statuses.map((s) => {
          const info = LEVEL_MAP[s.level] ?? LEVEL_MAP.LOW;
          return (
            <div key={s.boothId} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.booth.name}</p>
                <p className="text-[11px] text-[var(--foreground-soft)]">📍 {s.booth.location}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {s.waitMin > 0 && <span className="text-xs text-[var(--foreground-soft)]">~{s.waitMin}분</span>}
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${info.color}`}>
                  {info.emoji} {info.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
