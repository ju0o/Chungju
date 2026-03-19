'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AdminItem {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: '슈퍼관리자',
  ADMIN: '관리자',
  MODERATOR: '모더레이터',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MODERATOR: 'bg-green-100 text-green-700',
};

export default function AdminMembersPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: admins, loading, refetch } = useApiData<AdminItem[]>(
    session?.role === 'SUPER_ADMIN' ? '/api/admin/members' : null
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'ADMIN' });
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
    if (!authLoading && session && session.role !== 'SUPER_ADMIN') router.push('/admin/dashboard');
  }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session || session.role !== 'SUPER_ADMIN') return null;

  const handleCreate = async () => {
    if (!form.email || !form.name || !form.password) return;
    setBusy(true);
    const res = await fetchApi<{ success: boolean; error?: string }>('/api/admin/members', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    if (!res.success) {
      alert(res.error || '생성 실패');
    } else {
      setShowForm(false);
      setForm({ email: '', name: '', password: '', role: 'ADMIN' });
      await refetch();
    }
    setBusy(false);
  };

  const handleRoleChange = async (id: string, role: string) => {
    await fetchApi(`/api/admin/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    setEditingId(null);
    await refetch();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const res = await fetchApi<{ success: boolean; error?: string }>(`/api/admin/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (!res.success) {
      alert(res.error || '변경 실패');
    }
    await refetch();
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`정말 ${email} 계정을 삭제하시겠습니까?`)) return;
    const res = await fetchApi<{ success: boolean; error?: string }>(`/api/admin/members/${id}`, {
      method: 'DELETE',
    });
    if (!res.success) {
      alert(res.error || '삭제 실패');
    }
    await refetch();
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">관리자 관리</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="text-sm px-4 py-2 bg-accent-coral text-white rounded-lg">+ 관리자 추가</button>
          <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
        </div>
      </div>

      {showForm && (
        <div className="border rounded-xl p-4 bg-white shadow-sm mb-6">
          <h2 className="font-semibold mb-3">새 관리자 추가</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">이메일 *</span>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" placeholder="admin@example.com" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">이름 *</span>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" placeholder="홍길동" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">비밀번호 *</span>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm" placeholder="••••••••" autoComplete="new-password" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">역할</span>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="mt-1 w-full border rounded-lg p-2 text-sm">
                <option value="ADMIN">관리자</option>
                <option value="MODERATOR">모더레이터</option>
              </select>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={busy || !form.email || !form.name || !form.password} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-50">추가</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">취소</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {admins?.map(a => (
          <div key={a.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${a.isActive ? 'bg-gray-100' : 'bg-gray-200 opacity-50'}`}>
                  {a.role === 'SUPER_ADMIN' ? '👑' : a.role === 'ADMIN' ? '🛡️' : '👁️'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{a.name}</span>
                    {editingId === a.id ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        onBlur={() => { if (editRole !== a.role) handleRoleChange(a.id, editRole); else setEditingId(null); }}
                        className="text-xs border rounded px-1 py-0.5"
                        autoFocus
                      >
                        <option value="SUPER_ADMIN">슈퍼관리자</option>
                        <option value="ADMIN">관리자</option>
                        <option value="MODERATOR">모더레이터</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => { if (a.id !== session.adminUserId) { setEditingId(a.id); setEditRole(a.role); } }}
                        className={`text-[10px] px-2 py-0.5 rounded-full ${ROLE_COLORS[a.role]} ${a.id !== session.adminUserId ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      >
                        {ROLE_LABELS[a.role]}
                      </button>
                    )}
                    {!a.isActive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">비활성</span>}
                  </div>
                  <p className="text-xs text-gray-500">{a.email}</p>
                  <p className="text-[10px] text-gray-400">
                    가입: {new Date(a.createdAt).toLocaleDateString('ko')}
                    {a.lastLoginAt && ` · 마지막 접속: ${new Date(a.lastLoginAt).toLocaleDateString('ko')}`}
                  </p>
                </div>
              </div>
              {a.id !== session.adminUserId && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(a.id, a.isActive)}
                    className={`text-xs px-3 py-1.5 rounded-lg ${a.isActive ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}
                  >
                    {a.isActive ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, a.email)}
                    className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
