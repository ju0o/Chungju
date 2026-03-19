'use client';

import { useEffect, useState } from 'react';
import { useAdminSession } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BoothCrowd {
  boothId: string;
  level: string;
  waitMin: number;
  note: string | null;
  updatedAt: string;
  booth: { id: string; name: string; location: string };
}

interface Booth {
  id: string;
  name: string;
  location: string;
}

const LEVELS = [
  { value: 'LOW', label: '🟢 여유', color: 'bg-green-100 text-green-700' },
  { value: 'MODERATE', label: '🟡 보통', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: '🔴 붐빔', color: 'bg-red-100 text-red-700' },
];

export default function AdminCrowdPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const [statuses, setStatuses] = useState<BoothCrowd[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, session, router]);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch('/api/crowd').then((r) => r.json()),
        fetch('/api/booths').then((r) => r.json()),
      ])
        .then(([crowdData, boothData]) => {
          if (crowdData.success) setStatuses(crowdData.data);
          if (boothData.success) setBooths(boothData.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleUpdate = async (boothId: string, level: string, waitMin: number = 0) => {
    setUpdating(boothId);
    try {
      const res = await fetch('/api/crowd', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boothId, level, waitMin }),
      });
      const data = await res.json();
      if (data.success) {
        const booth = booths.find((b) => b.id === boothId);
        setStatuses((prev) => {
          const exists = prev.find((s) => s.boothId === boothId);
          if (exists) {
            return prev.map((s) => (s.boothId === boothId ? { ...s, level, waitMin, updatedAt: new Date().toISOString() } : s));
          }
          return [...prev, { boothId, level, waitMin, note: null, updatedAt: new Date().toISOString(), booth: booth ?? { id: boothId, name: '알 수 없음', location: '' } }];
        });
      }
    } catch {
      // 오류 무시
    } finally {
      setUpdating(null);
    }
  };

  if (authLoading || !session) return null;

  // 모든 부스를 표시 (혼잡도 설정 여부와 무관)
  const allBooths = booths.map((b) => {
    const status = statuses.find((s) => s.boothId === b.id);
    return { ...b, crowd: status };
  });

  return (
    <main className="min-h-screen bg-[var(--paper)] p-4 md:p-8">
      <div className="mx-auto max-w-3xl grid gap-6">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-[var(--foreground-soft)] hover:underline">← 대시보드</Link>
          <h1 className="text-2xl font-bold mt-1">📊 혼잡도 관리</h1>
          <p className="mt-1 text-sm text-[var(--foreground-soft)]">부스별 실시간 혼잡도를 업데이트하세요.</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm text-[var(--foreground-soft)]">불러오는 중...</div>
        ) : allBooths.length === 0 ? (
          <div className="section-card rounded-[1.75rem] p-8 text-center">
            <p className="text-4xl mb-3">🏪</p>
            <p className="text-sm text-[var(--foreground-soft)]">등록된 부스가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {allBooths.map((booth) => (
              <div key={booth.id} className="section-card rounded-[1.75rem] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{booth.name}</h3>
                    <p className="text-[11px] text-[var(--foreground-soft)]">📍 {booth.location}</p>
                  </div>
                  {booth.crowd && (
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${LEVELS.find((l) => l.value === booth.crowd!.level)?.color ?? ''}`}>
                      {LEVELS.find((l) => l.value === booth.crowd!.level)?.label ?? booth.crowd.level}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map((level) => (
                    <button
                      key={level.value}
                      disabled={updating === booth.id}
                      onClick={() => handleUpdate(booth.id, level.value)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        booth.crowd?.level === level.value
                          ? `${level.color} border-current`
                          : 'border-[var(--line)] bg-white/70 hover:bg-gray-50'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
