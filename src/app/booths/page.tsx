import { PaperLabel } from "@/components/CollageOrnaments";
import { SectionHeader } from "@/components/SectionHeader";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BoothsPage() {
  const booths = await prisma.booth.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { reviews: true } },
    },
  });

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Booths" tone="petal" />
          <PaperLabel text="Writers & Market" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">작가 / 문화부스 소개</h1>
        <p className="body-copy mt-3 max-w-[28ch] text-sm text-[var(--foreground-soft)]">
          위탁 판매로 참여하는 작가들의 책, 대표 문장, 작가의 말을 한 장의 전시 카드처럼 소개합니다.
        </p>
      </section>
      <section className="grid gap-3">
        {booths.map((booth) => (
          <Link key={booth.id} href={`/booths/${booth.id}`}>
            <div className="section-card rounded-[1.5rem] p-4 transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                {booth.imageUrl && (
                  <img src={booth.imageUrl} alt={booth.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{booth.name}</h3>
                    <span className="shrink-0 rounded-full bg-[var(--accent-coral)]/10 px-2 py-0.5 text-[10px] text-[var(--accent-coral)]">
                      {booth.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--foreground-soft)] line-clamp-2">{booth.description}</p>
                  <div className="mt-2 flex gap-3 text-xs text-[var(--muted)]">
                    <span>📍 {booth.location}</span>
                    {booth.operatingHours && <span>🕐 {booth.operatingHours}</span>}
                    <span>💬 후기 {booth._count.reviews}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {booths.length === 0 && (
          <div className="section-card rounded-[1.5rem] p-8 text-center text-[var(--foreground-soft)]">
            <p className="text-lg mb-1">🏪</p>
            <p className="text-sm">등록된 부스가 아직 없습니다.</p>
          </div>
        )}
      </section>
    </main>
  );
}
