import Link from "next/link";
import { AdminRole } from "@/lib/types";
import { ROLE_LABELS, ROLE_TABS } from "@/lib/constants";

const routeMap = {
  overview: "/admin",
  settings: "/admin/settings",
  landing: "/admin/landing",
  programs: "/admin/programs",
  stamps: "/admin/stamps",
  qr: "/admin/qr",
  booths: "/admin/booths",
  quotes: "/admin/quotes",
  cards: "/admin/cards",
  content: "/admin/content",
  status: "/admin/status",
  access: "/admin/access",
  logs: "/admin/logs",
} as const;

const labelMap = {
  overview: "개요",
  settings: "기본 설정",
  landing: "랜딩",
  programs: "프로그램",
  stamps: "스탬프",
  qr: "QR",
  booths: "부스",
  quotes: "문장",
  cards: "카드",
  content: "콘텐츠",
  status: "상태",
  access: "접근",
  logs: "로그",
} as const;

export function AdminRouteNav({ role, pathname }: { role: AdminRole; pathname: string }) {
  return (
    <nav className="section-card rounded-[1.5rem] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">{ROLE_LABELS[role]}</p>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {ROLE_TABS[role].map((tab) => (
          <Link
            key={tab}
            href={routeMap[tab]}
            className={`rounded-full px-4 py-2 text-xs whitespace-nowrap ${pathname === routeMap[tab] ? "bg-[var(--foreground)] text-white" : "border border-[var(--line)] bg-white/70"}`}
          >
            {labelMap[tab]}
          </Link>
        ))}
      </div>
    </nav>
  );
}
