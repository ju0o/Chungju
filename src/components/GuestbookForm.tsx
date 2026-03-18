"use client";

import { useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { GUESTBOOK_LIMIT } from "@/lib/constants";
import { GuestSession } from "@/lib/types";

type Props = {
  session: GuestSession | null;
  onSubmit: (payload: {
    nickname: string;
    message: string;
    mood: "설렘" | "평온" | "반짝임" | "따뜻함";
    isPublic: boolean;
  }) => Promise<void>;
};

const moods = ["설렘", "평온", "반짝임", "따뜻함"] as const;

export function GuestbookForm({ session, onSubmit }: Props) {
  const [nickname, setNickname] = useState(session?.nickname ?? "");
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState<(typeof moods)[number]>("설렘");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const remaining = GUESTBOOK_LIMIT - message.length;

  return (
    <form
      className="section-card paper-stack rounded-[1.75rem] p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
          await onSubmit({
            nickname: nickname || "게스트",
            message,
            mood,
            isPublic,
          });
          setMessage("");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex flex-wrap gap-2">
        <PaperLabel text="문장 입력" tone="petal" />
        <PaperLabel text="최대 80자" tone="leaf" />
      </div>
      <h2 className="section-title mt-4">오늘의 한 줄</h2>
      <div className="mt-4 grid gap-3">
        <input
          className="festival-input"
          placeholder="닉네임 (선택)"
          value={nickname}
          onChange={(event) => setNickname(event.target.value.slice(0, 18))}
        />
        <textarea
          className="festival-input festival-textarea"
          placeholder="머무른 문장 한 줄을 남겨주세요."
          value={message}
          maxLength={GUESTBOOK_LIMIT}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
        <div className="flex items-center justify-between text-xs text-[var(--foreground-soft)]">
          <span>최대 {GUESTBOOK_LIMIT}자</span>
          <span>{remaining}자 남음</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {moods.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setMood(item)}
              className={`rounded-[1.1rem] border px-4 py-3 text-sm ${mood === item ? "border-[var(--accent)] bg-[rgba(234,183,190,0.18)] text-[var(--accent-strong)]" : "border-[var(--line)] bg-white/70 text-[var(--foreground-soft)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground-soft)]">
          <input type="checkbox" checked={isPublic} onChange={() => setIsPublic((value) => !value)} />
          공개 문장으로 등록하기
        </label>
        <button disabled={loading} className="festival-button festival-button--primary">
          문장 남기기
        </button>
      </div>
    </form>
  );
}
