import { ArchiveModeBanner } from "@/components/ArchiveModeBanner";
import { ArchiveGalleryPreview } from "@/components/ArchiveGalleryPreview";
import { AuthorShowcaseSection } from "@/components/AuthorShowcaseSection";
import { BoothProfileCard } from "@/components/BoothProfileCard";
import { PaperLabel } from "@/components/CollageOrnaments";
import { FestivalIntroCard } from "@/components/FestivalIntroCard";
import { HeroSection } from "@/components/HeroSection";
import { InteractiveFestivalMap } from "@/components/InteractiveFestivalMap";
import { ProgramBoard } from "@/components/ProgramBoard";
import { QuoteDrawCard } from "@/components/QuoteDrawCard";
import { SavedInterestSection } from "@/components/SavedInterestSection";
import { SectionHeader } from "@/components/SectionHeader";
import { TODAY_COPY } from "@/lib/constants";
import { getPublicMoments, getSiteSettings, getStampPoints } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();
  const stampPoints = await getStampPoints();
  const moments = await getPublicMoments(4);
  const isArchive = settings.siteMode === "ended" || settings.siteMode === "archive";

  return (
    <main className="app-shell grid gap-4">
      <HeroSection settings={settings} />
      {isArchive ? <ArchiveModeBanner message={settings.archiveNotice} /> : null}
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <SectionHeader eyebrow="Today" title={TODAY_COPY.title} description={TODAY_COPY.body} />
        <div className="mt-5 grid gap-3">
          <div className="body-copy rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--foreground-soft)]">
            꽃시장 포스터의 결, 공원의 봄빛, 한 조각의 문장을 모아 만든 모바일 기록소입니다. 처음 들어온 사람도 3초 안에 무엇을 할 수 있는지 이해하도록 설계했습니다.
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,252,246,0.78)] p-4">
              <PaperLabel text="이 축제는" tone="petal" />
              <p className="body-copy mt-3 text-[var(--foreground-soft)]">산책과 기록, 문화 부스와 꽃시장이 함께 있는 봄의 공원입니다.</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,252,246,0.78)] p-4">
              <PaperLabel text="할 수 있는 일" tone="leaf" />
              <p className="body-copy mt-3 text-[var(--foreground-soft)]">QR 투어, 오늘의 한 줄, 순간 기록, 카드 저장을 한 번에 경험합니다.</p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,252,246,0.78)] p-4">
              <PaperLabel text="지금 누를 곳" />
              <p className="body-copy mt-3 text-[var(--foreground-soft)]">투어 시작하기 또는 기록 남기기 버튼에서 바로 입장하면 됩니다.</p>
            </div>
          </div>
        </div>
      </section>
      <FestivalIntroCard settings={settings} />
      <AuthorShowcaseSection settings={settings} />
      <SavedInterestSection booths={settings.booths} programs={settings.programs} />
      {settings.sectionVisibility.showMap ? <InteractiveFestivalMap points={stampPoints} booths={settings.booths} /> : null}
      {settings.sectionVisibility.showPrograms ? <ProgramBoard items={settings.programs} /> : null}
      <ArchiveGalleryPreview moments={moments} />
      {settings.sectionVisibility.showBooths ? (
        <section className="grid gap-3">
          <SectionHeader eyebrow="Booths" title="문화 부스 소개" description="책과 문장, 꽃과 작은 전시가 머무름의 이유가 되는 공간들을 먼저 살펴보세요." />
          {settings.booths.sort((a, b) => a.order - b.order).map((booth) => (
            <BoothProfileCard key={booth.id} booth={booth} />
          ))}
        </section>
      ) : null}
      {settings.sectionVisibility.showQuoteDraw ? (
        <QuoteDrawCard
          quotes={settings.quotes}
          title="오늘의 문장"
          description="작가 큐레이션과 애착꽃시장 전체의 분위기를 담은 문장을 랜덤으로 꺼내보세요."
        />
      ) : null}
    </main>
  );
}
