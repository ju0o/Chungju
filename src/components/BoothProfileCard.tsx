"use client";

import Image from "next/image";
import Link from "next/link";
import { BookHeart, BookOpenText, Flower2, Heart, MessageCircle, Pin } from "lucide-react";
import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { BoothProfile } from "@/lib/types";

export function BoothProfileCard({ booth }: { booth: BoothProfile }) {
  const { interests, upsertInterests } = useFestivalSession();
  const authorName = booth.authorName ?? "";
  const boothSaved = interests.favoriteBoothIds.includes(booth.id);
  const authorSaved = authorName ? interests.favoriteAuthorNames.includes(authorName) : false;

  return (
    <article className="section-card paper-stack soft-pattern relative overflow-hidden rounded-[1.75rem]">
      <CollageOrnaments className="opacity-70" />
      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <PaperLabel text={booth.subtitle} tone="petal" />
          <PaperLabel text={booth.isOnsite ? "현장 상주" : "위탁 참여"} tone="leaf" />
          {booth.bookPrice ? <PaperLabel text={booth.bookPrice} /> : null}
        </div>
        <h2 className="mt-2 font-[family-name:var(--font-heading)] text-[2.1rem] leading-[1.18] tracking-[-0.03em]">{booth.name}</h2>
        {booth.authorName ? <p className="mt-2 text-sm tracking-[0.01em] text-[var(--foreground-soft)]">작가 · {booth.authorName}</p> : null}
        <p className="body-copy mt-3 text-sm text-[var(--foreground-soft)]">{booth.description}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              upsertInterests({
                ...interests,
                favoriteBoothIds: boothSaved
                  ? interests.favoriteBoothIds.filter((id) => id !== booth.id)
                  : [...interests.favoriteBoothIds, booth.id],
              })
            }
            className={`festival-button text-sm ${boothSaved ? "festival-button--primary" : "festival-button--paper"}`}
          >
            <BookHeart size={16} />
            {boothSaved ? "책 찜 저장됨" : "책 찜하기"}
          </button>
          {authorName ? (
            <button
              type="button"
              onClick={() =>
                upsertInterests({
                  ...interests,
                  favoriteAuthorNames: authorSaved
                    ? interests.favoriteAuthorNames.filter((name) => name !== authorName)
                    : [...interests.favoriteAuthorNames, authorName],
                })
              }
              className={`festival-button text-sm ${authorSaved ? "festival-button--primary" : "festival-button--paper"}`}
            >
              <Heart size={16} />
              {authorSaved ? "관심 작가 저장됨" : "관심 작가 저장"}
            </button>
          ) : null}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/75 p-3">
            {booth.imageUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem] border border-[rgba(94,86,72,0.08)] bg-[rgba(255,255,255,0.64)]">
                <Image src={booth.imageUrl} alt={`${booth.bookTitle} 표지`} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="soft-pattern quote-text flex aspect-[4/5] items-end rounded-[1.1rem] p-4 text-2xl">
                {booth.bookTitle}
              </div>
            )}
            <div className="mt-3 grid gap-2 text-sm text-[var(--foreground)]">
              <p className="flex items-center gap-2"><BookOpenText size={14} /> 책 제목: {booth.bookTitle}</p>
              <p className="flex items-center gap-2"><Flower2 size={14} /> 참여 방식: {booth.participationType}</p>
              <p className="flex items-center gap-2"><Pin size={14} /> 재고: {booth.bookStock ?? 0}권</p>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-[1.3rem] border border-[var(--line)] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]">대표 문장</p>
              <blockquote className="quote-text mt-3 text-[1.06rem] leading-8">“{booth.favoriteQuote ?? booth.quote}”</blockquote>
            </div>
            <div className="rounded-[1.3rem] border border-[var(--line)] bg-white/70 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-soft)]">작가의 말</p>
              <p className="body-copy mt-3 text-sm text-[var(--foreground-soft)]">{booth.authorMessage ?? booth.description}</p>
            </div>
            <div className="grid gap-3 text-sm text-[var(--foreground)]">
              <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,251,245,0.78)] p-4">
                <p className="flex items-center gap-2 font-medium"><MessageCircle size={14} /> 책 소개</p>
                <p className="body-copy mt-2 text-[var(--foreground-soft)]">{booth.bookDescription ?? booth.description}</p>
              </div>
              <p className="flex items-center gap-2"><Pin size={14} /> 위탁 여부: {booth.isConsignment ? "예" : "아니오"}</p>
            </div>
            {booth.snsLink || booth.link ? (
              <Link href={booth.snsLink ?? booth.link ?? "#"} target="_blank" className="festival-button festival-button--paper">
                작가 SNS 보기
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
