'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/hooks/useApi';

type AlertItem = {
  id: string;
  boothId?: string | null;
  bookTitle: string;
  authorName?: string | null;
  contact: string;
  status: string;
  note?: string | null;
  createdAt: string;
};

export default function AdminBookAlertsPage() {
  const { session, loading: authLoading, logout } = useAdminSession();
  const router = useRouter();
  const [items, setItems] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, router, session]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/book-alerts?page=1&pageSize=200', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json?.success || !Array.isArray(json?.data)) throw new Error();
      setItems(json.data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session) return;
    load();
  }, [session]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await fetch('/api/book-alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      await load();
    } finally {
      setUpdatingId('');
    }
  };

  if (authLoading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] p-4 md:p-8">
      <div className="mx-auto max-w-6xl grid gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">도서 입고 알림 신청</h1>
            <p className="text-sm text-[var(--foreground-soft)]">신청 목록을 확인하고 처리 상태를 변경합니다.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="festival-button paper rounded-xl px-4 py-2 text-sm">대시보드</Link>
            <button onClick={logout} className="festival-button paper rounded-xl px-4 py-2 text-sm">로그아웃</button>
          </div>
        </div>

        <section className="section-card rounded-[1.5rem] p-4">
          {loading ? (
            <p className="text-sm text-[var(--foreground-soft)]">목록을 불러오는 중입니다...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--foreground-soft)]">알림 신청이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--foreground-soft)]">
                    <th className="px-3 py-2">신청일시</th>
                    <th className="px-3 py-2">도서</th>
                    <th className="px-3 py-2">작가</th>
                    <th className="px-3 py-2">연락처</th>
                    <th className="px-3 py-2">상태</th>
                    <th className="px-3 py-2">처리</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--line)]/70">
                      <td className="px-3 py-2 text-[var(--foreground-soft)]">{new Date(item.createdAt).toLocaleString('ko-KR')}</td>
                      <td className="px-3 py-2 font-medium">{item.bookTitle}</td>
                      <td className="px-3 py-2">{item.authorName ?? '-'}</td>
                      <td className="px-3 py-2">{item.contact}</td>
                      <td className="px-3 py-2">{item.status}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1.5">
                          <button disabled={updatingId === item.id} onClick={() => updateStatus(item.id, 'CONTACTED')} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px]">연락완료</button>
                          <button disabled={updatingId === item.id} onClick={() => updateStatus(item.id, 'DONE')} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px]">처리완료</button>
                          <button disabled={updatingId === item.id} onClick={() => updateStatus(item.id, 'CANCELED')} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px]">취소</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

