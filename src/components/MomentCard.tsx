import Image from "next/image";
import { Camera, Flower2 } from "lucide-react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { reportMoment } from "@/lib/api";
import { MomentEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function MomentCard({ moment }: { moment: MomentEntry }) {
  return (
    <article className="section-card overflow-hidden rounded-[1.5rem]">
      {moment.imageUrl ? (
        <div className="relative h-52 w-full">
          <Image src={moment.imageUrl} alt={moment.text} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="soft-pattern flex h-28 items-end justify-between px-4 py-4">
          <PaperLabel text="텍스트 기록" tone="petal" />
          <Flower2 size={18} className="text-[var(--leaf-deep)]" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{moment.nickname}</p>
            <p className="text-xs text-[var(--foreground-soft)]">{formatDate(moment.createdAt)}</p>
          </div>
          <Camera size={16} className="text-[var(--foreground-soft)]" />
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--foreground)]">{moment.text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {moment.hashtags.map((tag) => (
            <span key={tag} className="rounded-full bg-[rgba(123,151,117,0.12)] px-3 py-1 text-xs text-[var(--leaf-deep)]">
              #{tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const reason = window.prompt("신고 사유를 입력해주세요.", "부적절한 이미지/문장") ?? "기타";
            reportMoment(moment.id, reason);
          }}
          className="mt-3 rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs text-[var(--foreground-soft)]"
        >
          신고
        </button>
      </div>
    </article>
  );
}
