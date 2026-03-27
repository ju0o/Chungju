'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { ReviewStatusType } from '@/lib/domain-types';
import { AdminQuickSidebar } from '@/components/admin/AdminQuickSidebar';

interface ReviewItem {
  id: string;
  rating: number;
  content: string;
  status: ReviewStatusType;
  createdAt: string;
  user: { id: string; nickname: string };
  booth: { id: string; name: string };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  HIDDEN: 'bg-gray-100 text-gray-700',
  DELETED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '대기', APPROVED: '승인', HIDDEN: '숨김', DELETED: '삭제',
};

export default function AdminReviewsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: reviews, loading, refetch } = useApiData<ReviewItem[]>(
    session ? `/api/reviews?admin=true${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}` : null
  );
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="min-h-screen p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const updateStatus = async (id: string, status: ReviewStatusType) => {
    setBusy(id);
    await fetchApi(`/api/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await refetch();
    setBusy(null);
  };

  const deleteReview = async (id: string) => {
    if (!confirm('이 후기를 삭제하시겠습니까?')) return;
    setBusy(id);
    await fetchApi(`/api/reviews/${id}`, { method: 'DELETE' });
    await refetch();
    setBusy(null);
  };

  const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-[260px,1fr]">
        <AdminQuickSidebar pathname={pathname} />
        <section className="grid gap-4">
          <div className="section-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">후기 관리</h1>
              <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
            </div>
          </div>

          <div className="section-card rounded-xl p-3">
            <div className="flex gap-2 flex-wrap">
              {['all', 'PENDING', 'APPROVED', 'HIDDEN'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${statusFilter === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {s === 'all' ? '전체' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {reviews?.map(r => (
              <div key={r.id} className="section-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-amber-500 text-sm">{stars(r.rating)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">{r.content}</p>
                    <p className="text-xs text-gray-500">
                      {r.user.nickname} · {r.booth.name} · {new Date(r.createdAt).toLocaleString('ko')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 flex-wrap">
                  {r.status !== 'APPROVED' && (
                    <button onClick={() => updateStatus(r.id, 'APPROVED')} disabled={busy === r.id}
                      className="text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-lg">승인</button>
                  )}
                  {r.status !== 'HIDDEN' && (
                    <button onClick={() => updateStatus(r.id, 'HIDDEN')} disabled={busy === r.id}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg">숨김</button>
                  )}
                  <button onClick={() => deleteReview(r.id)} disabled={busy === r.id}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">삭제</button>
                </div>
              </div>
            ))}
            {!reviews?.length && <p className="text-center text-gray-500 py-12">후기가 없습니다.</p>}
          </div>

        </section>
      </div>
    </main>
  );
}
