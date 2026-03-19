'use client';

import { useEffect, useState } from 'react';
import { getStoredSession } from '@/lib/storage';

export function LiveVisitorCounter() {
  const [activeNow, setActiveNow] = useState<number | null>(null);
  const [todayTotal, setTodayTotal] = useState<number | null>(null);

  useEffect(() => {
    const session = getStoredSession();
    const sessionId = session?.guestId ?? `anon-${Math.random().toString(36).slice(2)}`;

    const heartbeat = () => {
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            setActiveNow(d.data.activeNow);
            setTodayTotal(d.data.todayTotal);
          }
        })
        .catch(() => {});
    };

    heartbeat();
    const interval = setInterval(heartbeat, 60000); // 1분마다

    return () => clearInterval(interval);
  }, []);

  if (activeNow === null) return null;

  return (
    <div className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm">
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <span className="font-semibold text-[var(--leaf-deep)]">{activeNow}명</span>
        <span className="text-[var(--foreground-soft)]">접속 중</span>
      </span>
      <span className="h-3 w-px bg-[var(--line)]" />
      <span className="text-xs text-[var(--foreground-soft)]">오늘 {todayTotal}명 방문</span>
    </div>
  );
}
