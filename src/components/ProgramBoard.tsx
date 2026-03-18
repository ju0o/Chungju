"use client";

import { BellRing, Check } from "lucide-react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { SectionHeader } from "@/components/SectionHeader";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { ProgramItem } from "@/lib/types";

export function ProgramBoard({ items }: { items: ProgramItem[] }) {
  const { interests, upsertInterests } = useFestivalSession();

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <SectionHeader
        eyebrow="Program Board"
        title="오늘의 프로그램"
        description="버스킹과 큐레이션, 기록 소개가 시간의 흐름에 맞춰 이어지는 작은 봄 마켓의 보드입니다."
      />
      <div className="mt-5 grid gap-3">
        {items
          .filter((item) => item.isPublished)
          .sort((a, b) => a.order - b.order)
          .map((item) => {
            const saved = interests.savedProgramIds.includes(item.id);
            return (
              <div key={`${item.time}-${item.title}`} className="grid gap-3 rounded-[1.45rem] border border-[var(--line)] bg-[rgba(255,250,243,0.78)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="paper-label min-w-16 justify-center text-sm font-semibold text-[var(--accent-strong)]">
                    {item.time}
                  </div>
                  <PaperLabel
                    text={item.status === "live" ? "진행 중" : item.status === "done" ? "종료" : "예정"}
                    tone={item.status === "live" ? "leaf" : "default"}
                  />
                </div>
                <div className="grid gap-2">
                  <p className="font-[family-name:var(--font-heading)] text-[1.7rem] leading-tight">{item.title}</p>
                  <p className="body-copy text-sm text-[var(--foreground-soft)]">{item.detail}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <PaperLabel text={item.location} />
                  <PaperLabel text="오늘의 프로그램" tone="petal" />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    upsertInterests({
                      ...interests,
                      savedProgramIds: saved
                        ? interests.savedProgramIds.filter((programId) => programId !== item.id)
                        : [...interests.savedProgramIds, item.id],
                    })
                  }
                  className={`festival-button text-sm ${saved ? "festival-button--primary" : "festival-button--paper"}`}
                >
                  {saved ? <Check size={16} /> : <BellRing size={16} />}
                  {saved ? "일정 알림 저장됨" : "현장 일정 알림 저장"}
                </button>
              </div>
            );
          })}
      </div>
    </section>
  );
}
