"use client";

import Link from "next/link";

const ITEMS = [
  { href: "/admin/dashboard", label: "대시보드", icon: "📌" },
  { href: "/admin/festival", label: "축제 정보", icon: "🎪" },
  { href: "/admin/booths", label: "부스 관리", icon: "🏪" },
  { href: "/admin/qr", label: "QR 관리", icon: "📱" },
  { href: "/admin/reviews", label: "후기 관리", icon: "💬" },
  { href: "/admin/stats", label: "상세 통계", icon: "📈" },
  { href: "/admin/publishing-consultations", label: "출판 상담 신청", icon: "📚" },
];

export function AdminQuickSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="section-card h-fit rounded-2xl p-4 lg:sticky lg:top-4">
      <p className="text-lg font-bold">출판/축제 관리자</p>
      <p className="mt-1 text-xs text-[var(--foreground-soft)]">Document Management</p>
      <div className="mt-4 grid gap-1">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${pathname === item.href ? "bg-[#e7ebf5] text-[#1d2740]" : "hover:bg-white/90"}`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
