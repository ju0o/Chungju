"use client";

import { useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { EventSettings, GuestSession } from "@/lib/types";

type Props = {
  session: GuestSession | null;
  settings: EventSettings;
  onSubmit: (formData: FormData) => Promise<void>;
};

export function MomentForm({ session, settings, onSubmit }: Props) {
  const [nickname, setNickname] = useState(session?.nickname ?? "");
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(settings.momentTags.slice(0, 2));
  const [isPublic, setIsPublic] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag].slice(0, 3),
    );
  };

  return (
    <form
      className="section-card paper-stack rounded-[1.75rem] p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("nickname", nickname || "게스트");
        formData.append("text", text);
        formData.append("hashtags", JSON.stringify(selectedTags));
        formData.append("isPublic", JSON.stringify(isPublic));
        if (session?.guestId) formData.append("guestId", session.guestId);
        if (file) formData.append("image", file);
        setLoading(true);
        try {
          await onSubmit(formData);
          setText("");
          setFile(null);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex flex-wrap gap-2">
        <PaperLabel text="순간 기록" tone="leaf" />
        <PaperLabel text="사진 1장 또는 텍스트" tone="petal" />
      </div>
      <h2 className="section-title mt-4">오늘의 순간</h2>
      <div className="mt-4 grid gap-3">
        <input
          className="festival-input"
          placeholder="닉네임 (선택)"
          value={nickname}
          onChange={(event) => setNickname(event.target.value.slice(0, 18))}
        />
        <textarea
          className="festival-input festival-textarea"
          placeholder="방금 지나간 장면을 적어주세요."
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, 140))}
          required
        />
        <input
          type="file"
          accept="image/*"
          className="festival-input"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <div className="flex flex-wrap gap-2">
          {settings.momentTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`rounded-full border px-3 py-2 text-xs ${selectedTags.includes(tag) ? "border-[var(--accent)] bg-[rgba(234,183,190,0.18)] text-[var(--accent-strong)]" : "border-[var(--line)] bg-white/70 text-[var(--foreground-soft)]"}`}
            >
              #{tag}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground-soft)]">
          <input type="checkbox" checked={isPublic} onChange={() => setIsPublic((value) => !value)} />
          공개 아카이브로 남기기
        </label>
        <button disabled={loading} className="festival-button festival-button--primary">
          순간 남기기
        </button>
      </div>
    </form>
  );
}
