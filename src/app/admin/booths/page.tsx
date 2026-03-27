'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useEffect } from 'react';
import type { BoothListItem } from '@/lib/domain-types';
import { AdminQuickSidebar } from '@/components/admin/AdminQuickSidebar';

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

interface FestivalItem {
  id: string;
  name: string;
  isActive: boolean;
}

const emptyForm: BoothForm = { name: '', category: '', location: '', description: '', operatingHours: '', contactInfo: '', imageUrl: '', mapX: '', mapY: '' };

export default function AdminBoothsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: festivals } = useApiData<FestivalItem[]>(session ? '/api/festivals' : null);
  const activeFestivalId = festivals?.find(f => f.isActive)?.id || festivals?.[0]?.id;
  const { data: booths, loading, refetch } = useApiData<BoothListItem[]>(session ? '/api/booths?pageSize=200' : null);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<BoothForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [coverOptions, setCoverOptions] = useState<string[]>([]);
  const [coverLoading, setCoverLoading] = useState(true);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);
  useEffect(() => {
    if (!session) return;
    fetch('/api/admin/book-covers', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json?.data)) {
          setCoverOptions(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setCoverLoading(false));
  }, [session]);

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
    if (!editing && !activeFestivalId) {
      alert('먼저 축제를 생성해주세요.');
      return;
    }
    setBusy(true);
    const body: Record<string, unknown> = { ...form, mapX: form.mapX ? Number(form.mapX) : null, mapY: form.mapY ? Number(form.mapY) : null };
    if (!editing) body.festivalId = activeFestivalId;
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
    <main className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-[260px,1fr]">
        <AdminQuickSidebar pathname={pathname} />
        <div className="p-0 sm:p-0 max-w-5xl">
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
          <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--paper)]/50 p-3">
            <p className="text-sm font-medium text-gray-700">표지 썸네일 미리보기</p>
            {form.imageUrl ? (
              <div className="mt-2 flex items-center gap-3">
                <Image src={form.imageUrl} alt="선택된 표지" width={72} height={96} className="h-24 w-[72px] rounded-md border object-cover" unoptimized />
                <p className="text-xs text-gray-600 break-all">{form.imageUrl}</p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">이미지 URL을 입력하거나 아래 표지에서 선택해주세요.</p>
            )}
          </div>
          <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--paper)]/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-700">도서 표지 선택</p>
              <span className="text-xs text-gray-500">{coverLoading ? '불러오는 중...' : `${coverOptions.length}개`}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {coverOptions.map((cover) => (
                <button
                  key={cover}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: cover }))}
                  className={`rounded-lg border p-1 transition ${form.imageUrl === cover ? 'border-[var(--accent-coral)] ring-2 ring-[var(--accent-coral)]/20' : 'border-[var(--line)]'}`}
                  title={cover}
                >
                  <Image src={cover} alt="도서 표지" width={68} height={90} className="h-20 w-full rounded object-cover" unoptimized />
                </button>
              ))}
            </div>
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
              {b.imageUrl && <Image src={b.imageUrl} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" unoptimized />}
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
      </div>
    </main>
  );
}
