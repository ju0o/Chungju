import { deleteGuestbook, deleteMoment, updateGuestbook, updateMoment } from "@/lib/api";
import { GuestbookEntry, MomentEntry } from "@/lib/types";
import { useState } from "react";

export function ContentTab({
  guestbooks,
  moments,
  onGuestbooksChange,
  onMomentsChange,
}: {
  guestbooks: GuestbookEntry[];
  moments: MomentEntry[];
  onGuestbooksChange: (next: GuestbookEntry[]) => void;
  onMomentsChange: (next: MomentEntry[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "reported" | "pending">("all");
  const byFilter = <T extends { reported?: boolean; approved?: boolean }>(entry: T) =>
    filter === "reported" ? entry.reported : filter === "pending" ? entry.approved === false : true;
  const filteredGuestbooks = guestbooks.filter((entry) => (entry.message.includes(query) || entry.nickname.includes(query)) && byFilter(entry));
  const filteredMoments = moments.filter((entry) => (entry.text.includes(query) || entry.nickname.includes(query)) && byFilter(entry));

  return (
    <div className="grid gap-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <div className="grid gap-3">
          <input
            className="festival-input"
            placeholder="닉네임/문장 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex gap-2">
            {(["all", "reported", "pending"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-xs ${filter === item ? "bg-[var(--foreground)] text-white" : "border border-[var(--line)]"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="section-card rounded-[1.75rem] p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl">방명록 관리</h2>
        <div className="mt-4 grid gap-3">
          {filteredGuestbooks.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-sm font-semibold">{entry.nickname}</p>
              <p className="mt-2 text-sm">{entry.message}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const moderatorNote = window.prompt("모더레이터 메모를 남겨주세요.", entry.moderatorNote ?? "") ?? "";
                    const updated = await updateGuestbook(entry.id, {
                      approved: true,
                      hidden: false,
                      reported: false,
                      moderatorNote,
                    });
                    onGuestbooksChange(guestbooks.map((item) => (item.id === entry.id ? updated : item)));
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
                >
                  공개 승인
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const updated = await updateGuestbook(entry.id, { hidden: !entry.hidden });
                    onGuestbooksChange(guestbooks.map((item) => (item.id === entry.id ? updated : item)));
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
                >
                  {entry.hidden ? "다시 공개" : "숨김"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteGuestbook(entry.id);
                    onGuestbooksChange(guestbooks.filter((item) => item.id !== entry.id));
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
                >
                  삭제
                </button>
              </div>
              {entry.reportReason ? <p className="mt-2 text-xs text-red-700">신고 사유: {entry.reportReason}</p> : null}
              {entry.moderatorNote ? <p className="mt-1 text-xs text-[var(--muted)]">메모: {entry.moderatorNote}</p> : null}
            </div>
          ))}
        </div>
      </section>
      <section className="section-card rounded-[1.75rem] p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl">순간 기록 관리</h2>
        <div className="mt-4 grid gap-3">
          {filteredMoments.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-[var(--line)] p-4">
              <p className="text-sm font-semibold">{entry.nickname}</p>
              <p className="mt-2 text-sm">{entry.text}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const moderatorNote = window.prompt("모더레이터 메모를 남겨주세요.", entry.moderatorNote ?? "") ?? "";
                    const updated = await updateMoment(entry.id, {
                      approved: true,
                      hidden: false,
                      reported: false,
                      moderatorNote,
                    });
                    onMomentsChange(moments.map((item) => (item.id === entry.id ? updated : item)));
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
                >
                  공개 승인
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const updated = await updateMoment(entry.id, { hidden: !entry.hidden });
                    onMomentsChange(moments.map((item) => (item.id === entry.id ? updated : item)));
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
                >
                  {entry.hidden ? "다시 공개" : "숨김"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteMoment(entry.id);
                    onMomentsChange(moments.filter((item) => item.id !== entry.id));
                  }}
                  className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
                >
                  삭제
                </button>
              </div>
              {entry.reportReason ? <p className="mt-2 text-xs text-red-700">신고 사유: {entry.reportReason}</p> : null}
              {entry.moderatorNote ? <p className="mt-1 text-xs text-[var(--muted)]">메모: {entry.moderatorNote}</p> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
