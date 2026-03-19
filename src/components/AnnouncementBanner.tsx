'use client';

import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: number;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((d) => { if (d.success) setAnnouncements(d.data); })
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="grid gap-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className={`relative rounded-xl border p-3 text-sm ${
            a.type === 'urgent'
              ? 'border-red-300 bg-red-50'
              : a.type === 'popup'
              ? 'border-yellow-300 bg-yellow-50'
              : 'border-[var(--line)] bg-white/80'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">
                {a.type === 'urgent' ? '🚨 ' : a.type === 'popup' ? '📢 ' : '📌 '}
                {a.title}
              </p>
              <p className="mt-1 text-[var(--foreground-soft)]">{a.content}</p>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(a.id))}
              className="shrink-0 text-[var(--foreground-soft)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
