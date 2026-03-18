"use client";

import { BookmarkCheck } from "lucide-react";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { BoothProfile, ProgramItem } from "@/lib/types";

export function SavedInterestSection({
  booths,
  programs,
}: {
  booths: BoothProfile[];
  programs: ProgramItem[];
}) {
  const { interests } = useFestivalSession();
  const savedBooths = booths.filter((booth) => interests.favoriteBoothIds.includes(booth.id));
  const savedPrograms = programs.filter((program) => interests.savedProgramIds.includes(program.id));

  if (!savedBooths.length && !interests.favoriteAuthorNames.length && !savedPrograms.length) {
    return null;
  }

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <div className="flex items-center gap-2 text-[var(--foreground)]">
        <BookmarkCheck size={18} className="text-[var(--accent-strong)]" />
        <h2 className="font-[family-name:var(--font-heading)] text-[1.8rem]">내가 저장한 관심 목록</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/75 p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">찜한 책/부스</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{savedBooths.length}</p>
          <p className="body-copy mt-2 text-sm text-[var(--foreground-soft)]">{savedBooths.map((booth) => booth.bookTitle).join(", ") || "아직 저장한 책이 없습니다."}</p>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/75 p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">관심 작가</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{interests.favoriteAuthorNames.length}</p>
          <p className="body-copy mt-2 text-sm text-[var(--foreground-soft)]">{interests.favoriteAuthorNames.join(", ") || "아직 저장한 작가가 없습니다."}</p>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/75 p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">일정 알림</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{savedPrograms.length}</p>
          <p className="body-copy mt-2 text-sm text-[var(--foreground-soft)]">{savedPrograms.map((program) => `${program.time} ${program.title}`).join(", ") || "아직 저장한 일정이 없습니다."}</p>
        </div>
      </div>
    </section>
  );
}
