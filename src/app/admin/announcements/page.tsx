'use client';

import { useEffect, useState } from 'react';
import { useAdminSession } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
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

export default function AdminAnnouncementsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'banner', priority: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, session, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/announcements')
        .then((r) => r.json())
        .then((d) => { if (d.success) setAnnouncements(d.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => [data.data, ...prev]);
        setForm({ title: '', content: '', type: 'banner', priority: 0 });
        setShowForm(false);
      }
    } catch {
      // 오류 무시
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a)));
      }
    } catch {
      // 오류 무시
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('공지를 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // 오류 무시
    }
  };

  if (authLoading || !session) return null;

  const TYPE_LABELS: Record<string, { label: string; style: string }> = {
    banner: { label: '배너', style: 'bg-blue-100 text-blue-700' },
    popup: { label: '팝업', style: 'bg-yellow-100 text-yellow-700' },
    urgent: { label: '긴급', style: 'bg-red-100 text-red-700' },
  };

  return (
    <main className="min-h-screen bg-[var(--paper)] p-4 md:p-8">
      <div className="mx-auto max-w-3xl grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-sm text-[var(--foreground-soft)] hover:underline">← 대시보드</Link>
            <h1 className="text-2xl font-bold mt-1">📢 공지 관리</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="festival-button festival-button--primary rounded-xl px-4 py-2 text-sm">
            {showForm ? '취소' : '+ 공지 추가'}
          </button>
        </div>

        {showForm && (
          <div className="section-card rounded-[1.75rem] p-5 grid gap-4">
            <h2 className="font-semibold">새 공지 작성</h2>
            <div>
              <label className="text-xs font-semibold text-[var(--foreground-soft)]">제목</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                placeholder="공지 제목"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--foreground-soft)]">내용</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                rows={3}
                placeholder="공지 내용을 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--foreground-soft)]">유형</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                >
                  <option value="banner">📌 배너</option>
                  <option value="popup">📢 팝업</option>
                  <option value="urgent">🚨 긴급</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--foreground-soft)]">우선순위</label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <button
              disabled={saving || !form.title || !form.content}
              onClick={handleCreate}
              className="festival-button festival-button--primary rounded-xl py-2 text-sm disabled:opacity-50"
            >
              {saving ? '저장 중...' : '공지 등록'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-sm text-[var(--foreground-soft)]">불러오는 중...</div>
        ) : announcements.length === 0 ? (
          <div className="section-card rounded-[1.75rem] p-8 text-center">
            <p className="text-4xl mb-3">📢</p>
            <p className="text-sm text-[var(--foreground-soft)]">등록된 공지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {announcements.map((a) => {
              const typeInfo = TYPE_LABELS[a.type] ?? TYPE_LABELS.banner;
              return (
                <div key={a.id} className="section-card rounded-[1.75rem] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeInfo.style}`}>{typeInfo.label}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {a.isActive ? '활성' : '비활성'}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-sm">{a.title}</h3>
                      <p className="mt-1 text-xs text-[var(--foreground-soft)] line-clamp-2">{a.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleToggle(a.id, a.isActive)}
                        className="rounded-lg border border-[var(--line)] px-2 py-1 text-[11px] hover:bg-gray-50"
                      >
                        {a.isActive ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-[11px] text-red-500 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
