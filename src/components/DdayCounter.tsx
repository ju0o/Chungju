'use client';

import { useEffect, useState } from 'react';

interface EventSettings {
  eventDate: string;
  startDate?: string;
}

export function DdayCounter({ targetDate }: { targetDate?: string }) {
  const [diff, setDiff] = useState<{ days: number; hours: number; mins: number; status: 'before' | 'during' | 'after' }>({
    days: 0, hours: 0, mins: 0, status: 'before',
  });

  useEffect(() => {
    const target = targetDate ? new Date(targetDate) : new Date('2026-03-28T11:00:00+09:00');
    const endDate = new Date('2026-03-29T17:30:00+09:00');

    const calc = () => {
      const now = new Date();
      if (now >= target && now <= endDate) {
        setDiff({ days: 0, hours: 0, mins: 0, status: 'during' });
      } else if (now > endDate) {
        setDiff({ days: 0, hours: 0, mins: 0, status: 'after' });
      } else {
        const ms = target.getTime() - now.getTime();
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        setDiff({ days, hours, mins, status: 'before' });
      }
    };

    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (diff.status === 'during') {
    return (
      <div className="flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="font-semibold text-green-700">축제 진행 중!</span>
      </div>
    );
  }

  if (diff.status === 'after') {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--foreground-soft)]">
        📸 축제가 종료되었습니다
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2">
      <span className="text-xs font-semibold text-[var(--accent-strong)]">D-{diff.days || 'Day'}</span>
      <div className="flex gap-1.5 text-center">
        {[
          { value: diff.days, unit: '일' },
          { value: diff.hours, unit: '시' },
          { value: diff.mins, unit: '분' },
        ].map(({ value, unit }) => (
          <div key={unit} className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold tabular-nums text-[var(--foreground)]">{value}</span>
            <span className="text-[10px] text-[var(--foreground-soft)]">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
