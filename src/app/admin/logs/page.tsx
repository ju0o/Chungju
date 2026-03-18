'use client';

import { useAdminSession, useApiData } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AuditLogItem {
  id: string;
  action: string;
  target: string | null;
  detail: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
  adminUser: { name: string; email: string } | null;
}

interface LogResponse {
  data: AuditLogItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminLogsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data: logRes, loading } = useApiData<LogResponse>(session ? `/api/audit-logs?page=${page}&pageSize=30` : null);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const logs = logRes?.data ?? [];
  const totalPages = logRes?.totalPages ?? 1;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">운영 로그</h1>
        <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">시간</th>
              <th className="text-left p-3 font-medium">관리자</th>
              <th className="text-left p-3 font-medium">액션</th>
              <th className="text-left p-3 font-medium">대상</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString('ko')}</td>
                <td className="p-3 text-xs">{log.adminUser?.name ?? '-'}</td>
                <td className="p-3"><span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{log.action}</span></td>
                <td className="p-3 text-xs text-gray-600 truncate max-w-[200px]">{log.target ?? '-'}</td>
              </tr>
            ))}
            {!logs.length && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">로그가 없습니다.</td></tr>
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
