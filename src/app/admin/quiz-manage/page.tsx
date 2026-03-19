'use client';

import { useEffect, useState } from 'react';
import { useAdminSession } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Quiz {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { submissions: number };
}

export default function AdminQuizPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) router.push('/admin/login');
  }, [authLoading, session, router]);

  useEffect(() => {
    if (session) {
      fetch('/api/admin/quiz')
        .then((r) => r.json())
        .then((d) => { if (d.success) setQuizzes(d.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleCreate = async () => {
    if (!form.question || form.choices.some((c) => !c.trim())) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: form.question,
          choices: form.choices,
          correctIndex: form.correctIndex,
          explanation: form.explanation || null,
          sortOrder: quizzes.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizzes((prev) => [...prev, { ...data.data, _count: { submissions: 0 } }]);
        setForm({ question: '', choices: ['', '', '', ''], correctIndex: 0, explanation: '' });
        setShowForm(false);
      }
    } catch {
      // 오류 무시
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !session) return null;

  return (
    <main className="min-h-screen bg-[var(--paper)] p-4 md:p-8">
      <div className="mx-auto max-w-3xl grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-sm text-[var(--foreground-soft)] hover:underline">← 대시보드</Link>
            <h1 className="text-2xl font-bold mt-1">📝 퀴즈 관리</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="festival-button festival-button--primary rounded-xl px-4 py-2 text-sm">
            {showForm ? '취소' : '+ 퀴즈 추가'}
          </button>
        </div>

        {showForm && (
          <div className="section-card rounded-[1.75rem] p-5 grid gap-4">
            <h2 className="font-semibold">새 퀴즈 만들기</h2>
            <div>
              <label className="text-xs font-semibold text-[var(--foreground-soft)]">질문</label>
              <input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                placeholder="축제 관련 퀴즈 질문을 입력하세요"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-[var(--foreground-soft)]">선택지</label>
              {form.choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctIndex: i })}
                    className={`shrink-0 h-6 w-6 rounded-full border-2 text-xs font-bold ${
                      form.correctIndex === i ? 'border-green-500 bg-green-500 text-white' : 'border-[var(--line)]'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <input
                    value={c}
                    onChange={(e) => {
                      const next = [...form.choices];
                      next[i] = e.target.value;
                      setForm({ ...form, choices: next });
                    }}
                    className="flex-1 rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                    placeholder={`선택지 ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
              <p className="text-[11px] text-[var(--foreground-soft)]">🟢 초록색 원이 정답입니다. 클릭하여 정답을 변경하세요.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--foreground-soft)]">해설 (선택)</label>
              <textarea
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
                rows={2}
                placeholder="정답 공개 시 보여줄 해설"
              />
            </div>
            <button
              disabled={saving || !form.question || form.choices.some((c) => !c.trim())}
              onClick={handleCreate}
              className="festival-button festival-button--primary rounded-xl py-2 text-sm disabled:opacity-50"
            >
              {saving ? '저장 중...' : '퀴즈 등록'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-sm text-[var(--foreground-soft)]">불러오는 중...</div>
        ) : quizzes.length === 0 ? (
          <div className="section-card rounded-[1.75rem] p-8 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-sm text-[var(--foreground-soft)]">등록된 퀴즈가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {quizzes.map((quiz, i) => (
              <div key={quiz.id} className="section-card rounded-[1.75rem] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">Q{i + 1}</p>
                    <h3 className="mt-1 font-semibold text-sm">{quiz.question}</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {quiz.choices.map((c: string, ci: number) => (
                        <span key={ci} className={`rounded-lg px-2 py-0.5 text-[11px] ${ci === quiz.correctIndex ? 'bg-green-100 text-green-700 font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                          {String.fromCharCode(65 + ci)}. {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${quiz.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {quiz.isActive ? '활성' : '비활성'}
                    </span>
                    <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">
                      응답 {quiz._count.submissions}개
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
