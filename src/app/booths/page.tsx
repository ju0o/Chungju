import { PaperLabel } from "@/components/CollageOrnaments";
import prisma from "@/lib/prisma";
import { BoothListClient } from "@/components/BoothListClient";

export const dynamic = "force-dynamic";

export default async function BoothsPage() {
  const booths = await prisma.booth.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { reviews: true } },
    },
  });

  const categories = [...new Set(booths.map(b => b.category))];

  const boothData = booths.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category,
    description: b.description,
    location: b.location,
    operatingHours: b.operatingHours,
    imageUrl: b.imageUrl,
    reviewCount: b._count.reviews,
  }));

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
      <BoothListClient booths={boothData} categories={categories} />
    </main>
  );
}
