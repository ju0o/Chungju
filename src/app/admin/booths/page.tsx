'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import type { BoothListItem } from '@/lib/domain-types';

interface BoothForm {
  name: string;
  category: string;
  location: string;
  description: string;
  operatingHours: string;
  contactInfo: string;
  imageUrl: string;
  mapX: string;
  mapY: string;
}

const emptyForm: BoothForm = { name: '', category: '', location: '', description: '', operatingHours: '', contactInfo: '', imageUrl: '', mapX: '', mapY: '' };

export default function AdminBoothsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: booths, loading, refetch } = useApiData<BoothListItem[]>(session ? '/api/booths?pageSize=200' : null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<BoothForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = async (id: string) => {
    const res = await fetchApi<{ data: BoothForm & { id: string } }>(`/api/booths/${id}`);
    if (res.data) {
      const d = res.data;
      setForm({ name: d.name, category: d.category, location: d.location, description: d.description || '', operatingHours: d.operatingHours || '', contactInfo: d.contactInfo || '', imageUrl: d.imageUrl || '', mapX: String(d.mapX ?? ''), mapY: String(d.mapY ?? '') });
      setEditing(id);
      setShowForm(true);
    }
  };

  const handleSubmit = async () => {
    setBusy(true);
    const body = { ...form, mapX: form.mapX ? Number(form.mapX) : null, mapY: form.mapY ? Number(form.mapY) : null };
    if (editing) {
      await fetchApi(`/api/booths/${editing}`, { method: 'PATCH', body: JSON.stringify(body) });
    } else {
      await fetchApi('/api/booths', { method: 'POST', body: JSON.stringify(body) });
    }
    setShowForm(false);
    await refetch();
    setBusy(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 부스를 삭제하시겠습니까?')) return;
    await fetchApi(`/api/booths/${id}`, { method: 'DELETE' });
    await refetch();
  };

  const F = (label: string, key: keyof BoothForm, textarea = false) => (
    <label className="block mb-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {textarea
        ? <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" rows={3} />
        : <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" />}
    </label>
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">부스 관리</h1>
        <div className="flex gap-2">
          <button onClick={openNew} className="text-sm px-4 py-2 bg-accent-coral text-white rounded-lg">+ 부스 등록</button>
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
          <h2 className="font-semibold mb-3">{editing ? '부스 수정' : '새 부스 등록'}</h2>
          <div className="grid sm:grid-cols-2 gap-x-4">
            {F('부스명 *', 'name')}
            {F('카테고리', 'category')}
            {F('위치', 'location')}
            {F('운영시간', 'operatingHours')}
            {F('연락처', 'contactInfo')}
            {F('이미지 URL', 'imageUrl')}
            {F('지도 X', 'mapX')}
            {F('지도 Y', 'mapY')}
          </div>
          {F('설명', 'description', true)}
          <div className="flex gap-2 mt-2">
            <button onClick={handleSubmit} disabled={busy || !form.name} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">{editing ? '수정' : '등록'}</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {booths?.map(b => (
          <div key={b.id} className="border rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {b.imageUrl && <img src={b.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${b.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <h3 className="font-semibold truncate">{b.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{b.category}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{b.location} {b.operatingHours && `· ${b.operatingHours}`}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => openEdit(b.id)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg">수정</button>
              <button onClick={() => handleDelete(b.id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">삭제</button>
            </div>
          </div>
        ))}
        {!booths?.length && <p className="text-center text-gray-500 py-12">등록된 부스가 없습니다.</p>}
      </div>
    </div>
  );
}
