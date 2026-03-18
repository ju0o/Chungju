import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { MomentEntry } from "@/lib/types";

export function ArchiveGalleryPreview({ moments }: { moments: MomentEntry[] }) {
  if (!moments.length) return null;

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <SectionHeader
        eyebrow="Archive Gallery"
        title="현장 아카이브 갤러리"
        description="방문객이 남긴 사진과 텍스트를 한눈에 훑을 수 있는 가벼운 전시 섹션입니다."
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {moments.map((moment) => (
          <article key={moment.id} className="overflow-hidden rounded-[1.45rem] border border-[var(--line)] bg-[rgba(255,251,244,0.82)]">
            {moment.imageUrl ? (
              <div className="relative aspect-[16/11]">
                <Image src={moment.imageUrl} alt={`${moment.nickname}의 기록 이미지`} fill className="object-cover" unoptimized />
              </div>
            ) : null}
            <div className="p-4">
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground-soft)]">{moment.nickname}</p>
              <p className="body-copy mt-2 text-sm text-[var(--foreground)]">{moment.text}</p>
              {moment.hashtags.length ? <p className="mt-2 text-xs text-[var(--foreground-soft)]">#{moment.hashtags.join(" #")}</p> : null}
            </div>
          </article>
        ))}
      </div>
      <Link href="/moments" className="festival-button festival-button--paper mt-4 sm:w-fit sm:px-5">
        전체 아카이브 보기
      </Link>
    </section>
  );
}
