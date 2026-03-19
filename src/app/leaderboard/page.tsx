"use client";

import { useEffect, useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import Link from "next/link";

interface RankItem {
  rank: number;
  nickname: string;
  stampCount?: number;
  reviewCount: number;
}

interface LeaderboardData {
  stampRanking: RankItem[];
  reviewRanking: RankItem[];
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [tab, setTab] = useState<"stamp" | "review">("stamp");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const ranking = tab === "stamp" ? data?.stampRanking : data?.reviewRanking;

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Leaderboard" tone="petal" />
          <PaperLabel text="Top 10" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">방문 인증 랭킹</h1>
        <p className="body-copy mt-3 max-w-[30ch] text-sm text-[var(--foreground-soft)]">
          스탬프를 가장 많이 모으고, 후기를 많이 남긴 방문객을 확인해보세요.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setTab("stamp")}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "stamp"
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-strong)]"
              : "border-[var(--line)] bg-white/70 text-[var(--foreground-soft)]"
          }`}
        >
          🎫 스탬프 랭킹
        </button>
        <button
          onClick={() => setTab("review")}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
            tab === "review"
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent-strong)]"
              : "border-[var(--line)] bg-white/70 text-[var(--foreground-soft)]"
          }`}
        >
          💬 후기 랭킹
        </button>
      </div>

      {loading ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center text-sm text-[var(--foreground-soft)]">
          랭킹을 불러오는 중...
        </div>
      ) : !ranking || ranking.length === 0 ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-sm text-[var(--foreground-soft)]">아직 랭킹 데이터가 없습니다.</p>
        </div>
      ) : (
        <div className="section-card rounded-[1.75rem] p-4">
          <div className="grid gap-2">
            {ranking.map((item) => (
              <div
                key={item.rank}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  item.rank <= 3
                    ? "border-[var(--accent)] bg-[var(--accent)]/5"
                    : "border-[var(--line)] bg-white/70"
                }`}
              >
                <span className="text-lg font-bold w-8 text-center">
                  {item.rank <= 3 ? MEDAL[item.rank - 1] : item.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.nickname}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[var(--accent-strong)]">
                    {tab === "stamp" ? `${item.stampCount ?? 0}개` : `${item.reviewCount}개`}
                  </p>
                  <p className="text-[10px] text-[var(--foreground-soft)]">
                    {tab === "stamp" ? "스탬프" : "후기"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-center">
        <Link href="/quiz" className="festival-button festival-button--paper text-sm">
          📝 퀴즈 풀기
        </Link>
        <Link href="/tour" className="festival-button festival-button--paper text-sm">
          🗺️ 스탬프 투어
        </Link>
      </div>
    </main>
  );
}
