"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PaperLabel } from "@/components/CollageOrnaments";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";

interface Booth {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  operatingHours: string | null;
  imageUrl: string | null;
}

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/booths")
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooths(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const favoriteBooths = booths.filter((b) => favorites.includes(b.id));

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Favorites" tone="petal" />
          <PaperLabel text={`${favoriteBooths.length}곳 선택`} tone="leaf" />
        </div>
        <h1 className="section-title mt-4">즐겨찾기 부스</h1>
        <p className="body-copy mt-3 max-w-[30ch] text-sm text-[var(--foreground-soft)]">
          관심 있는 부스를 모아 나만의 동선을 계획해보세요.
        </p>
      </section>

      {loading ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center text-sm text-[var(--foreground-soft)]">
          불러오는 중...
        </div>
      ) : favoriteBooths.length === 0 ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <p className="text-4xl mb-3">💛</p>
          <p className="text-sm text-[var(--foreground-soft)]">아직 즐겨찾기한 부스가 없어요.</p>
          <Link href="/booths" className="festival-button festival-button--paper mt-4 inline-block text-sm">
            부스 둘러보기
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {favoriteBooths.map((booth, i) => (
            <div key={booth.id} className="section-card rounded-[1.5rem] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent-strong)] shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link href={`/booths/${booth.id}`} className="font-semibold text-sm hover:underline">
                      {booth.name}
                    </Link>
                    <FavoriteButton boothId={booth.id} size={16} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--foreground-soft)] line-clamp-2">{booth.description}</p>
                  <div className="mt-2 flex gap-3 text-[11px] text-[var(--muted)]">
                    <span>📍 {booth.location}</span>
                    <span className="rounded-full bg-[var(--accent-coral)]/10 px-2 py-0.5 text-[var(--accent-coral)]">{booth.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="text-center mt-2">
            <Link href="/booths" className="festival-button festival-button--paper inline-block text-sm">
              다른 부스 둘러보기
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
