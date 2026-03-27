import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { EventSettings } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";

export function FestivalIntroCard({ settings }: { settings: EventSettings }) {
  return (
    <section className="section-card paper-stack relative rounded-[1.75rem] p-5">
      <CollageOrnaments className="opacity-70" />
      <SectionHeader
        eyebrow="How To Browse"
        title="세 단계로 보는 작가와 책 부스"
        description="관심 있는 작가를 찾고, 책 소개를 읽고, 현장 부스 정보를 확인해 방문 동선을 준비해보세요."
      />
      <div className="mt-5 grid gap-3">
        {settings.introSteps.map((step, index) => (
          <div
            key={step}
            className="relative flex items-start gap-3 rounded-[1.35rem] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-4"
          >
            <PaperLabel text={`STEP ${index + 1}`} tone={index % 2 === 0 ? "leaf" : "petal"} />
            <p className="body-copy max-w-[26ch] pt-1 text-sm text-[var(--foreground)]">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
