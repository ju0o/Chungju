'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/hooks/useApi';
import type { ScanResult } from '@/lib/domain-types';

function ScanProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 QR 코드입니다.');
      setLoading(false);
      return;
    }

    async function scan() {
      try {
        const data = await fetchApi<ScanResult>('/api/scan', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '스캔 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    scan();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
        <p className="text-sm text-[var(--foreground-soft)]">스탬프를 처리하고 있어요...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card rounded-[1.75rem] p-6 text-center">
        <div className="text-4xl mb-3">😅</div>
        <h2 className="font-semibold text-lg mb-2">스캔 실패</h2>
        <p className="text-sm text-[var(--foreground-soft)]">{error}</p>
        <button onClick={() => router.push('/stamp')} className="festival-button primary mt-4 rounded-xl px-6 py-2 text-sm">
          스탬프 현황 보기
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="grid gap-4">
      {/* 스캔 결과 */}
      <div className={`section-card rounded-[1.75rem] p-6 text-center ${result.success ? 'bg-gradient-to-b from-[var(--accent-leaf)]/10 to-transparent' : ''}`}>
        <div className="text-5xl mb-3">{result.success ? '🎉' : '⚠️'}</div>
        <h2 className="section-title text-lg font-bold">{result.success ? '스탬프 획득!' : '알림'}</h2>
        <p className="body-copy mt-2 text-[var(--foreground-soft)]">{result.message}</p>

        {result.success && result.stampCount != null && (
          <div className="mt-4 rounded-xl bg-white/70 border border-[var(--line)] p-4">
            <div className="text-sm font-medium">스탬프 진행률</div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <div className="h-3 flex-1 rounded-full bg-[var(--line)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent-coral)] to-[var(--accent-petal)] transition-all duration-500"
                  style={{ width: `${Math.min(100, (result.stampCount / (result.totalRequired || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[var(--accent-coral)]">{result.stampCount}/{result.totalRequired}</span>
            </div>
            {result.isCompleted && (
              <div className="mt-2 text-sm font-bold text-[var(--accent-leaf)]">🏆 스탬프 투어 완료!</div>
            )}
          </div>
        )}
      </div>

      {/* 새로 획득한 포토카드 */}
      {result.newPhotocards && result.newPhotocards.length > 0 && (
        <div className="section-card rounded-[1.75rem] p-6">
          <h3 className="font-semibold mb-3 text-center">✨ 포토카드 획득!</h3>
          <div className="grid gap-3">
            {result.newPhotocards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 rounded-xl border border-[var(--accent-petal)] bg-gradient-to-r from-[var(--accent-petal)]/10 to-transparent p-4">
                <img src={card.imageUrl} alt={card.name} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <div className="font-semibold">{card.name}</div>
                  <div className="text-xs text-[var(--accent-coral)]">{card.rarity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 보상 획득 */}
      {result.rewardEarned && (
        <div className="section-card rounded-[1.75rem] p-6 bg-gradient-to-b from-yellow-50 to-transparent text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h3 className="font-semibold">{result.rewardEarned.name}</h3>
          <p className="text-sm text-[var(--foreground-soft)] mt-1">{result.rewardEarned.description}</p>
        </div>
      )}

      <div className="flex gap-3 px-2">
        <button onClick={() => router.push('/stamp')} className="festival-button primary flex-1 rounded-xl py-3 text-sm">
          스탬프 현황
        </button>
        <button onClick={() => router.push('/booths')} className="festival-button paper flex-1 rounded-xl py-3 text-sm">
          다른 부스 보기
        </button>
      </div>
    </div>
  );
}

export default function StampScanPage() {
  return (
    <main className="app-shell grid gap-4 p-4">
      <Suspense fallback={
        <div className="flex justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
        </div>
      }>
        <ScanProcessor />
      </Suspense>
    </main>
  );
}
