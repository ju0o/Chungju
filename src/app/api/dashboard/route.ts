import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// 통계 대시보드 데이터
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const scanWhere = festivalId ? { qrCode: { booth: { festivalId } } } : undefined;
    const festivalWhere = festivalId ? { festivalId } : undefined;

    const [
      totalUsers,
      totalScans,
      totalReviews,
      totalCompletedCampaigns,
      totalPhotocardIssued,
      todayScans,
      todayReviews,
      boothScanRanking,
      pendingReviews,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.stampScan.count({ where: scanWhere }),
      prisma.review.count({ where: festivalId ? { booth: { festivalId } } : undefined }),
      prisma.userStampProgress.count({ where: { isCompleted: true, ...festivalWhere } }),
      prisma.userPhotocard.count({ where: festivalId ? { photocard: { festivalId } } : undefined }),
      prisma.stampScan.count({
        where: { scannedAt: { gte: todayStart }, ...(scanWhere ?? {}) },
      }),
      prisma.review.count({
        where: {
          createdAt: { gte: todayStart },
          ...(festivalId ? { booth: { festivalId } } : {}),
        },
      }),
      prisma.boothQrCode.findMany({
        where: festivalId ? { booth: { festivalId } } : undefined,
        select: {
          scanCount: true,
          booth: { select: { name: true } },
        },
        orderBy: { scanCount: 'desc' },
        take: 10,
      }),
      prisma.review.count({ where: { status: 'PENDING' } }),
    ]);

    // 시간대별 스캔 수 (오늘)
    const hourlyScans = await prisma.stampScan.groupBy({
      by: ['scannedAt'],
      where: { scannedAt: { gte: todayStart } },
    });

    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourlyMap.set(h, 0);
    hourlyScans.forEach((scan) => {
      const hour = new Date(scan.scannedAt).getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalScans,
        totalReviews,
        totalCompletedCampaigns,
        totalPhotocardIssued,
        todayScans,
        todayReviews,
        pendingReviews,
        boothScanRanking: boothScanRanking.map((b) => ({
          boothName: b.booth.name,
          scanCount: b.scanCount,
        })),
        hourlyScans: Array.from(hourlyMap.entries()).map(([hour, count]) => ({ hour, count })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '통계 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
