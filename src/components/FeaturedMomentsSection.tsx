'use client';

import { useEffect, useState } from 'react';
import { MomentCard } from '@/components/MomentCard';
import { MomentEntry } from '@/lib/types';

interface FeaturedItem {
  id: string;
  momentId: string;
  note: string | null;
  pickedAt: string;
}

export function FeaturedMomentsSection() {
  const [moments, setMoments] = useState<MomentEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const featRes = await fetch('/api/featured-moments');
        const featData = await featRes.json();
        if (!featData.success || !featData.data.length) return;

        const momRes = await fetch('/api/moments');
        const allMoments: MomentEntry[] = await momRes.json();
        if (!Array.isArray(allMoments)) return;

        const featuredIds = new Set(featData.data.map((f: FeaturedItem) => f.momentId));
        setMoments(allMoments.filter((m) => featuredIds.has(m.id)).slice(0, 4));
      } catch {
        // 오류 무시
      }
    })();
  }, []);

  if (moments.length === 0) return null;

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📸</span>
        <h2 className="font-semibold text-sm">오늘의 베스트 순간</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {moments.map((m) => (
          <MomentCard key={m.id} moment={m} />
        ))}
      </div>
    </section>
  );
}
