'use client';

import { useApiData } from '@/hooks/useApi';
import Link from 'next/link';
import Image from 'next/image';

interface StampProgress {
  id: string;
  totalStamps: number;
  isCompleted: boolean;
  completedAt: string | null;
  rewardClaimed: boolean;
  stampCampaign: {
    id: string;
    name: string;
    description: string;
    requiredStamps: number;
    rewardDescription: string | null;
  };
}

interface StampScan {
  id: string;
  scannedAt: string;
  qrCode: {
    booth: { id: string; name: string; category: string; imageUrl: string | null };
  };
  stampCampaign: { id: string; name: string };
}

interface StampData {
  progress: StampProgress[];
  scans: StampScan[];
  totalStamps: number;
}

export default function StampStatusPage() {
  const { data, loading } = useApiData<StampData>('/api/stamps/my');

  if (loading) {
    return (
      <main className="app-shell p-4">
        <div className="flex justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="app-shell p-4">
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <p>로그인 후 스탬프 현황을 확인할 수 있습니다.</p>
          <Link href="/" className="festival-button primary mt-4 inline-block rounded-xl px-6 py-2 text-sm">홈으로</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-4 p-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <h1 className="section-title mb-1">🎫 내 스탬프 현황</h1>
        <p className="text-sm text-[var(--foreground-soft)]">총 {data.totalStamps}개 스탬프 획득</p>
      </section>

      {/* 캠페인별 진행률 */}
      {data.progress.map((prog) => (
        <section key={prog.id} className="section-card rounded-[1.75rem] p-5">
          <h2 className="font-semibold">{prog.stampCampaign.name}</h2>
          <p className="text-xs text-[var(--foreground-soft)] mt-1">{prog.stampCampaign.description}</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-4 flex-1 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent-coral)] to-[var(--accent-petal)] transition-all"
                style={{ width: `${Math.min(100, (prog.totalStamps / prog.stampCampaign.requiredStamps) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-[var(--accent-coral)]">
              {prog.totalStamps}/{prog.stampCampaign.requiredStamps}
            </span>
          </div>

          {prog.isCompleted && (
            <div className="mt-3 rounded-xl bg-[var(--accent-leaf)]/10 p-3 text-center">
              <span className="text-sm font-bold text-[var(--accent-leaf)]">🏆 완료!</span>
              {prog.stampCampaign.rewardDescription && (
                <p className="mt-1 text-xs text-[var(--foreground-soft)]">보상: {prog.stampCampaign.rewardDescription}</p>
              )}
            </div>
          )}
        </section>
      ))}

      {data.progress.length === 0 && (
        <section className="section-card rounded-[1.75rem] p-8 text-center">
          <div className="text-4xl mb-3">🎫</div>
          <h2 className="font-semibold mb-2">아직 스탬프가 없어요</h2>
          <p className="text-sm text-[var(--foreground-soft)]">부스에 있는 QR 코드를 스캔하면 스탬프를 모을 수 있어요!</p>
          <Link href="/booths" className="festival-button primary mt-4 inline-block rounded-xl px-6 py-2 text-sm">
            부스 둘러보기
          </Link>
        </section>
      )}

      {/* 스캔 기록 */}
      {data.scans.length > 0 && (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="font-semibold mb-3">📋 스캔 기록</h2>
          <div className="grid gap-2">
            {data.scans.map((scan) => (
              <Link key={scan.id} href={`/booths/${scan.qrCode.booth.id}`}>
                <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-3 transition-colors hover:bg-white">
                  {scan.qrCode.booth.imageUrl ? (
                    <Image src={scan.qrCode.booth.imageUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-lg object-cover" unoptimized />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-coral)]/10 text-lg">🏪</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{scan.qrCode.booth.name}</div>
                    <div className="text-xs text-[var(--foreground-soft)]">{scan.qrCode.booth.category}</div>
                  </div>
                  <div className="text-xs text-[var(--foreground-soft)]">
                    {new Date(scan.scannedAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
