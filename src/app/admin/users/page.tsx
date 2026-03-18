'use client';

import { useAdminSession, useApiData } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserItem {
  id: string;
  nickname: string;
  deviceId: string | null;
  createdAt: string;
  _count: { stampScans: number; reviews: number; userPhotocards: number };
}

interface UsersResponse {
  data: UserItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: usersRes, loading } = useApiData<UsersResponse>(
    session ? `/api/users?page=${page}&pageSize=30${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}` : null
  );

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const users = usersRes?.data ?? [];
  const totalPages = usersRes?.totalPages ?? 1;

  const handleSearch = () => { setSearchQuery(search); setPage(1); };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">참여자 관리</h1>
        <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
      </div>

      <div className="flex gap-2 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="닉네임 검색..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
        <button onClick={handleSearch} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">검색</button>
      </div>

      <div className="text-xs text-gray-500 mb-3">총 {usersRes?.total ?? 0}명</div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">닉네임</th>
              <th className="text-center p-3 font-medium">스캔</th>
              <th className="text-center p-3 font-medium">후기</th>
              <th className="text-center p-3 font-medium">카드</th>
              <th className="text-left p-3 font-medium">가입일</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{u.nickname}</td>
                <td className="p-3 text-center">{u._count.stampScans}</td>
                <td className="p-3 text-center">{u._count.reviews}</td>
                <td className="p-3 text-center">{u._count.userPhotocards}</td>
                <td className="p-3 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString('ko')}</td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">참여자가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">이전</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50">다음</button>
        </div>
      )}
    </div>
  );
}
