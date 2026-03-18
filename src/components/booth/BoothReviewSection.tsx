'use client';

import { useState } from 'react';
import { fetchApi } from '@/hooks/useApi';

interface Review {
  id: string;
  content: string;
  rating: number;
  imageUrls: string[];
  createdAt: string;
  user: { nickname: string };
}

export function BoothReviewSection({
  boothId,
  boothName,
  reviews: initialReviews,
}: {
  boothId: string;
  boothName: string;
  reviews: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const newReview = await fetchApi<Review>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ boothId, content: content.trim(), rating, imageUrls: [] }),
      });
      setReviews((prev) => [newReview, ...prev]);
      setContent('');
      setRating(5);
      setShowForm(false);
      setMessage('후기가 등록되었습니다! 관리자 승인 후 공개됩니다.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : '후기 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">💬 방문 후기 ({reviews.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="festival-button primary rounded-full px-4 py-2 text-xs"
        >
          {showForm ? '취소' : '후기 쓰기'}
        </button>
      </div>

      {message && (
        <div className="mb-3 rounded-xl bg-[var(--accent-leaf)]/10 p-3 text-sm text-[var(--accent-leaf)]">
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-[var(--line)] bg-white/70 p-4">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium">평점</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${boothName}에 대한 후기를 남겨주세요`}
              maxLength={500}
              rows={3}
              className="festival-textarea w-full"
            />
            <div className="text-right text-xs text-[var(--foreground-soft)]">{content.length}/500</div>
          </div>
          <button type="submit" disabled={submitting || !content.trim()} className="festival-button primary w-full rounded-xl py-2 text-sm">
            {submitting ? '등록 중...' : '후기 등록'}
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border border-[var(--line)] bg-white/70 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">{review.user.nickname}</span>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
              </div>
            </div>
            <p className="mt-2 text-[var(--foreground-soft)] whitespace-pre-wrap">{review.content}</p>
            <div className="mt-2 text-xs text-[var(--foreground-soft)]">
              {new Date(review.createdAt).toLocaleDateString('ko-KR')}
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="py-6 text-center text-sm text-[var(--foreground-soft)]">첫 번째 후기를 남겨보세요! 🌸</div>
        )}
      </div>
    </section>
  );
}
