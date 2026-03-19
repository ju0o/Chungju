'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface BoothItem {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  operatingHours: string | null;
  imageUrl: string | null;
  reviewCount: number;
}

export function BoothListClient({ booths, categories }: { booths: BoothItem[]; categories: string[] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'reviews'>('default');

  const filtered = useMemo(() => {
    let result = booths;

    if (selectedCategory) {
      result = result.filter(b => b.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        b => b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'reviews') {
      result = [...result].sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [booths, search, selectedCategory, sortBy]);

  return (
    <>
      {/* 검색 + 필터 */}
      <div className="grid gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="부스 이름, 설명으로 검색..."
          className="w-full rounded-xl border border-[var(--line)] bg-white/70 p-3 text-sm focus:border-[var(--accent-coral)] focus:outline-none"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !selectedCategory ? 'bg-[var(--accent-coral)] text-white border-[var(--accent-coral)]' : 'bg-white/70 text-[var(--foreground-soft)] border-[var(--line)]'
            }`}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === cat ? 'bg-[var(--accent-coral)] text-white border-[var(--accent-coral)]' : 'bg-white/70 text-[var(--foreground-soft)] border-[var(--line)]'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setSortBy(sortBy === 'reviews' ? 'default' : 'reviews')}
            className={`ml-auto text-xs px-3 py-1.5 rounded-full border transition-colors ${
              sortBy === 'reviews' ? 'bg-[var(--accent-leaf)] text-white border-[var(--accent-leaf)]' : 'bg-white/70 text-[var(--foreground-soft)] border-[var(--line)]'
            }`}
          >
            {sortBy === 'reviews' ? '✓ 후기순' : '후기순'}
          </button>
        </div>
      </div>

      {/* 결과 수 */}
      <div className="text-xs text-[var(--foreground-soft)] px-1">
        {filtered.length}개 부스 {search && `· "${search}" 검색 결과`}
      </div>

      {/* 부스 목록 */}
      <section className="grid gap-3">
        {filtered.map((booth) => (
          <Link key={booth.id} href={`/booths/${booth.id}`}>
            <div className="section-card rounded-[1.5rem] p-4 transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                {booth.imageUrl ? (
                  <img src={booth.imageUrl} alt={booth.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-petal)]/20 text-2xl">🏪</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{booth.name}</h3>
                    <span className="shrink-0 rounded-full bg-[var(--accent-coral)]/10 px-2 py-0.5 text-[10px] text-[var(--accent-coral)]">
                      {booth.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)] line-clamp-2">{booth.description}</p>
                  <div className="mt-2 flex gap-3 text-xs text-[var(--muted)]">
                    <span>📍 {booth.location}</span>
                    {booth.operatingHours && <span>🕐 {booth.operatingHours}</span>}
                    <span>💬 후기 {booth.reviewCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="section-card rounded-[1.5rem] p-8 text-center text-[var(--foreground-soft)]">
            <p className="text-lg mb-1">🔍</p>
            <p className="text-sm">{search ? '검색 결과가 없습니다.' : '등록된 부스가 없습니다.'}</p>
          </div>
        )}
      </section>
    </>
  );
}
