'use client';

import { useState, useEffect } from 'react';

const FESTIVAL_START = new Date('2026-03-28T11:00:00+09:00');
const FESTIVAL_END = new Date('2026-03-29T17:30:00+09:00');
const TOTAL_DURATION = FESTIVAL_END.getTime() - FESTIVAL_START.getTime();

export function FestivalProgressBar() {
  const [progress, setProgress] = useState<number | null>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    function update() {
      const now = Date.now();
      if (now < FESTIVAL_START.getTime()) {
        setProgress(null);
        setLabel('축제 시작 전');
      } else if (now > FESTIVAL_END.getTime()) {
        setProgress(100);
        setLabel('축제 종료');
      } else {
        const elapsed = now - FESTIVAL_START.getTime();
        const pct = Math.min(100, Math.round((elapsed / TOTAL_DURATION) * 1000) / 10);
        setProgress(pct);

        // 현재 시간대 알림
        const hour = new Date().getHours();
        const min = new Date().getMinutes();
        if (hour < 12) setLabel(`오전 진행 중 · ${hour}:${min.toString().padStart(2, '0')}`);
        else if (hour < 15) setLabel(`오후 진행 중 · ${hour}:${min.toString().padStart(2, '0')}`);
        else setLabel(`마무리 진행 중 · ${hour}:${min.toString().padStart(2, '0')}`);
      }
    }

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (progress === null) return null;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-medium text-[var(--foreground-soft)]">🎪 축제 진행률</span>
        <span className="font-bold text-[var(--accent-coral)]">{progress}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[var(--line)] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent-coral)] via-[var(--accent-petal)] to-[var(--accent-leaf)] transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--foreground-soft)]">
        <span>11:00 시작</span>
        <span>{label}</span>
        <span>17:30 종료</span>
      </div>
    </div>
  );
}
