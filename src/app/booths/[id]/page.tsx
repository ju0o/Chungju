import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BoothReviewSection } from '@/components/booth/BoothReviewSection';

export const dynamic = 'force-dynamic';

export default async function BoothDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const booth = await prisma.booth.findUnique({
    where: { id },
    include: {
      festival: { select: { id: true, name: true } },
      qrCode: { select: { isActive: true } },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { nickname: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!booth) return notFound();

  const ratingResult = await prisma.review.aggregate({
    where: { boothId: id, status: 'APPROVED' },
    _avg: { rating: true },
    _count: true,
  });

  const avgRating = ratingResult._avg.rating || 0;
  const reviewCount = ratingResult._count;

  return (
    <main className="app-shell grid gap-4">
      {/* 부스 이미지/헤더 */}
      <section className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-b from-[var(--accent-leaf)]/20 to-[var(--paper)]">
        {booth.imageUrl ? (
          <img src={booth.imageUrl} alt={booth.name} className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[var(--accent-coral)]/20 to-[var(--accent-petal)]/30 text-6xl">🏪</div>
        )}
        <div className="p-5">
          <Link href="/booths" className="mb-2 inline-block text-xs text-[var(--accent-coral)]">← 부스 목록으로</Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--accent-leaf)]/15 px-2 py-0.5 text-xs text-[var(--accent-leaf)]">{booth.category}</span>
            {booth.qrCode?.isActive && (
              <span className="rounded-full bg-[var(--accent-coral)]/15 px-2 py-0.5 text-xs text-[var(--accent-coral)]">🎫 스탬프 가능</span>
            )}
          </div>
          <h1 className="section-title mt-2 text-xl font-bold">{booth.name}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-[var(--foreground-soft)]">
            <span>⭐ {avgRating.toFixed(1)} ({reviewCount}개)</span>
            <span>📍 {booth.location}</span>
          </div>
        </div>
      </section>

      {/* 상세 정보 */}
      <section className="section-card rounded-[1.75rem] p-5">
        <h2 className="font-semibold mb-3">부스 소개</h2>
        <p className="body-copy text-sm text-[var(--foreground-soft)] whitespace-pre-wrap">{booth.description}</p>

        <div className="mt-4 grid gap-2 text-sm">
          {booth.operatingHours && (
            <div className="flex items-center gap-2 rounded-xl bg-white/70 p-3 border border-[var(--line)]">
              <span>🕐</span> <span>운영시간: {booth.operatingHours}</span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl bg-white/70 p-3 border border-[var(--line)]">
            <span>📍</span> <span>위치: {booth.location}</span>
          </div>
          {booth.contactInfo && (
            <div className="flex items-center gap-2 rounded-xl bg-white/70 p-3 border border-[var(--line)]">
              <span>📞</span> <span>연락처: {booth.contactInfo}</span>
            </div>
          )}
        </div>
      </section>

      {/* 후기 섹션 */}
      <BoothReviewSection boothId={booth.id} boothName={booth.name} reviews={booth.reviews.map(r => ({
        ...r,
        imageUrls: Array.isArray(r.imageUrls) ? r.imageUrls as string[] : [],
        createdAt: r.createdAt.toISOString(),
      }))} />
    </main>
  );
}
