import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpenText, Quote, Sparkles } from "lucide-react";
import { BoothProfile, EventSettings } from "@/lib/types";
import { SectionHeader } from "@/components/SectionHeader";

function AuthorFeatureCard({ booth }: { booth: BoothProfile }) {
  return (
    <article className="group rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,251,246,0.84)] p-4 shadow-[0_12px_28px_rgba(85,67,49,0.08)]">
      <div className="grid gap-4 sm:grid-cols-[116px_1fr] sm:items-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] border border-[rgba(94,86,72,0.08)] bg-[rgba(255,255,255,0.7)]">
          {booth.imageUrl ? (
            <Image src={booth.imageUrl} alt={`${booth.bookTitle} 표지`} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" unoptimized />
          ) : (
            <div className="quote-text flex h-full items-end p-4 text-xl text-[var(--foreground)]">{booth.bookTitle}</div>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(222,133,101,0.12)] px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--accent-strong)]">
              FEATURED AUTHOR
            </span>
            <span className="rounded-full bg-[rgba(123,151,117,0.12)] px-3 py-1 text-[11px] font-semibold tracking-[0.05em] text-[var(--leaf-deep)]">
              {booth.participationType}
            </span>
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-[1.75rem] leading-[1.18] tracking-[-0.03em]">{booth.authorName ?? booth.name}</h3>
            <p className="mt-1 text-sm leading-7 text-[var(--foreground-soft)]">{booth.subtitle}</p>
          </div>
          <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/72 p-3">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[var(--foreground-soft)]">
              <BookOpenText size={14} />
              BOOK
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)]">{booth.bookTitle}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{booth.bookDescription ?? booth.description}</p>
          </div>
          <div className="rounded-[1.2rem] bg-[linear-gradient(135deg,rgba(234,183,190,0.16),rgba(255,255,255,0.72))] p-3">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-[var(--foreground-soft)]">
              <Quote size={14} />
              AUTHOR NOTE
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{booth.authorMessage ?? booth.description}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

const featureIdeas = [
  {
    title: "작가별 상세 페이지",
    body: "작가 인터뷰, 출간 도서, 대표 문장, 현장 사진을 한 페이지에 담아 방문 전에도 미리 둘러볼 수 있게 합니다.",
  },
  {
    title: "책 찜하기 / 관심작가 저장",
    body: "방문객이 마음에 드는 책과 작가를 저장하고, 행사장에서 다시 찾아가기 쉽게 동선을 연결합니다.",
  },
  {
    title: "현장 일정 알림",
    body: "사인회, 낭독, 버스킹 시작 전 알림을 보내면 체류 시간이 자연스럽게 늘어납니다.",
  },
  {
    title: "아카이브 갤러리",
    body: "문장, 사진, 스탬프 기록을 모아 축제 종료 후에도 다시 볼 수 있는 전시형 갤러리를 만듭니다.",
  },
];

export function AuthorShowcaseSection({ settings }: { settings: EventSettings }) {
  const featuredBooths = settings.booths
    .filter((booth) => booth.authorName || booth.bookTitle)
    .sort((a, b) => a.order - b.order);

  return (
    <section className="section-card paper-stack soft-pattern rounded-[1.9rem] p-5">
      <SectionHeader
        eyebrow="Authors & Books"
        title="작가 소개와 책 소개를 한눈에"
        description="작가의 분위기와 책의 결이 바로 보이도록, 소개 글을 짧고 선명한 카드 구조로 다시 정리했습니다."
      />
      <div className="mt-5 grid gap-4">
        {featuredBooths.map((booth) => (
          <AuthorFeatureCard key={booth.id} booth={booth} />
        ))}
      </div>
      <div className="mt-5 rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,255,255,0.74)] p-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-[0.02em] text-[var(--foreground)]">
          <Sparkles size={16} className="text-[var(--accent-strong)]" />
          추가하면 좋은 기능
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {featureIdeas.map((idea) => (
            <div key={idea.title} className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,251,245,0.88)] p-4">
              <p className="text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">{idea.title}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{idea.body}</p>
            </div>
          ))}
        </div>
        <Link href="/booths" className="festival-button festival-button--paper mt-4 sm:w-fit sm:px-5">
          작가 소개 전체 보기
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
