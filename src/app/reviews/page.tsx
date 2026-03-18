'use client';

import { useApiData } from '@/hooks/useApi';
import Link from 'next/link';

interface ReviewItem {
  id: string;
  content: string;
  rating: number;
  imageUrls: string[];
  createdAt: string;
  user: { id: string; nickname: string };
  booth: { id: string; name: string; category: string };
}

export default function ReviewsPage() {
  const { data: reviews, loading } = useApiData<ReviewItem[]>('/api/reviews?pageSize=50');

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
        <h1 className="section-title mb-1">💬 방문 후기</h1>
        <p className="text-sm text-[var(--foreground-soft)]">축제 방문자들의 생생한 후기</p>
      </section>

      <div className="grid gap-3">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="section-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-coral)]/10 text-sm">
                    👤
                  </div>
                  <div>
                    <div className="text-sm font-medium">{review.user.nickname}</div>
                    <div className="text-xs text-[var(--foreground-soft)]">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>

              <Link href={`/booths/${review.booth.id}`}>
                <span className="inline-block mb-2 rounded-full bg-[var(--accent-leaf)]/10 px-2 py-0.5 text-xs text-[var(--accent-leaf)]">
                  🏪 {review.booth.name}
                </span>
              </Link>

              <p className="text-sm text-[var(--foreground-soft)] whitespace-pre-wrap">{review.content}</p>

              {review.imageUrls.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {(review.imageUrls as string[]).map((url, i) => (
                    <img key={i} src={url} alt="" className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="section-card rounded-[1.75rem] p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h2 className="font-semibold mb-2">아직 후기가 없어요</h2>
            <p className="text-sm text-[var(--foreground-soft)]">부스를 방문하고 첫 번째 후기를 남겨보세요!</p>
            <Link href="/booths" className="festival-button primary mt-4 inline-block rounded-xl px-6 py-2 text-sm">
              부스 둘러보기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
