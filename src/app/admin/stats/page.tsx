'use client';

import { useEffect, useState } from 'react';
import { useAdminSession, useApiData } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EnhancedStats {
  totalUsers: number;
  totalScans: number;
  totalReviews: number;
  todayScans: number;
  todayReviews: number;
  hourlyScans: Array<{ hour: number; count: number }>;
  boothScanRanking: Array<{ boothName: string; scanCount: number }>;
  dailyVisitors: Array<{ day: string; count: number }>;
  crowdStatuses: Array<{ level: string; booth: { name: string } }>;
  totalQuizzes: number;
  totalQuizSubmissions: number;
  correctQuizSubmissions: number;
  activeNow: number;
}

export default function EnhancedStatsPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: stats, loading } = useApiData<EnhancedStats>(session ? '/api/stats/enhanced' : null);

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, session, router]);

  if (authLoading || !session) return null;

  return (
    <main className="min-h-screen bg-[var(--paper)] p-4 md:p-8">
      <div className="mx-auto max-w-4xl grid gap-6">
        <div>
          <Link href="/admin/dashboard" className="text-sm text-[var(--foreground-soft)] hover:underline">← 대시보드</Link>
          <h1 className="text-2xl font-bold mt-1">📊 상세 통계</h1>
          <p className="text-sm text-[var(--foreground-soft)] mt-1">
            실시간 접속자: <span className="font-bold text-green-600">{stats?.activeNow ?? '-'}명</span>
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-[var(--foreground-soft)]">통계를 불러오는 중...</div>
        ) : !stats ? (
          <div className="text-center py-12 text-sm text-red-500">데이터를 불러올 수 없습니다.</div>
        ) : (
          <>
            {/* 주요 수치 */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: '총 사용자', value: stats.totalUsers, icon: '👥' },
                { label: '총 스캔', value: stats.totalScans, icon: '📱' },
                { label: '오늘 스캔', value: stats.todayScans, icon: '🎫' },
                { label: '총 후기', value: stats.totalReviews, icon: '💬' },
              ].map((s) => (
                <div key={s.label} className="section-card rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground-soft)]">
                    <span>{s.icon}</span> {s.label}
                  </div>
                  <div className="mt-1 text-2xl font-bold">{Number(s.value).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* 시간대별 스캔 */}
            {stats.hourlyScans && stats.hourlyScans.length > 0 && (
              <div className="section-card rounded-[1.75rem] p-5">
                <h2 className="font-semibold mb-4">⏰ 시간대별 스캔</h2>
                <div className="flex h-40 items-end gap-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const found = stats.hourlyScans.find((s) => Number(s.hour) === h);
                    const val = found ? Number(found.count) : 0;
                    const maxVal = Math.max(...stats.hourlyScans.map((s) => Number(s.count)), 1);
                    return (
                      <div key={h} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-[var(--accent-coral)] to-[var(--accent-petal)]"
                          style={{ height: `${Math.max((val / maxVal) * 100, 4)}%` }}
                        />
                        <span className="text-[9px] text-[var(--foreground-soft)]">{h}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 일별 방문자 추이 */}
            {stats.dailyVisitors && stats.dailyVisitors.length > 0 && (
              <div className="section-card rounded-[1.75rem] p-5">
                <h2 className="font-semibold mb-4">📈 일별 방문자 추이</h2>
                <div className="grid gap-2">
                  {stats.dailyVisitors.map((d) => {
                    const maxVal = Math.max(...stats.dailyVisitors.map((v) => Number(v.count)), 1);
                    const pct = (Number(d.count) / maxVal) * 100;
                    return (
                      <div key={d.day} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-[var(--foreground-soft)]">{d.day}</span>
                        <div className="flex-1 h-6 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-leaf)] to-[var(--leaf-deep)]" style={{ width: `${Math.max(pct, 3)}%` }} />
                        </div>
                        <span className="w-12 text-right text-xs font-semibold">{Number(d.count)}명</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 퀴즈 참여율 */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="section-card rounded-[1.75rem] p-5">
                <h2 className="font-semibold mb-3">📝 퀴즈 참여</h2>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between rounded-xl bg-white/70 p-3 border border-[var(--line)]">
                    <span>등록 퀴즈</span>
                    <span className="font-bold">{stats.totalQuizzes}개</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-white/70 p-3 border border-[var(--line)]">
                    <span>총 응답</span>
                    <span className="font-bold">{Number(stats.totalQuizSubmissions)}개</span>
                  </div>
                  <div className="flex justify-between rounded-xl bg-white/70 p-3 border border-[var(--line)]">
                    <span>정답률</span>
                    <span className="font-bold text-green-600">
                      {stats.totalQuizSubmissions
                        ? `${Math.round((Number(stats.correctQuizSubmissions) / Number(stats.totalQuizSubmissions)) * 100)}%`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 혼잡도 현황 */}
              <div className="section-card rounded-[1.75rem] p-5">
                <h2 className="font-semibold mb-3">🚦 혼잡도 현황</h2>
                {stats.crowdStatuses && stats.crowdStatuses.length > 0 ? (
                  <div className="grid gap-2 text-sm">
                    {stats.crowdStatuses.map((c, i) => {
                      const color = c.level === 'LOW' ? 'bg-green-100 text-green-700' : c.level === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                      const label = c.level === 'LOW' ? '여유' : c.level === 'MODERATE' ? '보통' : '붐빔';
                      return (
                        <div key={i} className="flex items-center justify-between rounded-xl bg-white/70 p-3 border border-[var(--line)]">
                          <span>{c.booth.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${color}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--foreground-soft)]">혼잡도 데이터 없음</p>
                )}
              </div>
            </div>

            {/* 부스 스캔 랭킹 */}
            {stats.boothScanRanking && stats.boothScanRanking.length > 0 && (
              <div className="section-card rounded-[1.75rem] p-5">
                <h2 className="font-semibold mb-3">🏪 부스 스캔 순위</h2>
                <div className="grid gap-2">
                  {stats.boothScanRanking.map((b, i) => (
                    <div key={b.boothName} className="flex items-center gap-3 rounded-xl bg-white/70 p-3 border border-[var(--line)]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-coral)]/10 text-xs font-bold text-[var(--accent-coral)]">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm">{b.boothName}</span>
                      <span className="text-sm font-bold">{b.scanCount}회</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
