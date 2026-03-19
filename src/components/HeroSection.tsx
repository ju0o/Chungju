import Link from "next/link";
import { BookOpen, Flower2, MapPinned } from "lucide-react";
import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { EventSettings } from "@/lib/types";
import { GuestStartButton } from "@/components/GuestStartButton";
import { HeroBannerSlider } from "@/components/HeroBannerSlider";

export function HeroSection({ settings }: { settings: EventSettings }) {
  const isArchive = settings.siteMode === "ended" || settings.siteMode === "archive";
  return (
    <section className="section-card paper-stack grain soft-pattern relative rounded-[2rem] p-6">
      <CollageOrnaments />
      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <PaperLabel text="오늘의 머무름" tone="petal" />
            <PaperLabel text={settings.eventName} />
          </div>
          <div className="space-y-3">
            <p className="section-eyebrow">Spring Archive Market</p>
            <h1 className="max-w-[14ch] whitespace-pre-line font-[family-name:var(--font-heading)] text-[clamp(2rem,7.5vw,2.85rem)] leading-[1.12] tracking-[-0.035em]">
              {settings.heroTitle}
            </h1>
            <p className="hero-copy max-w-[31ch] text-[0.93rem] text-[var(--foreground-soft)]">{settings.heroDescription}</p>
            <div className="grid gap-1.5 text-xs tracking-[0.02em] text-[var(--foreground-soft)]">
              <p>{settings.eventDate}</p>
              <p>{settings.eventPlace}</p>
              <p>{settings.operationHours}</p>
            </div>
          </div>
          <div className="grid gap-3 text-[11px] leading-[1.55] tracking-[-0.01em] text-[var(--foreground-soft)]">
            <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/55 px-3 py-3">
              <Flower2 size={15} className="mb-2 text-[var(--accent-strong)]" />
              꽃시장과 문화 부스를 걷습니다
            </div>
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/55 px-3 py-3">
              <BookOpen size={15} className="mb-2 text-[var(--leaf-deep)]" />
              문장과 한 줄 기록을 남깁니다
            </div>
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-white/55 px-3 py-3">
              <MapPinned size={15} className="mb-2 text-[var(--foreground)]" />
              QR 스탬프로 오늘의 동선을 모읍니다
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
              <Link href="/tour" className="festival-button festival-button--primary">
                {settings.ctaLabels.start}
              </Link>
            )}
          </div>
        </div>
        <div className="grid gap-3">
          <HeroBannerSlider />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.76)] p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">SCENE 01</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">메인배너는 자동 재생으로 현장 분위기를 먼저 전달해 텍스트 피로도를 낮춥니다.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.76)] p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">SCENE 02</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">작가와 책 정보는 이미지와 함께 카드형으로 보여주어 빠르게 훑어볼 수 있게 정리합니다.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.76)] p-4">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">SCENE 03</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">문장, 기록, 동선을 시각 단위로 나눠 콘텐츠가 길어도 숨 쉬듯 읽히게 구성했습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
