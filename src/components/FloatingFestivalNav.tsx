"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, MapPinned, Share2, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "홈", icon: House },
  { href: "/festival", label: "축제", icon: MapPinned },
  { href: "/stamp/status", label: "스탬프", icon: Star },
  { href: "/reviews", label: "후기", icon: BookOpen },
  { href: "/my", label: "MY", icon: User },
];

export function FloatingFestivalNav() {
  const pathname = usePathname();

  const handleShare = async () => {
    const shareData = {
      title: "#8 율량마르쉐 애착꽃시장",
      text: "살아있던 적이 없는 꽃을 팝니다 — 청주 애착꽃시장에 놀러오세요!",
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다!");
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50 mx-auto flex max-w-md justify-center px-4 md:max-w-lg">
      <div className="flex w-full items-center justify-between rounded-[999px] border border-[var(--line)] bg-[rgba(255,250,244,0.84)] px-3 py-2 shadow-[0_16px_30px_rgba(84,66,50,0.12)] backdrop-blur">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[3.2rem] flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition",
                active ? "bg-[rgba(123,151,117,0.16)] text-[var(--leaf-deep)]" : "text-[var(--foreground-soft)]",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleShare}
          className="flex min-w-[3.2rem] flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium text-[var(--foreground-soft)] transition hover:text-[var(--accent-strong)]"
        >
          <Share2 size={18} />
          공유
        </button>
      </div>
    </nav>
  );
}
