import { PaperLabel } from "@/components/CollageOrnaments";
import { reportGuestbook } from "@/lib/api";
import { GuestbookEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function TodayLineWall({ entries }: { entries: GuestbookEntry[] }) {
  return (
    <div className="columns-1 gap-3 sm:columns-2">
      {entries.map((entry, index) => (
        <article
          key={entry.id}
          className={`section-card mb-3 break-inside-avoid rounded-[1.5rem] p-4 ${index % 3 === 0 ? "bg-[rgba(255,250,244,0.98)]" : index % 3 === 1 ? "bg-[rgba(248,252,246,0.98)]" : "bg-[rgba(252,247,242,0.98)]"}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <PaperLabel text={entry.mood} tone={index % 2 === 0 ? "petal" : "leaf"} />
            <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--foreground-soft)]">sentence note</span>
          </div>
          <p className="quote-text text-[1.28rem] leading-9 text-[var(--foreground)]">“{entry.message}”</p>
          <div className="mt-4 flex items-center justify-between text-xs text-[var(--foreground-soft)]">
            <span>{entry.nickname}</span>
            <span>{formatDate(entry.createdAt)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const reason = window.prompt("신고 사유를 입력해주세요.", "부적절한 표현") ?? "기타";
              reportGuestbook(entry.id, reason);
            }}
            className="mt-3 rounded-full border border-[var(--line)] bg-white/70 px-3 py-2 text-xs text-[var(--foreground-soft)]"
          >
            신고
          </button>
        </article>
      ))}
    </div>
  );
}
