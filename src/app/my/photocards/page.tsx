'use client';

import { useApiData } from '@/hooks/useApi';
import Link from 'next/link';

interface UserPhotocard {
  id: string;
  acquiredAt: string;
  photocard: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    rarity: string;
    conditionType: string;
  };
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: 'bg-gray-100 text-gray-600',
  UNCOMMON: 'bg-green-100 text-green-700',
  RARE: 'bg-blue-100 text-blue-700',
  EPIC: 'bg-purple-100 text-purple-700',
  LEGENDARY: 'bg-yellow-100 text-yellow-700',
};

const RARITY_LABELS: Record<string, string> = {
  COMMON: '일반',
  UNCOMMON: '고급',
  RARE: '희귀',
  EPIC: '영웅',
  LEGENDARY: '전설',
};

export default function MyPhotocardsPage() {
  const { data: photocards, loading } = useApiData<UserPhotocard[]>('/api/photocards?my=true');

  if (loading) {
    return (
      <main className="app-shell p-4">
        <div className="flex justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-4 p-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <h1 className="section-title mb-1">🃏 내 포토카드</h1>
        <p className="text-sm text-[var(--foreground-soft)]">수집한 포토카드 {photocards?.length || 0}장</p>
      </section>

      {photocards && photocards.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {photocards.map((item) => (
            <div key={item.id} className="section-card overflow-hidden rounded-2xl">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={item.photocard.imageUrl} alt={item.photocard.name} className="h-full w-full object-cover" />
                <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium ${RARITY_COLORS[item.photocard.rarity] || RARITY_COLORS.COMMON}`}>
                  {RARITY_LABELS[item.photocard.rarity] || '일반'}
                </div>
              </div>
              <div className="p-3">
                <h3 className="truncate text-sm font-semibold">{item.photocard.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-[var(--foreground-soft)]">{item.photocard.description}</p>
                <div className="mt-1 text-xs text-[var(--foreground-soft)]">
                  {new Date(item.acquiredAt).toLocaleDateString('ko-KR')} 획득
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <div className="text-5xl mb-3">🃏</div>
          <h2 className="font-semibold mb-2">아직 포토카드가 없어요</h2>
          <p className="text-sm text-[var(--foreground-soft)]">부스를 방문하고, 스탬프를 모아 포토카드를 수집해보세요!</p>
          <Link href="/booths" className="festival-button primary mt-4 inline-block rounded-xl px-6 py-2 text-sm">
            부스 둘러보기
          </Link>
        </div>
      )}
    </main>
  );
}
