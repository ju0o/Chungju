"use client";

import { useEffect, useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import Link from "next/link";

interface QuizItem {
  id: string;
  question: string;
  choices: string[];
  totalSubmissions: number;
  myAnswer: { chosenIndex: number; isCorrect: boolean } | null;
  correctIndex?: number;
  explanation?: string;
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((d) => { if (d.success) setQuizzes(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (quizId: string, chosenIndex: number) => {
    setSubmitting(quizId);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, chosenIndex }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) =>
          prev.map((q) =>
            q.id === quizId
              ? {
                  ...q,
                  myAnswer: { chosenIndex, isCorrect: data.data.isCorrect },
                  correctIndex: data.data.correctIndex,
                  explanation: data.data.explanation,
                }
              : q,
          ),
        );
      }
    } catch {
      // 오류 무시
    } finally {
      setSubmitting(null);
    }
  };

  const answeredCount = quizzes.filter((q) => q.myAnswer).length;
  const correctCount = quizzes.filter((q) => q.myAnswer?.isCorrect).length;

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Festival Quiz" tone="petal" />
          <PaperLabel text={`${answeredCount}/${quizzes.length} 완료`} tone="leaf" />
        </div>
        <h1 className="section-title mt-4">축제 퀴즈</h1>
        <p className="body-copy mt-3 max-w-[30ch] text-sm text-[var(--foreground-soft)]">
          축제에 대한 퀴즈를 풀어보세요. 정답을 맞히면 특별한 보상이 있을 수 있어요!
        </p>
        {answeredCount > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--leaf-deep)]">
              ✅ {correctCount}개 정답
            </span>
            <span className="text-xs text-[var(--foreground-soft)]">
              / {answeredCount}개 응답
            </span>
          </div>
        )}
      </section>

      {loading ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center text-sm text-[var(--foreground-soft)]">
          퀴즈를 불러오는 중...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm text-[var(--foreground-soft)]">아직 등록된 퀴즈가 없습니다.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              index={index}
              submitting={submitting === quiz.id}
              onSubmit={handleSubmit}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <Link href="/leaderboard" className="festival-button festival-button--paper inline-block text-sm">
          🏆 랭킹 보기
        </Link>
      </div>
    </main>
  );
}

function QuizCard({
  quiz,
  index,
  submitting,
  onSubmit,
}: {
  quiz: QuizItem;
  index: number;
  submitting: boolean;
  onSubmit: (quizId: string, chosenIndex: number) => void;
}) {
  const answered = !!quiz.myAnswer;

  return (
    <div className="section-card rounded-[1.75rem] p-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">
        Q{index + 1}
      </p>
      <h3 className="mt-2 font-semibold leading-relaxed">{quiz.question}</h3>
      <div className="mt-4 grid gap-2">
        {quiz.choices.map((choice: string, i: number) => {
          const isMyChoice = quiz.myAnswer?.chosenIndex === i;
          const isCorrect = quiz.correctIndex === i;

          let style = "border-[var(--line)] bg-white/70 hover:bg-[var(--accent)]/5";
          if (answered) {
            if (isCorrect) style = "border-green-400 bg-green-50";
            else if (isMyChoice && !quiz.myAnswer?.isCorrect) style = "border-red-300 bg-red-50";
            else style = "border-[var(--line)] bg-white/40 opacity-60";
          }

          return (
            <button
              key={i}
              disabled={answered || submitting}
              onClick={() => onSubmit(quiz.id, i)}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${style}`}
            >
              <span className="mr-2 font-semibold text-[var(--foreground-soft)]">
                {String.fromCharCode(65 + i)}.
              </span>
              {choice}
              {answered && isCorrect && <span className="ml-2">✅</span>}
              {answered && isMyChoice && !quiz.myAnswer?.isCorrect && <span className="ml-2">❌</span>}
            </button>
          );
        })}
      </div>
      {answered && quiz.explanation && (
        <div className="mt-3 rounded-xl bg-[rgba(255,252,246,0.78)] p-3 text-sm text-[var(--foreground-soft)]">
          💡 {quiz.explanation}
        </div>
      )}
      {submitting && (
        <p className="mt-2 text-xs text-[var(--foreground-soft)]">제출 중...</p>
      )}
    </div>
  );
}
