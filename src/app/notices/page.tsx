'use client';

import { useApiData } from '@/hooks/useApi';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isActive: boolean;
  priority: number;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
}

const TYPE_MAP: Record<string, { icon: string; label: string; style: string }> = {
  urgent: { icon: '🚨', label: '긴급', style: 'bg-red-50 text-red-700 border-red-200' },
  banner: { icon: '📢', label: '공지', style: 'bg-blue-50 text-blue-700 border-blue-200' },
  popup: { icon: '💬', label: '팝업', style: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function NoticesPage() {
  const { data: notices, loading } = useApiData<Announcement[]>('/api/announcements?all=true');

  if (loading) {
    return (
      <main className="app-shell p-4 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
      </main>
    );
  }

  const active = (notices || []).filter(n => n.isActive);
  const past = (notices || []).filter(n => !n.isActive);

  return (
    <main className="app-shell grid gap-4 p-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between">
          <h1 className="section-title text-lg font-bold">📢 공지사항</h1>
          <Link href="/" className="text-xs text-[var(--foreground-soft)] underline">← 홈</Link>
        </div>
        <p className="body-copy mt-1 text-sm text-[var(--foreground-soft)]">
          작가 및 책 부스 관련 공지와 안내사항을 확인하세요
        </p>
      </section>

      {/* 활성 공지 */}
      {active.length > 0 && (
        <section>
          <h2 className="px-1 mb-2 text-xs font-semibold text-[var(--accent-coral)]">현재 공지</h2>
          <div className="grid gap-3">
            {active.map(notice => {
              const typeInfo = TYPE_MAP[notice.type] || TYPE_MAP.banner;
              return (
                <details key={notice.id} className={`rounded-xl border ${typeInfo.style} overflow-hidden`}>
                  <summary className="cursor-pointer p-4">
                    <div className="flex items-center gap-2">
                      <span>{typeInfo.icon}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium border border-current/20">
                        {typeInfo.label}
                      </span>
                      <span className="flex-1 font-medium text-sm">{notice.title}</span>
                    </div>
                    <div className="mt-1 text-xs opacity-60">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </summary>
                  <div className="border-t border-current/10 p-4 text-sm whitespace-pre-wrap">
                    {notice.content}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {/* 지난 공지 */}
      {past.length > 0 && (
        <section>
          <h2 className="px-1 mb-2 text-xs font-semibold text-[var(--foreground-soft)]">지난 공지</h2>
          <div className="grid gap-2">
            {past.map(notice => {
              const typeInfo = TYPE_MAP[notice.type] || TYPE_MAP.banner;
              return (
                <details key={notice.id} className="rounded-xl border border-[var(--line)] bg-white/60 overflow-hidden">
                  <summary className="cursor-pointer p-4">
                    <div className="flex items-center gap-2">
                      <span className="opacity-50">{typeInfo.icon}</span>
                      <span className="flex-1 text-sm text-[var(--foreground-soft)]">{notice.title}</span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--foreground-soft)] opacity-60">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </div>
                  </summary>
                  <div className="border-t border-[var(--line)] p-4 text-sm text-[var(--foreground-soft)] whitespace-pre-wrap">
                    {notice.content}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}

      {!notices?.length && (
        <div className="py-12 text-center text-sm text-[var(--foreground-soft)]">아직 공지가 없습니다</div>
      )}
    </main>
  );
}
