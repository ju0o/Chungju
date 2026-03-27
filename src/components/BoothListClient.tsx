'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useFestivalSession } from '@/hooks/useFestivalSession';

interface BoothItem {
  id: string;
  name: string;
  category: string;
  description: string;
  authorName?: string;
  bookTitle?: string;
  location: string;
  operatingHours: string | null;
  imageUrl: string | null;
  reviewCount: number;
}

type RecommendedBooth = BoothItem & {
  score: number;
  reason: string;
  matchTags?: string[];
};

type RecommendationGroup = {
  key: string;
  title: string;
  description: string;
  items: RecommendedBooth[];
};

const STOP_WORDS = new Set([
  '작가', '부스', '도서', '책', '소개', '그리고', 'the', 'with', 'from', 'this',
]);

function toKeywords(value: string) {
  return value
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function getBoothProfileText(booth: BoothItem) {
  return [
    booth.name,
    booth.category,
    booth.description,
    booth.authorName ?? '',
    booth.bookTitle ?? '',
  ].join(' ');
}

export function BoothListClient({ booths, categories }: { booths: BoothItem[]; categories: string[] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'reviews'>('default');
  const [recommendSeed, setRecommendSeed] = useState(0);
  const [keywordWeight, setKeywordWeight] = useState(6);
  const [reviewWeight, setReviewWeight] = useState(3);
  const [categoryWeight, setCategoryWeight] = useState(4);
  const { interests } = useFestivalSession();
  const favoriteBoothIds = interests.favoriteBoothIds;
  const favoriteAuthorNames = interests.favoriteAuthorNames;

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

  const recommendationGroups = useMemo<RecommendationGroup[]>(() => {
    if (booths.length === 0) return [];

    const favoriteBooths = booths.filter((booth) => favoriteBoothIds.includes(booth.id));
    const favoriteCategorySet = new Set(favoriteBooths.map((booth) => booth.category));
    const favoriteAuthorKeywordSet = new Set(favoriteAuthorNames.flatMap((name) => toKeywords(name)));
    const favoriteBookKeywordSet = new Set(favoriteBooths.flatMap((booth) => toKeywords(booth.bookTitle ?? '')));
    const interestKeywordSet = new Set(
      favoriteBooths.flatMap((booth) => toKeywords(getBoothProfileText(booth))),
    );
    for (const token of toKeywords(search)) {
      interestKeywordSet.add(token);
    }

    const personalized: RecommendedBooth[] = booths
      .filter((booth) => !favoriteBoothIds.includes(booth.id))
      .map((booth) => {
        const sameCategory = favoriteCategorySet.has(booth.category);
        const boothKeywords = toKeywords(getBoothProfileText(booth));
        const matchedKeywords = boothKeywords.filter((keyword) => interestKeywordSet.has(keyword));
        const keywordScore = Math.min(matchedKeywords.length, 3) * keywordWeight;
        const categoryScore = sameCategory ? categoryWeight : 0;
        const reviewScore = Math.min(booth.reviewCount, 5) * reviewWeight;
        const score = categoryScore + keywordScore + reviewScore;
        const reason = matchedKeywords[0]
          ? `"${matchedKeywords[0]}" 키워드 유사`
          : sameCategory
          ? '찜한 부스와 같은 장르'
          : '독자 후기 반응이 좋은 부스';
        return { ...booth, score, reason, matchTags: matchedKeywords.slice(0, 2) };
      })
      .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name, 'ko'))
      .slice(recommendSeed % 2, (recommendSeed % 2) + 3);

    const authorSimilar: RecommendedBooth[] = booths
      .filter((booth) => !favoriteBoothIds.includes(booth.id))
      .map((booth) => {
        const authorTokens = toKeywords(booth.authorName ?? '');
        const matched = authorTokens.filter((keyword) => favoriteAuthorKeywordSet.has(keyword));
        return {
          ...booth,
          score: matched.length * keywordWeight + Math.min(booth.reviewCount, 4) * reviewWeight,
          reason: matched[0] ? `"${matched[0]}" 작가명 유사` : '작가 기반 추천',
          matchTags: matched.slice(0, 2),
        };
      })
      .filter((booth) => booth.score > 0)
      .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name, 'ko'))
      .slice(0, 3);

    const titleSimilar: RecommendedBooth[] = booths
      .filter((booth) => !favoriteBoothIds.includes(booth.id))
      .map((booth) => {
        const titleTokens = toKeywords(booth.bookTitle ?? '');
        const matched = titleTokens.filter((keyword) => favoriteBookKeywordSet.has(keyword));
        return {
          ...booth,
          score: matched.length * keywordWeight + Math.min(booth.reviewCount, 4) * reviewWeight,
          reason: matched[0] ? `"${matched[0]}" 책제목 유사` : '도서 기반 추천',
          matchTags: matched.slice(0, 2),
        };
      })
      .filter((booth) => booth.score > 0)
      .sort((a, b) => b.score - a.score || b.reviewCount - a.reviewCount || a.name.localeCompare(b.name, 'ko'))
      .slice(0, 3);

    const byCategory: RecommendedBooth[] = categories
      .map((category) => {
        const top = booths
          .filter((booth) => booth.category === category)
          .sort((a, b) => b.reviewCount - a.reviewCount || a.name.localeCompare(b.name, 'ko'))[0];
        return top ? { ...top, score: top.reviewCount * reviewWeight + categoryWeight, reason: `${category} 대표 추천` } : null;
      })
      .filter((item): item is RecommendedBooth => Boolean(item))
      .sort((a, b) => b.reviewCount - a.reviewCount || a.name.localeCompare(b.name, 'ko'))
      .slice(0, 3);

    const introPicks: RecommendedBooth[] = booths
      .slice()
      .sort((a, b) => a.description.length - b.description.length || b.reviewCount - a.reviewCount)
      .slice(0, 3)
      .map((booth) => ({ ...booth, score: 1, reason: '처음 둘러보기 좋은 입문 부스' }));

    const groups = [];
    if (personalized.length > 0) {
      groups.push({
        key: 'personalized',
        title: favoriteBooths.length > 0 ? '당신 취향 기반 추천' : '독자 반응 기반 추천',
        description: favoriteBooths.length > 0 ? '찜한 부스와 비슷한 카테고리를 우선으로 추천합니다.' : '후기 반응이 좋은 책 부스를 우선으로 추천합니다.',
        items: personalized,
      });
    }

    if (byCategory.length > 0) {
      groups.push({
        key: 'category',
        title: '장르별 큐레이션',
        description: '카테고리별로 많이 찾는 대표 부스를 모았습니다.',
        items: byCategory,
      });
    }

    if (authorSimilar.length > 0) {
      groups.push({
        key: 'author-similar',
        title: '작가명 유사 추천',
        description: '관심 작가와 이름/필명 키워드가 비슷한 부스입니다.',
        items: authorSimilar,
      });
    }

    if (titleSimilar.length > 0) {
      groups.push({
        key: 'title-similar',
        title: '책제목 유사 추천',
        description: '관심 도서와 제목 키워드가 겹치는 부스입니다.',
        items: titleSimilar,
      });
    }

    if (introPicks.length > 0) {
      groups.push({
        key: 'intro',
        title: '입문자 추천',
        description: '짧은 소개로 빠르게 둘러보기 좋은 부스를 추천합니다.',
        items: introPicks,
      });
    }

    return groups;
  }, [booths, categories, categoryWeight, favoriteAuthorNames, favoriteBoothIds, keywordWeight, recommendSeed, reviewWeight, search]);

  return (
    <>
      {recommendationGroups.length > 0 && (
        <section className="section-card rounded-[1.6rem] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent-coral)]" />
              <h2 className="text-sm font-semibold">작가/일반 서적 추천 부스</h2>
            </div>
            <button
              type="button"
              onClick={() => setRecommendSeed((prev) => prev + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--foreground-soft)] transition-colors hover:bg-white/70"
            >
              <RefreshCw size={12} />
              추천 새로고침
            </button>
          </div>
          <div className="mb-3 grid gap-2 rounded-xl border border-[var(--line)] bg-white/75 p-3">
            <div className="text-xs font-semibold text-[var(--foreground-soft)]">추천 정렬 우선순위</div>
            <label className="grid gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span>키워드 가중치</span>
                <span className="font-semibold">{keywordWeight}</span>
              </div>
              <input type="range" min={0} max={10} value={keywordWeight} onChange={(e) => setKeywordWeight(Number(e.target.value))} />
            </label>
            <label className="grid gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span>후기 가중치</span>
                <span className="font-semibold">{reviewWeight}</span>
              </div>
              <input type="range" min={0} max={10} value={reviewWeight} onChange={(e) => setReviewWeight(Number(e.target.value))} />
            </label>
            <label className="grid gap-1 text-xs">
              <div className="flex items-center justify-between">
                <span>카테고리 가중치</span>
                <span className="font-semibold">{categoryWeight}</span>
              </div>
              <input type="range" min={0} max={10} value={categoryWeight} onChange={(e) => setCategoryWeight(Number(e.target.value))} />
            </label>
            <button
              type="button"
              onClick={() => {
                setKeywordWeight(6);
                setReviewWeight(3);
                setCategoryWeight(4);
              }}
              className="mt-1 rounded-lg border border-[var(--line)] px-2 py-1 text-xs text-[var(--foreground-soft)] hover:bg-white"
            >
              기본값으로 초기화
            </button>
          </div>
          <div className="grid gap-3">
            {recommendationGroups.map((group) => (
              <div key={group.key} className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 p-3">
                <div className="mb-2">
                  <h3 className="text-sm font-semibold">{group.title}</h3>
                  <p className="text-xs text-[var(--foreground-soft)]">{group.description}</p>
                </div>
                <div className="grid gap-2">
                  {group.items.map((booth) => (
                    <Link key={`${group.key}-${booth.id}`} href={`/booths/${booth.id}`}>
                      <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3 transition-transform hover:scale-[1.01]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{booth.name}</p>
                            <p className="mt-1 line-clamp-1 text-xs text-[var(--foreground-soft)]">{booth.description}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-[var(--accent-leaf)]/12 px-2 py-0.5 text-[10px] text-[var(--accent-leaf)]">
                            {booth.reason}
                          </span>
                        </div>
                        {booth.matchTags && booth.matchTags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {booth.matchTags.map((tag) => (
                              <span key={`${booth.id}-${tag}`} className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-2 py-0.5 text-[10px] text-[var(--foreground-soft)]">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
              !selectedCategory ? 'bg-[var(--accent-coral)]/18 text-[var(--foreground)] border-[var(--accent-coral)]' : 'bg-white/70 text-[var(--foreground-soft)] border-[var(--line)]'
            }`}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategory === cat ? 'bg-[var(--accent-coral)]/18 text-[var(--foreground)] border-[var(--accent-coral)]' : 'bg-white/70 text-[var(--foreground-soft)] border-[var(--line)]'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setSortBy(sortBy === 'reviews' ? 'default' : 'reviews')}
            className={`ml-auto text-xs px-3 py-1.5 rounded-full border transition-colors ${
              sortBy === 'reviews' ? 'bg-[var(--accent-leaf)]/20 text-[var(--foreground)] border-[var(--accent-leaf)]' : 'bg-white/70 text-[var(--foreground-soft)] border-[var(--line)]'
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
                  <Image src={booth.imageUrl} alt={booth.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded-xl object-cover" unoptimized />
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
