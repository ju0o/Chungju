'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminQuickSidebar } from '@/components/admin/AdminQuickSidebar';

interface Festival {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  address: string | null;
  heroImageUrl: string | null;
  isActive: boolean;
  notices: Array<{ title: string; content: string; date: string; isPinned?: boolean }>;
  faqs: Array<{ question: string; answer: string }>;
  schedule: Array<{ time: string; title: string; description: string; location?: string }>;
}

export default function AdminFestivalPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const pathname = usePathname();
  const { data: festivals, loading, refetch } = useApiData<Festival[]>(session ? '/api/festivals' : null);
  const [editing, setEditing] = useState<Festival | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, session, router]);

  if (authLoading || !session) return null;

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setMessage('');
    try {
      if (editing.id) {
        await fetchApi(`/api/festivals/${editing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(editing),
        });
      } else {
        await fetchApi('/api/festivals', {
          method: 'POST',
          body: JSON.stringify(editing),
        });
      }
      setMessage('저장되었습니다.');
      setEditing(null);
      refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  const newFestival = (): Festival => ({
    id: '',
    name: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    location: '',
    address: null,
    heroImageUrl: null,
    isActive: true,
    notices: [],
    faqs: [],
    schedule: [],
  });

  return (
    <main className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      <div className="mx-auto grid max-w-[1400px] gap-4 lg:grid-cols-[260px,1fr]">
        <AdminQuickSidebar pathname={pathname} />
        <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => router.push('/admin/dashboard')} className="text-xs text-[var(--accent-coral)]">← 대시보드</button>
            <h1 className="text-xl font-bold mt-1">🎪 축제 정보 관리</h1>
          </div>
          <button onClick={() => setEditing(newFestival())} className="festival-button primary rounded-xl px-4 py-2 text-sm">
            + 축제 추가
          </button>
        </div>

        {message && (
          <div className="rounded-xl bg-[var(--accent-leaf)]/10 p-3 text-sm text-[var(--accent-leaf)]">{message}</div>
        )}

        {/* 편집 폼 */}
        {editing && (
          <div className="section-card rounded-[1.75rem] p-6 grid gap-4">
            <h2 className="font-semibold">{editing.id ? '축제 수정' : '새 축제 추가'}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">축제명 *</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="festival-input w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">장소 *</label>
                <input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className="festival-input w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">시작일 *</label>
                <input type="date" value={editing.startDate.slice(0, 10)} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} className="festival-input w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">종료일 *</label>
                <input type="date" value={editing.endDate.slice(0, 10)} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} className="festival-input w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">주소</label>
                <input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="festival-input w-full" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">히어로 이미지 URL</label>
                <input value={editing.heroImageUrl || ''} onChange={(e) => setEditing({ ...editing, heroImageUrl: e.target.value })} className="festival-input w-full" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">설명 *</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="festival-textarea w-full" rows={3} />
            </div>

            {/* 공지사항 편집 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium">공지사항</label>
                <button onClick={() => setEditing({ ...editing, notices: [...editing.notices, { title: '', content: '', date: new Date().toISOString().slice(0, 10) }] })} className="text-xs text-[var(--accent-coral)]">+ 추가</button>
              </div>
              {editing.notices.map((notice, i) => (
                <div key={i} className="grid gap-2 mb-2 rounded-xl border border-[var(--line)] p-3">
                  <input placeholder="제목" value={notice.title} onChange={(e) => { const n = [...editing.notices]; n[i] = { ...n[i], title: e.target.value }; setEditing({ ...editing, notices: n }); }} className="festival-input w-full text-sm" />
                  <textarea placeholder="내용" value={notice.content} onChange={(e) => { const n = [...editing.notices]; n[i] = { ...n[i], content: e.target.value }; setEditing({ ...editing, notices: n }); }} className="festival-textarea w-full text-sm" rows={2} />
                  <div className="flex gap-2">
                    <input type="date" value={notice.date} onChange={(e) => { const n = [...editing.notices]; n[i] = { ...n[i], date: e.target.value }; setEditing({ ...editing, notices: n }); }} className="festival-input flex-1 text-sm" />
                    <button onClick={() => setEditing({ ...editing, notices: editing.notices.filter((_, j) => j !== i) })} className="text-xs text-red-500">삭제</button>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ 편집 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium">FAQ</label>
                <button onClick={() => setEditing({ ...editing, faqs: [...editing.faqs, { question: '', answer: '' }] })} className="text-xs text-[var(--accent-coral)]">+ 추가</button>
              </div>
              {editing.faqs.map((faq, i) => (
                <div key={i} className="grid gap-2 mb-2 rounded-xl border border-[var(--line)] p-3">
                  <input placeholder="질문" value={faq.question} onChange={(e) => { const f = [...editing.faqs]; f[i] = { ...f[i], question: e.target.value }; setEditing({ ...editing, faqs: f }); }} className="festival-input w-full text-sm" />
                  <textarea placeholder="답변" value={faq.answer} onChange={(e) => { const f = [...editing.faqs]; f[i] = { ...f[i], answer: e.target.value }; setEditing({ ...editing, faqs: f }); }} className="festival-textarea w-full text-sm" rows={2} />
                  <button onClick={() => setEditing({ ...editing, faqs: editing.faqs.filter((_, j) => j !== i) })} className="text-xs text-red-500 text-right">삭제</button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="festival-button paper rounded-xl px-6 py-2 text-sm">취소</button>
              <button onClick={handleSave} disabled={saving} className="festival-button primary rounded-xl px-6 py-2 text-sm">
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

        {/* 축제 목록 */}
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-3">
            {festivals?.map((f) => (
              <div key={f.id} className="section-card rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{f.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {f.isActive ? '활성' : '비활성'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--foreground-soft)] mt-1">{f.description.slice(0, 100)}...</p>
                    <div className="mt-2 flex gap-3 text-xs text-[var(--foreground-soft)]">
                      <span>📍 {f.location}</span>
                      <span>📅 {new Date(f.startDate).toLocaleDateString('ko-KR')} ~ {new Date(f.endDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <button onClick={() => setEditing(f)} className="festival-button paper rounded-lg px-3 py-1 text-xs">수정</button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
