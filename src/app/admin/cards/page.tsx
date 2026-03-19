'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { PhotocardRarityType, PhotocardConditionTypeValue } from '@/lib/domain-types';

interface PhotocardItem {
  id: string;
  name: string;
  imageUrl: string;
  rarity: PhotocardRarityType;
  conditionType: PhotocardConditionTypeValue;
  conditionValue: Record<string, unknown>;
  maxIssuance: number | null;
  isActive: boolean;
  _count: { userPhotocards: number };
}

interface FestivalItem {
  id: string;
  name: string;
  isActive: boolean;
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-100 text-gray-700',
  UNCOMMON: 'bg-green-100 text-green-700',
  RARE: 'bg-blue-100 text-blue-700',
  EPIC: 'bg-purple-100 text-purple-700',
  LEGENDARY: 'bg-yellow-100 text-yellow-700',
};

const RARITY_LABELS: Record<string, string> = {
  COMMON: '일반', UNCOMMON: '고급', RARE: '희귀', EPIC: '영웅', LEGENDARY: '전설',
};

const CONDITION_LABELS: Record<string, string> = {
  BOOTH_VISIT: '부스 방문', STAMP_COUNT: '스탬프 수', CAMPAIGN_COMPLETE: '캠페인 완료', REVIEW_WRITE: '후기 작성', MANUAL: '수동 지급',
};

export default function AdminCardsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: festivals } = useApiData<FestivalItem[]>(session ? '/api/festivals' : null);
  const activeFestivalId = festivals?.find(f => f.isActive)?.id || festivals?.[0]?.id;
  const { data: cards, loading, refetch } = useApiData<PhotocardItem[]>(session ? '/api/photocards' : null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', imageUrl: '', rarity: 'COMMON' as PhotocardRarityType,
    conditionType: 'MANUAL' as PhotocardConditionTypeValue,
    conditionValue: '{}', maxIssuance: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const handleSubmit = async () => {
    if (!activeFestivalId) {
      alert('먼저 축제를 생성해주세요.');
      return;
    }
    setBusy(true);
    let condVal = {};
    try { condVal = JSON.parse(form.conditionValue); } catch { /* empty */ }
    await fetchApi('/api/photocards', {
      method: 'POST',
      body: JSON.stringify({
        festivalId: activeFestivalId,
        name: form.name, description: form.description, imageUrl: form.imageUrl, rarity: form.rarity,
        conditionType: form.conditionType, conditionValue: condVal,
        maxIssuance: form.maxIssuance ? Number(form.maxIssuance) : null,
      }),
    });
    setShowForm(false);
    setForm({ name: '', description: '', imageUrl: '', rarity: 'COMMON', conditionType: 'MANUAL', conditionValue: '{}', maxIssuance: '' });
    await refetch();
    setBusy(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">포토카드 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="text-sm px-4 py-2 bg-accent-coral text-white rounded-lg">+ 포토카드 등록</button>
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
          <h2 className="font-semibold mb-3">새 포토카드</h2>
          <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3">
            <label className="block">
              <span className="text-sm font-medium">이름 *</span>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">이미지 URL *</span>
              <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium">설명 *</span>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" rows={2} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">희귀도</span>
              <select value={form.rarity} onChange={e => setForm(p => ({ ...p, rarity: e.target.value as PhotocardRarityType }))} className="mt-1 w-full border rounded-lg p-2 text-sm">
                {Object.entries(RARITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">획득 조건</span>
              <select value={form.conditionType} onChange={e => setForm(p => ({ ...p, conditionType: e.target.value as PhotocardConditionTypeValue }))} className="mt-1 w-full border rounded-lg p-2 text-sm">
                {Object.entries(CONDITION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">조건 값 (JSON)</span>
              <input value={form.conditionValue} onChange={e => setForm(p => ({ ...p, conditionValue: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm font-mono" placeholder='{"boothId":"..."}' />
            </label>
            <label className="block">
              <span className="text-sm font-medium">최대 발급 수 (빈칸=무제한)</span>
              <input type="number" value={form.maxIssuance} onChange={e => setForm(p => ({ ...p, maxIssuance: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={busy || !form.name || !form.imageUrl || !form.description} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">등록</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards?.map(c => (
          <div key={c.id} className="border rounded-xl overflow-hidden bg-white shadow-sm">
            {c.imageUrl && <img src={c.imageUrl} alt={c.name} className="w-full h-40 object-cover" />}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${RARITY_COLORS[c.rarity]}`}>{RARITY_LABELS[c.rarity]}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>조건: {CONDITION_LABELS[c.conditionType]}</p>
                <p>발급: {c._count.userPhotocards}장{c.maxIssuance ? ` / ${c.maxIssuance}장` : ''}</p>
                <p className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {c.isActive ? '활성' : '비활성'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!cards?.length && <p className="text-center text-gray-500 py-12">등록된 포토카드가 없습니다.</p>}
    </div>
  );
}
