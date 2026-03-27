'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/hooks/useApi';
import { PublishingConsultation } from '@/lib/types';

type ConsultationResponse = {
  success: boolean;
  data: PublishingConsultation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default function AdminPublishingConsultationsPage() {
  const { session, loading: authLoading, logout } = useAdminSession();
  const router = useRouter();
  const [items, setItems] = useState<PublishingConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState<'전체' | '전자책' | 'POD'>('전체');
  const [hasManuscript, setHasManuscript] = useState<'전체' | '유' | '무'>('전체');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, router, session]);

  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (search.trim()) params.set('search', search.trim());
        if (format !== '전체') params.set('format', format);
        if (hasManuscript !== '전체') params.set('hasManuscript', hasManuscript);
        const res = await fetch(`/api/publishing-consultations?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const json: ConsultationResponse = await res.json();
        if (!res.ok || !json.success) throw new Error('데이터를 불러오지 못했습니다.');
        setItems(json.data);
        setTotal(json.total);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [session, page, search, format, hasManuscript]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

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
            <h1 className="text-2xl font-bold">출판 상담 신청 목록</h1>
            <p className="text-sm text-[var(--foreground-soft)]">전체 신청 내역을 조회하고 관리할 수 있습니다.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/dashboard" className="festival-button paper rounded-xl px-4 py-2 text-sm">대시보드</Link>
            <button onClick={logout} className="festival-button paper rounded-xl px-4 py-2 text-sm">로그아웃</button>
          </div>
        </div>

        <section className="section-card rounded-[1.5rem] p-4">
          <div className="grid gap-2 md:grid-cols-4">
            <input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="활동명/장르/연락처 검색"
              className="festival-input"
            />
            <select value={format} onChange={(e) => { setPage(1); setFormat(e.target.value as typeof format); }} className="festival-input">
              <option value="전체">포맷 전체</option>
              <option value="전자책">전자책</option>
              <option value="POD">POD</option>
            </select>
            <select value={hasManuscript} onChange={(e) => { setPage(1); setHasManuscript(e.target.value as typeof hasManuscript); }} className="festival-input">
              <option value="전체">원고 전체</option>
              <option value="유">원고 유</option>
              <option value="무">원고 무</option>
            </select>
            <div className="rounded-xl border border-[var(--line)] bg-white/75 px-4 py-3 text-sm text-[var(--foreground-soft)]">
              총 {total.toLocaleString()}건
            </div>
          </div>
        </section>

        <section className="section-card rounded-[1.5rem] p-4">
          {loading ? (
            <p className="text-sm text-[var(--foreground-soft)]">목록을 불러오는 중입니다...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--foreground-soft)]">조회된 신청 내역이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[var(--foreground-soft)]">
                    <th className="px-3 py-2">신청일시</th>
                    <th className="px-3 py-2">활동명</th>
                    <th className="px-3 py-2">원고</th>
                    <th className="px-3 py-2">장르</th>
                    <th className="px-3 py-2">포맷</th>
                    <th className="px-3 py-2">연락처</th>
                    <th className="px-3 py-2">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--line)]/70">
                      <td className="px-3 py-2 text-[var(--foreground-soft)]">{new Date(item.createdAt).toLocaleString('ko-KR')}</td>
                      <td className="px-3 py-2 font-medium">{item.activityName}</td>
                      <td className="px-3 py-2">{item.hasManuscript}</td>
                      <td className="px-3 py-2">{item.genre}</td>
                      <td className="px-3 py-2">{item.publishFormat}</td>
                      <td className="px-3 py-2">{item.contact}</td>
                      <td className="max-w-[280px] truncate px-3 py-2 text-[var(--foreground-soft)]">{item.note ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-[var(--foreground-soft)]">{page} / {totalPages} 페이지</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1.5 disabled:opacity-50"
              >
                이전
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1.5 disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
