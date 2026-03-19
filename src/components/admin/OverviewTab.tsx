import { ROLE_LABELS } from "@/lib/constants";
import { AdminAuditLog, AdminRole } from "@/lib/types";

export function OverviewTab({
  role,
  summary,
}: {
  role: AdminRole;
  summary: {
    siteMode: string;
    totalPageViews: number;
    uniqueGuestCount: number;
    routeHits: Record<string, number>;
    hourlyHits: Record<string, number>;
    guestbookCount: number;
    momentCount: number;
    stampCompletionCount: number;
    hiddenQueueCount: number;
    programCount: number;
    boothCount: number;
    recentLogs: AdminAuditLog[];
  };
}) {
  return (
    <section className="section-card rounded-[1.75rem] p-5 text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {ROLE_LABELS[role]}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--line)] p-4">누적 페이지뷰: {summary.totalPageViews}</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">추정 방문 게스트: {summary.uniqueGuestCount}</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">사이트 상태: {summary.siteMode}</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">오늘 프로그램: {summary.programCount}개</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">방명록 수: {summary.guestbookCount}</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">순간 기록 수: {summary.momentCount}</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">스탬프 완료 수: {summary.stampCompletionCount}</div>
        <div className="rounded-2xl border border-[var(--line)] p-4">숨김 대기 건수: {summary.hiddenQueueCount}</div>
      </div>
      <div className="mt-4 rounded-2xl border border-[var(--line)] p-4">
        <p className="text-sm font-semibold">시간대별 방문</p>
        <div className="mt-4 flex h-36 items-end gap-2">
          {Array.from({ length: 24 }, (_, hour) => hour.toString().padStart(2, "0")).map((hour) => {
            const value = summary.hourlyHits[hour] ?? 0;
            const max = Math.max(...Object.values(summary.hourlyHits), 1);
            return (
              <div key={hour} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-xl bg-[linear-gradient(180deg,var(--accent),var(--foreground))]"
                  style={{ height: `${Math.max((value / max) * 100, 6)}%` }}
                />
                <span className="text-[10px] text-[var(--muted)]">{hour}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-[var(--line)] p-4">
        <p className="text-sm font-semibold">라우트별 방문</p>
        <div className="mt-3 grid gap-2 text-xs text-[var(--muted)]">
          {Object.entries(summary.routeHits).map(([route, count]) => (
            <div key={route} className="flex items-center justify-between gap-2">
              <span>{route}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-[var(--line)] p-4">
        <p className="text-sm font-semibold">최근 변경 로그</p>
        <div className="mt-3 grid gap-2 text-xs text-[var(--muted)]">
          {summary.recentLogs.length > 0 ? (
            summary.recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-2">
                <span>{log.resourceType}</span>
                <span>{log.actionType}</span>
                <span>{new Date(log.createdAt).toLocaleString("ko-KR")}</span>
              </div>
            ))
          ) : (
            <p>아직 기록된 로그가 없습니다.</p>
          )}
        </div>
      </div>
    </section>
  );
}
