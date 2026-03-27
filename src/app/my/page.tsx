'use client';

import { useApiData, useUserSession } from '@/hooks/useApi';
import Link from 'next/link';
import { useState } from 'react';

interface MyPageData {
  user: { id: string; nickname: string; createdAt: string };
  stampProgress: Array<{
    totalStamps: number;
    isCompleted: boolean;
    stampCampaign: { name: string; requiredStamps: number };
  }>;
  reviews: Array<{
    id: string;
    content: string;
    rating: number;
    status: string;
    createdAt: string;
    booth: { name: string };
  }>;
  photocards: Array<{
    id: string;
    acquiredAt: string;
    photocard: { id: string; name: string; imageUrl: string; rarity: string; description: string };
  }>;
}

export default function MyPage() {
  const { updateNickname } = useUserSession();
  const { data, loading, refetch } = useApiData<MyPageData>('/api/me');
  const [editing, setEditing] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) return;
    try {
      await updateNickname(nicknameInput.trim());
      setEditing(false);
      refetch();
    } catch {}
  };

  if (loading) {
    return (
      <main className="app-shell p-4">
        <div className="flex justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="app-shell p-4">
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <p>마이페이지를 로딩할 수 없습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-4 p-4">
      {/* 프로필 */}
      <section className="section-card rounded-[1.75rem] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-coral)]/35 to-[var(--accent-petal)]/45 text-2xl text-[var(--foreground)]">
            👤
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  maxLength={20}
                  className="festival-input flex-1 text-sm"
                  placeholder="닉네임 입력"
                />
                <button onClick={handleSaveNickname} className="festival-button primary rounded-lg px-3 py-1 text-xs">저장</button>
                <button onClick={() => setEditing(false)} className="festival-button paper rounded-lg px-3 py-1 text-xs">취소</button>
              </div>
            ) : (
              <div>
                <h2 className="font-semibold">{data.user.nickname}</h2>
                <button onClick={() => { setNicknameInput(data.user.nickname); setEditing(true); }} className="text-xs text-[var(--accent-coral)]">
                  닉네임 변경
                </button>
              </div>
            )}
            <p className="text-xs text-[var(--foreground-soft)] mt-0.5">
              {new Date(data.user.createdAt).toLocaleDateString('ko-KR')} 가입
            </p>
          </div>
        </div>
      </section>

      {/* 요약 */}
      <section className="grid grid-cols-3 gap-3">
        <Link href="/favorites" className="section-card flex flex-col items-center gap-1 rounded-2xl p-4 text-center">
          <span className="text-2xl">❤️</span>
          <span className="text-lg font-bold text-[var(--accent-coral)]">
            {data.reviews.length > 0 ? new Set(data.reviews.map((review) => review.booth.name)).size : 0}
          </span>
          <span className="text-xs text-[var(--foreground-soft)]">관심 부스</span>
        </Link>
        <div className="section-card flex flex-col items-center gap-1 rounded-2xl p-4 text-center">
          <span className="text-2xl">💬</span>
          <span className="text-lg font-bold text-[var(--accent-leaf)]">{data.reviews.length}</span>
          <span className="text-xs text-[var(--foreground-soft)]">후기</span>
        </div>
        <Link href="/booths" className="section-card flex flex-col items-center gap-1 rounded-2xl p-4 text-center">
          <span className="text-2xl">📚</span>
          <span className="text-lg font-bold text-[var(--accent-sky)]">{data.reviews.length}</span>
          <span className="text-xs text-[var(--foreground-soft)]">참여 기록</span>
        </Link>
      </section>

      {/* 최근 후기 */}
      {data.reviews.length > 0 && (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="font-semibold mb-3">최근 후기</h2>
          <div className="grid gap-2">
            {data.reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="rounded-xl border border-[var(--line)] bg-white/70 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{review.booth.name}</span>
                  <span className="text-yellow-400 text-xs">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--foreground-soft)] line-clamp-2">{review.content}</p>
                <div className="mt-1 flex justify-between text-xs text-[var(--foreground-soft)]">
                  <span>{new Date(review.createdAt).toLocaleDateString('ko-KR')}</span>
                  <span className={review.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}>
                    {review.status === 'APPROVED' ? '승인됨' : review.status === 'PENDING' ? '검수 중' : review.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
