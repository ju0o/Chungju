import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { EventSettings } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";

export function FestivalIntroCard({ settings }: { settings: EventSettings }) {
  return (
    <section className="section-card paper-stack relative rounded-[1.75rem] p-5">
      <CollageOrnaments className="opacity-70" />
      <SectionHeader
        eyebrow="How To Join"
        title="세 걸음으로 시작되는 오늘의 기록"
        description="회원가입 없이 바로 시작하고, 공원에서 느낀 장면을 스탬프와 문장으로 남기면 됩니다."
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
