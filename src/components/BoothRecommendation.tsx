'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RecommendedBooth {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  reason: string;
}

export function BoothRecommendation({ currentBoothId, category }: { currentBoothId: string; category: string }) {
  const [booths, setBooths] = useState<RecommendedBooth[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booths?category=${encodeURIComponent(category)}&exclude=${currentBoothId}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || json;

        if (!Array.isArray(data)) return;

        // 즐겨찾기 기반 추천
        const favRaw = localStorage.getItem('festival-favorites');
        const favIds: string[] = favRaw ? JSON.parse(favRaw) : [];

        const otherBooths = data
          .filter((b: { id: string }) => b.id !== currentBoothId)
          .slice(0, 6);

        const recommended: RecommendedBooth[] = otherBooths.map((b: { id: string; name: string; category: string; description: string; imageUrl: string | null }) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          description: b.description?.slice(0, 60) || '',
          imageUrl: b.imageUrl,
          reason: favIds.includes(b.id)
            ? '찜한 부스'
            : b.category === category
            ? '같은 카테고리'
            : '추천 부스',
        }));

        setBooths(recommended.slice(0, 3));
      } catch { /* ignore */ }
    }
    load();
  }, [currentBoothId, category]);

  if (booths.length === 0) return null;

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-semibold mb-3">🌿 이런 부스도 좋아하실 거예요</h2>
      <div className="grid gap-3">
        {booths.map((booth) => (
          <Link key={booth.id} href={`/booths/${booth.id}`}>
            <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-3 transition-transform hover:scale-[1.01]">
              {booth.imageUrl ? (
                <img src={booth.imageUrl} alt={booth.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--accent-petal)]/20 text-2xl flex-shrink-0">🏪</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{booth.name}</span>
                  <span className="flex-shrink-0 rounded-full bg-[var(--accent-leaf)]/10 px-1.5 py-0.5 text-[10px] text-[var(--accent-leaf)]">
                    {booth.reason}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[var(--foreground-soft)] line-clamp-1">{booth.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
