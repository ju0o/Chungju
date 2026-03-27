'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useFestivalSession } from '@/hooks/useFestivalSession';

interface RecommendedBooth {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  reason: string;
  score: number;
  matchTags?: string[];
}

const STOP_WORDS = new Set([
  '작가', '부스', '도서', '책', '소개', '그리고', 'the', 'with', 'from', 'this',
]);

function toKeywords(value: string) {
  return value
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

type BoothRecommendationProps = {
  currentBoothId: string;
  category: string;
  currentName: string;
  currentDescription: string;
  currentAuthorName?: string;
  currentBookTitle?: string;
};

export function BoothRecommendation({
  currentBoothId,
  category,
  currentName,
  currentDescription,
  currentAuthorName,
  currentBookTitle,
}: BoothRecommendationProps) {
  const [booths, setBooths] = useState<RecommendedBooth[]>([]);
  const { interests } = useFestivalSession();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booths?category=${encodeURIComponent(category)}&exclude=${currentBoothId}`);
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data || json;

        if (!Array.isArray(data)) return;

        const favIds = interests.favoriteBoothIds;
        const currentKeywordSet = new Set(
          toKeywords(
            [
              currentName,
              currentDescription,
              currentAuthorName ?? '',
              currentBookTitle ?? '',
            ].join(' '),
          ),
        );

        const recommended: RecommendedBooth[] = data
          .map((b: {
            id: string;
            name: string;
            category: string;
            description: string;
            imageUrl: string | null;
            metadata?: unknown;
            _count?: { reviews?: number };
          }) => {
            const reviewCount = b._count?.reviews ?? 0;
            const sameCategory = b.category === category;
            const isFavorite = favIds.includes(b.id);
            const metadata = b.metadata && typeof b.metadata === 'object' && !Array.isArray(b.metadata)
              ? (b.metadata as Record<string, unknown>)
              : {};
            const authorName = typeof metadata.authorName === 'string' ? metadata.authorName : '';
            const bookTitle = typeof metadata.bookTitle === 'string' ? metadata.bookTitle : '';
            const candidateKeywords = toKeywords([b.name, b.description, authorName, bookTitle].join(' '));
            const matchedKeywords = candidateKeywords.filter((keyword) => currentKeywordSet.has(keyword));
            const keywordScore = Math.min(matchedKeywords.length, 3) * 2;
            const authorKeywordMatched = currentAuthorName
              ? toKeywords(authorName).some((keyword) => toKeywords(currentAuthorName).includes(keyword))
              : false;
            const titleKeywordMatched = currentBookTitle
              ? toKeywords(bookTitle).some((keyword) => toKeywords(currentBookTitle).includes(keyword))
              : false;
            const reason = isFavorite
              ? '내가 찜한 부스'
              : authorKeywordMatched
              ? '작가명 유사 추천'
              : titleKeywordMatched
              ? '책제목 유사 추천'
              : matchedKeywords[0]
              ? `"${matchedKeywords[0]}" 키워드 유사`
              : sameCategory
              ? '같은 장르의 책 부스'
              : reviewCount >= 3
              ? '후기 반응이 좋은 부스'
              : '독서 동선 추천 부스';

            const score = (isFavorite ? 5 : 0) + (sameCategory ? 3 : 0) + keywordScore + Math.min(reviewCount, 5);

            return {
              id: b.id,
              name: b.name,
              category: b.category,
              description: b.description?.slice(0, 60) || '',
              imageUrl: b.imageUrl,
              reason,
              score,
              matchTags: matchedKeywords.slice(0, 2),
            };
          })
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ko'))
          .slice(0, 3);

        setBooths(recommended);
      } catch { /* ignore */ }
    }
    load();
  }, [currentBoothId, category, currentName, currentDescription, currentAuthorName, currentBookTitle, interests.favoriteBoothIds]);

  if (booths.length === 0) return null;

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-semibold mb-3">📚 이런 독서 부스도 좋아하실 거예요</h2>
      <div className="grid gap-3">
        {booths.map((booth) => (
          <Link key={booth.id} href={`/booths/${booth.id}`}>
            <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-3 transition-transform hover:scale-[1.01]">
              {booth.imageUrl ? (
                <Image src={booth.imageUrl} alt={booth.name} width={56} height={56} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" unoptimized />
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
                {booth.matchTags && booth.matchTags.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {booth.matchTags.map((tag) => (
                      <span key={`${booth.id}-${tag}`} className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-1.5 py-0.5 text-[10px] text-[var(--foreground-soft)]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
