import { GuestbookEntry } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { reportGuestbook } from "@/lib/api";

export function GuestbookList({ entries }: { entries: GuestbookEntry[] }) {
  return (
    <div className="grid gap-3">
      {entries.map((entry) => (
        <article key={entry.id} className="section-card rounded-[1.5rem] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{entry.nickname}</p>
              <p className="text-xs text-[var(--muted)]">{formatDate(entry.createdAt)}</p>
            </div>
            <span className="rounded-full bg-[var(--leaf)]/12 px-3 py-1 text-xs text-[var(--leaf)]">
              {entry.mood}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6">{entry.message}</p>
          <button
            type="button"
            onClick={() => {
              const reason = window.prompt("신고 사유를 입력해주세요.", "부적절한 표현") ?? "기타";
              reportGuestbook(entry.id, reason);
            }}
            className="mt-3 rounded-full border border-[var(--line)] px-3 py-2 text-xs text-[var(--muted)]"
          >
            신고
          </button>
        </article>
      ))}
    </div>
  );
}
