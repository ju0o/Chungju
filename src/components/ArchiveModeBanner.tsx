import Link from "next/link";
import { PaperLabel } from "@/components/CollageOrnaments";

export function ArchiveModeBanner({ message }: { message: string }) {
  return (
    <section className="section-card paper-stack soft-pattern rounded-[1.75rem] border-[var(--accent)]/40 p-5">
      <div className="flex flex-wrap gap-2">
        <PaperLabel text="Archive Mode" tone="petal" />
        <PaperLabel text="#8 율량마르쉐 애착꽃시장" tone="leaf" />
      </div>
      <h2 className="section-title mt-4">오늘의 축제는 종료되었어요</h2>
      <p className="mt-3 max-w-[28ch] text-sm leading-7 text-[var(--foreground-soft)]">{message}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/guestbook" className="festival-button festival-button--paper">
          남겨진 한 줄 보기
        </Link>
        <Link href="/moments" className="festival-button festival-button--paper">
          순간 기록 모아보기
        </Link>
      </div>
    </section>
  );
}
