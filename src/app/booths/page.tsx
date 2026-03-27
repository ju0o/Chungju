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

  const readMetaText = (meta: unknown, key: string) => {
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";
    const value = (meta as Record<string, unknown>)[key];
    return typeof value === "string" ? value : "";
  };

  const boothData = booths.map(b => ({
    id: b.id,
    name: b.name,
    category: b.category,
    description: b.description,
    authorName: readMetaText(b.metadata, "authorName"),
    bookTitle: readMetaText(b.metadata, "bookTitle"),
    location: b.location,
    operatingHours: b.operatingHours,
    imageUrl: b.imageUrl,
    reviewCount: b._count.reviews,
  }));

  const teamCount = new Set(
    boothData.map((booth) => (booth.authorName?.trim() ? booth.authorName.trim() : booth.name.trim())),
  ).size;
  const bookCount = boothData.filter((booth) => Boolean(booth.bookTitle?.trim())).length;

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Booths" tone="petal" />
          <PaperLabel text={`${teamCount}팀 / ${bookCount}권`} tone="leaf" />
        </div>
        <h1 className="section-title mt-4">작가 / 일반 서적 추천 부스 소개</h1>
        <p className="body-copy mt-3 max-w-[28ch] text-sm text-[var(--foreground-soft)]">
          참여 작가 도서와 일반 서적 추천 부스를 함께 소개합니다. 책 소개, 추천 포인트, 현장 정보를 카드로 확인해보세요.
        </p>
      </section>
      <BoothListClient booths={boothData} categories={categories} />
    </main>
  );
}
