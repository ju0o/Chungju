"use client";

import Link from "next/link";

export default function StampTourPage() {
  return (
    <main className="app-shell grid gap-4 py-6">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-6 text-center">
        <div className="text-4xl mb-3">🎫</div>
        <h1 className="section-title">스탬프 투어</h1>
        <p className="body-copy mt-2 text-sm text-[var(--foreground-soft)]">
          부스를 방문하고 QR을 스캔하면 스탬프를 모을 수 있어요!
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/stamp/scan">
          <div className="section-card rounded-[1.5rem] p-6 text-center transition-transform hover:scale-[1.01]">
            <div className="text-3xl mb-2">📱</div>
            <h2 className="font-semibold mb-1">QR 스캔</h2>
            <p className="text-sm text-[var(--foreground-soft)]">부스의 QR 코드를 스캔하여 스탬프를 받으세요</p>
          </div>
        </Link>

        <Link href="/stamp/status">
          <div className="section-card rounded-[1.5rem] p-6 text-center transition-transform hover:scale-[1.01]">
            <div className="text-3xl mb-2">🏆</div>
            <h2 className="font-semibold mb-1">내 스탬프</h2>
            <p className="text-sm text-[var(--foreground-soft)]">모은 스탬프 현황과 보상을 확인하세요</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
