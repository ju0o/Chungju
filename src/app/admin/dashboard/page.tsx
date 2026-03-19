'use client';

import { useAdminSession, useApiData } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

interface DashboardData {
  totalUsers: number;
  totalScans: number;
  totalReviews: number;
  totalCompletedCampaigns: number;
  totalPhotocardIssued: number;
  todayScans: number;
  todayReviews: number;
  pendingReviews: number;
  boothScanRanking: Array<{ boothName: string; scanCount: number }>;
  hourlyScans: Array<{ hour: number; count: number }>;
}

const ADMIN_MENU = [
  { href: '/admin/festival', icon: '🎪', label: '축제 정보', desc: '축제 기본정보, 공지, FAQ, 일정 관리', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/booths', icon: '🏪', label: '부스 관리', desc: '부스 CRUD, 카테고리, 위치', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/qr', icon: '📱', label: 'QR 관리', desc: 'QR 생성/재발급/비활성화/다운로드', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/stamps', icon: '🎫', label: '스탬프투어', desc: '캠페인 생성, 정책 설정', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/reviews', icon: '💬', label: '후기 관리', desc: '후기 검수/승인/숨김/삭제', roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
  { href: '/admin/cards', icon: '🃏', label: '포토카드', desc: '포토카드 생성, 지급 조건 설정', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/rewards', icon: '🎁', label: '보상 관리', desc: '보상 조건, 수량 관리', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/quiz-manage', icon: '📝', label: '퀴즈 관리', desc: '축제 퀴즈 생성, 참여 현황 관리', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/announcements', icon: '📢', label: '공지 관리', desc: '긴급 공지, 배너, 팝업 관리', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/crowd', icon: '📊', label: '혼잡도 관리', desc: '부스별 실시간 혼잡도 업데이트', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/stats', icon: '📈', label: '상세 통계', desc: '시간대별·일별 통계 분석 대시보드', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/users', icon: '👥', label: '참여 현황', desc: '사용자별 참여도 조회', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/logs', icon: '📋', label: '감사로그', desc: '시스템 활동 기록', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { href: '/admin/members', icon: '🔑', label: '관리자 관리', desc: '관리자 계정 생성, 역할/권한 관리', roles: ['SUPER_ADMIN'] },
];

export default function AdminDashboardPage() {
  const { session, loading: authLoading, logout } = useAdminSession();
  const router = useRouter();
  const { data: stats, loading: statsLoading } = useApiData<DashboardData>(
    session ? '/api/dashboard' : null
  );

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/admin/login');
    }
  }, [authLoading, session, router]);

  if (authLoading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
      </main>
    );
  }

  const visibleMenu = ADMIN_MENU.filter((item) => item.roles.includes(session.role));

  return (
    <main className="min-h-screen bg-[var(--paper)] p-4 md:p-8">
      <div className="mx-auto max-w-5xl grid gap-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">관리자 대시보드</h1>
            <p className="text-sm text-[var(--foreground-soft)]">
              {session.name} ({session.role === 'SUPER_ADMIN' ? '슈퍼관리자' : session.role === 'ADMIN' ? '관리자' : '모더레이터'})
            </p>
          </div>
          <button onClick={logout} className="festival-button paper rounded-xl px-4 py-2 text-sm">
            로그아웃
          </button>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: '총 사용자', value: stats.totalUsers, icon: '👥' },
              { label: '총 스캔', value: stats.totalScans, icon: '📱' },
              { label: '오늘 스캔', value: stats.todayScans, icon: '🎫' },
              { label: '검수 대기', value: stats.pendingReviews, icon: '⏳', accent: true },
              { label: '총 후기', value: stats.totalReviews, icon: '💬' },
              { label: '투어 완료', value: stats.totalCompletedCampaigns, icon: '🏆' },
              { label: '포토카드 발행', value: stats.totalPhotocardIssued, icon: '🃏' },
              { label: '오늘 후기', value: stats.todayReviews, icon: '✍️' },
            ].map((stat) => (
              <div key={stat.label} className={`section-card rounded-2xl p-4 ${stat.accent ? 'border-2 border-[var(--accent-coral)]/30' : ''}`}>
                <div className="flex items-center gap-2 text-sm text-[var(--foreground-soft)]">
                  <span>{stat.icon}</span> {stat.label}
                </div>
                <div className="mt-1 text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* 부스별 스캔 순위 */}
        {stats && stats.boothScanRanking.length > 0 && (
          <div className="section-card rounded-[1.75rem] p-5">
            <h2 className="font-semibold mb-3">🏪 부스별 스캔 순위</h2>
            <div className="grid gap-2">
              {stats.boothScanRanking.map((booth, i) => (
                <div key={booth.boothName} className="flex items-center gap-3 rounded-xl bg-white/70 p-3 border border-[var(--line)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-coral)]/10 text-sm font-bold text-[var(--accent-coral)]">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm">{booth.boothName}</span>
                  <span className="text-sm font-bold">{booth.scanCount}회</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 관리 메뉴 */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visibleMenu.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="section-card flex items-center gap-4 rounded-2xl p-5 transition-transform hover:scale-[1.01]">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-coral)]/10 text-2xl">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="text-xs text-[var(--foreground-soft)]">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
