import Link from "next/link";
import { BookOpen, Feather, Library } from "lucide-react";
import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { EventSettings } from "@/lib/types";
import { GuestStartButton } from "@/components/GuestStartButton";
import { HeroBannerSlider } from "@/components/HeroBannerSlider";

export function HeroSection({ settings }: { settings: EventSettings }) {
  const isArchive = settings.siteMode === "ended" || settings.siteMode === "archive";
  const teamCount = new Set(
    settings.booths.map((booth) => (booth.authorName?.trim() ? booth.authorName.trim() : booth.name.trim())),
  ).size;
  const bookCount = settings.booths.filter((booth) => Boolean(booth.bookTitle?.trim())).length;
  return (
    <section className="section-card paper-stack grain soft-pattern relative rounded-[2rem] p-6">
      <CollageOrnaments />
      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <PaperLabel text="오늘의 머무름" tone="petal" />
            <PaperLabel text={settings.eventName} />
            <PaperLabel text={`${teamCount}팀 / ${bookCount}권`} tone="leaf" />
          </div>
          <div className="space-y-3">
            <p className="section-eyebrow">Spring Archive Market</p>
            <h1 className="max-w-[14ch] whitespace-pre-line font-[family-name:var(--font-heading)] text-[clamp(1.75rem,6.5vw,2.25rem)] leading-[1.22] tracking-[-0.025em]">
              {settings.heroTitle}
            </h1>
            <p className="hero-copy max-w-[31ch] text-sm text-[var(--foreground-soft)]">{settings.heroDescription}</p>
            <div className="grid gap-1.5 text-xs tracking-[0.01em] text-[var(--foreground-soft)]">
              <p>{settings.eventDate}</p>
              <p>{settings.eventPlace}</p>
              <p>{settings.operationHours}</p>
            </div>
          </div>
          <div className="grid gap-3 text-xs leading-[1.6] tracking-[-0.005em] text-[var(--foreground-soft)]">
            <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/55 px-3 py-3">
              <Library size={15} className="mb-2 text-[var(--accent-strong)]" />
              작가 부스와 추천 서적을 둘러봅니다
            </div>
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/55 px-3 py-3">
              <BookOpen size={15} className="mb-2 text-[var(--leaf-deep)]" />
              책 소개와 추천 기준을 확인합니다
            </div>
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/55 px-3 py-3">
              <Feather size={15} className="mb-2 text-[var(--foreground)]" />
              작가의 문장과 큐레이션 글을 읽습니다
            </div>
            </div>
          </div>
          <div className="grid gap-3">
            <GuestStartButton />
            <div className="grid grid-cols-2 gap-3">
              <Link href="/guestbook" className="festival-button festival-button--paper text-sm">
                {settings.ctaLabels.guestbook}
              </Link>
              <Link href="/moments" className="festival-button festival-button--paper text-sm">
                {settings.ctaLabels.moments}
              </Link>
            </div>
            {isArchive ? (
              <div className="festival-button border border-[var(--line)] bg-[rgba(94,86,72,0.08)] text-[var(--foreground-soft)]">
                {settings.archiveNotice}
              </div>
            ) : (
              <Link href="/booths" className="festival-button festival-button--primary">
                책 부스 바로 보기
              </Link>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <HeroBannerSlider />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.76)] p-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-[var(--foreground-soft)]">SCENE 01</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">메인배너는 자동 재생으로 현장 분위기를 먼저 전달해 텍스트 피로도를 낮춥니다.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.76)] p-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-[var(--foreground-soft)]">SCENE 02</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">작가와 책 정보는 이미지와 함께 카드형으로 보여주어 빠르게 훑어볼 수 있게 정리합니다.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.76)] p-4">
              <p className="text-xs font-semibold tracking-[0.1em] text-[var(--foreground-soft)]">SCENE 03</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">책 소개, 작가 한마디, 추천 문장을 분리해 필요한 정보만 빠르게 읽을 수 있게 구성했습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
