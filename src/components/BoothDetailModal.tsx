"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { BoothProfile } from "@/lib/types";

export function BoothDetailModal({
  booth,
  onClose,
}: {
  booth: BoothProfile;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-[rgba(35,28,22,0.54)] p-4 sm:items-center sm:justify-center">
      <div className="section-card w-full max-w-xl rounded-[1.8rem] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">BOOTH DETAIL</p>
            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-[2rem] leading-[1.15] tracking-[-0.03em]">{booth.name}</h3>
            <p className="mt-1 text-sm text-[var(--foreground-soft)]">{booth.authorName ? `작가 · ${booth.authorName}` : booth.subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--line)] p-2 text-[var(--foreground-soft)]">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-[150px_1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.2rem] border border-[var(--line)] bg-white/70">
            {booth.imageUrl ? (
              <Image src={booth.imageUrl} alt={`${booth.bookTitle} 표지`} fill className="object-cover" unoptimized />
            ) : (
              <div className="quote-text flex h-full items-end p-4 text-xl">{booth.bookTitle}</div>
            )}
          </div>
          <div className="grid gap-3">
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/75 p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">책 소개</p>
              <p className="mt-2 text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">{booth.bookTitle}</p>
              <p className="body-copy mt-2 whitespace-pre-line text-sm text-[var(--foreground-soft)]">{booth.bookDescription ?? booth.description}</p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/75 p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">작가 소개</p>
              <p className="body-copy mt-2 whitespace-pre-line text-sm text-[var(--foreground-soft)]">{booth.authorMessage ?? booth.description}</p>
            </div>
            <div className="grid gap-1 text-sm text-[var(--foreground)]">
              <p>부스 위치: {booth.mapLabel ?? "관리자에서 설정 가능"}</p>
              <p>현장 참여 방식: {booth.participationType}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {booth.snsLink || booth.link ? (
            <Link href={booth.snsLink ?? booth.link ?? "#"} target="_blank" className="festival-button festival-button--paper">
              작가 링크 보기
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
