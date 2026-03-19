'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  requiredStamps: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  _count: { stampScans: number; userProgress: number };
}

interface FestivalItem {
  id: string;
  name: string;
  isActive: boolean;
}

export default function AdminStampsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: festivals } = useApiData<FestivalItem[]>(session ? '/api/festivals' : null);
  const activeFestivalId = festivals?.find(f => f.isActive)?.id || festivals?.[0]?.id;
  const { data: campaigns, loading, refetch } = useApiData<Campaign[]>(session ? '/api/stamps/campaigns' : null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', requiredStamps: '5', startDate: '', endDate: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const handleSubmit = async () => {
    if (!activeFestivalId) {
      alert('먼저 축제를 생성해주세요.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      alert('시작일과 종료일을 입력해주세요.');
      return;
    }
    setBusy(true);
    await fetchApi('/api/stamps/campaigns', {
      method: 'POST',
      body: JSON.stringify({
        festivalId: activeFestivalId,
        name: form.name,
        description: form.description,
        requiredStamps: Number(form.requiredStamps),
        startDate: form.startDate,
        endDate: form.endDate,
      }),
    });
    setShowForm(false);
    setForm({ name: '', description: '', requiredStamps: '5', startDate: '', endDate: '' });
    await refetch();
    setBusy(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">스탬프 캠페인 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="text-sm px-4 py-2 bg-accent-coral text-white rounded-lg">+ 캠페인 생성</button>
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
          <h2 className="font-semibold mb-3">새 캠페인</h2>
          <label className="block mb-3">
            <span className="text-sm font-medium">캠페인명 *</span>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium">설명</span>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" rows={2} />
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <label className="block">
              <span className="text-sm font-medium">필요 스탬프 수</span>
              <input type="number" min="1" value={form.requiredStamps} onChange={e => setForm(p => ({ ...p, requiredStamps: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">시작일</span>
              <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">종료일</span>
              <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={busy || !form.name} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">생성</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {campaigns?.map(c => (
          <div key={c.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                {c.description && <p className="text-sm text-gray-600 mb-1">{c.description}</p>}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>필요 스탬프: {c.requiredStamps}개</span>
                  <span>총 스캔: {c._count.stampScans}회</span>
                  <span>참여자: {c._count.userProgress}명</span>
                </div>
                {(c.startDate || c.endDate) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {c.startDate && `시작: ${new Date(c.startDate).toLocaleDateString('ko')}`}
                    {c.startDate && c.endDate && ' · '}
                    {c.endDate && `종료: ${new Date(c.endDate).toLocaleDateString('ko')}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        {!campaigns?.length && <p className="text-center text-gray-500 py-12">등록된 캠페인이 없습니다.</p>}
      </div>
    </div>
  );
}
