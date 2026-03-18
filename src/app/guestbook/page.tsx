"use client";

import { useEffect, useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { GuestbookForm } from "@/components/GuestbookForm";
import { TodayLineWall } from "@/components/TodayLineWall";
import { createGuestbook, fetchGuestbooks } from "@/lib/api";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { GuestbookEntry } from "@/lib/types";

export default function GuestbookPage() {
  const { session, rename } = useFestivalSession();
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGuestbooks().then(setEntries).catch(() => setError("방명록을 불러오지 못했습니다."));
  }, []);

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Sentence Archive" tone="petal" />
          <PaperLabel text="Wall of Notes" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">공원에 한 줄 남기기</h1>
        <p className="body-copy mt-3 max-w-[28ch] text-sm text-[var(--foreground-soft)]">
          방명록 대신 오늘의 한 줄이 벽면처럼 쌓입니다. 짧은 문장으로 축제의 온도를 남겨주세요.
        </p>
      </section>
      <GuestbookForm
        session={session}
        onSubmit={async ({ nickname, message, mood, isPublic }) => {
          if (nickname) rename(nickname);
          const created = await createGuestbook({
            guestId: session?.guestId ?? "guest-anonymous",
            nickname,
            message,
            mood,
            isPublic,
          });
          setEntries((current) => [created, ...current]);
        }}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <TodayLineWall entries={entries.filter((entry) => entry.isPublic && !entry.hidden && entry.approved !== false)} />
    </main>
  );
}
