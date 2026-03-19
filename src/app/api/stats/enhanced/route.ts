import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET: 강화된 통계 대시보드 (관리자)
export async function GET() {
  try {
    await requireAdmin(['SUPER_ADMIN', 'ADMIN']);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 기본 카운트
    const [totalUsers, totalScans, totalReviews, todayScans, todayReviews] = await Promise.all([
      prisma.user.count(),
      prisma.stampScan.count(),
      prisma.review.count(),
      prisma.stampScan.count({ where: { scannedAt: { gte: todayStart } } }),
      prisma.review.count({ where: { createdAt: { gte: todayStart } } }),
    ]);

    // 시간대별 스캔 (오늘)
    const hourlyScans = await prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT EXTRACT(HOUR FROM scanned_at) as hour, COUNT(*) as count
      FROM stamp_scans
      WHERE scanned_at >= ${todayStart}
      GROUP BY hour
      ORDER BY hour
    `;

    // 부스별 스캔 랭킹
    const boothRanking = await prisma.stampScan.groupBy({
      by: ['qrCodeId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const qrCodes = await prisma.boothQrCode.findMany({
      where: { id: { in: boothRanking.map((r) => r.qrCodeId) } },
      include: { booth: { select: { name: true } } },
    });

    const boothScanRanking = boothRanking.map((r) => {
      const qr = qrCodes.find((q) => q.id === r.qrCodeId);
      return { boothName: qr?.booth.name ?? '알 수 없음', scanCount: r._count.id };
    });

    // 일별 방문자 추이 (최근 7일)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyVisitors = await prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
      SELECT DATE(last_seen) as day, COUNT(*) as count
      FROM active_visitors
      WHERE last_seen >= ${sevenDaysAgo}
      GROUP BY day
      ORDER BY day
    `;

    // 부스별 혼잡도 현황
    const crowdStatuses = await prisma.boothCrowdStatus.findMany({
      include: { booth: { select: { name: true } } },
    });

    // 퀴즈 참여율
    const totalQuizzes = await prisma.quiz.count({ where: { isActive: true } });
    const totalQuizSubmissions = await prisma.quizSubmission.count();
    const correctQuizSubmissions = await prisma.quizSubmission.count({ where: { isCorrect: true } });

    // 현재 접속자
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeNow = await prisma.activeVisitor.count({ where: { lastSeen: { gte: fiveMinAgo } } });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalScans,
        totalReviews,
        todayScans,
        todayReviews,
        activeNow,
        hourlyScans: hourlyScans.map((h) => ({ hour: Number(h.hour), count: Number(h.count) })),
        boothScanRanking,
        dailyVisitors: dailyVisitors.map((d) => ({ day: String(d.day), count: Number(d.count) })),
        crowdStatuses: crowdStatuses.map((c) => ({ boothName: c.booth.name, level: c.level, waitMin: c.waitMin })),
        quiz: { total: totalQuizzes, submissions: totalQuizSubmissions, correct: correctQuizSubmissions },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '통계 조회 실패' }, { status: 500 });
  }
}
