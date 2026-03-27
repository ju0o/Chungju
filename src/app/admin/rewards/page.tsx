'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  requiredStamps: number;
  imageUrl: string | null;
  stock: number | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminRewardsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: rewards, loading, refetch } = useApiData<RewardItem[]>(session ? '/api/rewards' : null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', requiredStamps: '5', imageUrl: '', stock: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const handleSubmit = async () => {
    setBusy(true);
    await fetchApi('/api/rewards', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name, description: form.description,
        requiredStamps: Number(form.requiredStamps),
        imageUrl: form.imageUrl || null,
        stock: form.stock ? Number(form.stock) : null,
      }),
    });
    setShowForm(false);
    setForm({ name: '', description: '', requiredStamps: '5', imageUrl: '', stock: '' });
    await refetch();
    setBusy(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">리워드 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="text-sm px-4 py-2 bg-accent-coral text-white rounded-lg">+ 리워드 등록</button>
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
          <h2 className="font-semibold mb-3">새 리워드</h2>
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
            <label className="block">
              <span className="text-sm font-medium">이름 *</span>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">이미지 URL</span>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">필요 스탬프 수</span>
              <input type="number" min="1" value={form.requiredStamps} onChange={e => setForm(p => ({ ...p, requiredStamps: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">재고 (빈칸=무제한)</span>
              <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
          </div>
          <label className="block mt-3">
            <span className="text-sm font-medium">설명</span>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" rows={2} />
          </label>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={busy || !form.name} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">등록</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {rewards?.map(r => (
          <div key={r.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start gap-3">
              {r.imageUrl && <Image src={r.imageUrl} alt={r.name} width={64} height={64} className="h-16 w-16 rounded-lg object-cover" unoptimized />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${r.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <h3 className="font-semibold text-sm truncate">{r.name}</h3>
                </div>
                {r.description && <p className="text-xs text-gray-600 mb-1">{r.description}</p>}
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>스탬프 {r.requiredStamps}개 필요</p>
                  <p>재고: {r.stock !== null ? `${r.stock}개` : '무제한'}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!rewards?.length && <p className="text-center text-gray-500 py-12">등록된 리워드가 없습니다.</p>}
    </div>
  );
}
