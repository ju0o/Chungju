import { PaperLabel } from "@/components/CollageOrnaments";
import { SectionHeader } from "@/components/SectionHeader";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <SectionHeader
          eyebrow="About"
          title={settings.eventName}
          description="살아있던 적이 없는 꽃을 팝니다, 그런데 이제 영원히 시들지 않는."
        />
        <p className="mt-5 max-w-[30ch] text-sm leading-8 text-[var(--foreground-soft)]">
          이 사이트는 현장 QR로 접속해 회원가입 없이 참여하는 모바일 우선 축제 기록 웹앱입니다. 꽃시장 포스터와 공원 산책, 문화 마켓과 문장 아카이브의 분위기를 웹 안에서 가볍고 정돈된 층으로 번역했습니다.
        </p>
      </section>
      <section className="section-card rounded-[1.75rem] p-5">
        <SectionHeader
          eyebrow="Principles"
          title="운영 원칙"
          description="기능은 빠르고 단순해야 하지만, 남는 감각은 기록물처럼 오래가야 합니다."
        />
        <div className="mt-5 grid gap-3 text-sm leading-7 text-[var(--foreground-soft)]">
          <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/65 p-4">
            <PaperLabel text="Guest Session" tone="leaf" />
            <p className="mt-3">모든 참여는 게스트 세션 기반으로 동작합니다.</p>
          </div>
          <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/65 p-4">
            <PaperLabel text="Local Archive" tone="petal" />
            <p className="mt-3">개인 진행 상태와 카드 기록은 브라우저 localStorage에 저장됩니다.</p>
          </div>
          <div className="rounded-[1.35rem] border border-[var(--line)] bg-white/65 p-4">
            <PaperLabel text="Public Record" />
            <p className="mt-3">공용 방명록과 순간 기록은 서버 DB 또는 더미 저장소에 저장되고 운영자가 검수할 수 있습니다.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
