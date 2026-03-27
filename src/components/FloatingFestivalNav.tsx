"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpenText, Heart, House, Share2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "홈", icon: House },
  { href: "/books", label: "책", icon: BookOpenText },
  { href: "/discover", label: "탐색", icon: SlidersHorizontal },
  { href: "/saved", label: "찜", icon: Heart },
];

export function FloatingFestivalNav() {
  const pathname = usePathname();
  if (!["/", "/books", "/discover", "/saved", "/reviews", "/consult"].includes(pathname)) return null;

  const handleShare = async () => {
    const shareData = {
      title: "율량마르쉐#8 작가 및 책 부스",
      text: "율량마르쉐#8 작가와 책 부스를 확인해보세요.",
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
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[3.2rem] flex-col items-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition",
                "text-[var(--foreground-soft)] hover:bg-[rgba(123,151,117,0.16)] hover:text-[var(--leaf-deep)]",
                pathname === item.href ? "bg-[rgba(123,151,117,0.16)] text-[var(--leaf-deep)]" : "",
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
