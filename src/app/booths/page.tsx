import { BoothProfileCard } from "@/components/BoothProfileCard";
import { PaperLabel } from "@/components/CollageOrnaments";
import { QuoteDrawCard } from "@/components/QuoteDrawCard";
import { SavedInterestSection } from "@/components/SavedInterestSection";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function BoothsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Booths" tone="petal" />
          <PaperLabel text="Writers & Market" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">작가 / 문화부스 소개</h1>
        <p className="body-copy mt-3 max-w-[28ch] text-sm text-[var(--foreground-soft)]">
          위탁 판매로 참여하는 작가들의 책, 대표 문장, 작가의 말을 한 장의 전시 카드처럼 소개합니다.
        </p>
      </section>
      <QuoteDrawCard quotes={settings.quotes} title="오늘의 문장" description="오늘 소개되는 작가의 문장과 행사 전체 큐레이션 문장을 랜덤으로 만나보세요." />
      <SavedInterestSection booths={settings.booths} programs={settings.programs} />
      {settings.booths.sort((a, b) => a.order - b.order).map((booth) => (
        <BoothProfileCard key={booth.id} booth={booth} />
      ))}
    </main>
  );
}
