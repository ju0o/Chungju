import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: 리더보드 (스탬프 수, 후기 수 기준)
export async function GET() {
  try {
    // 스탬프 탑 10
    const stampLeaders = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        _count: { select: { stampScans: true, reviews: true } },
      },
      orderBy: { stampScans: { _count: 'desc' } },
      take: 10,
    });

    // 후기 탑 10
    const reviewLeaders = await prisma.user.findMany({
      where: { reviews: { some: { status: 'APPROVED' } } },
      select: {
        id: true,
        nickname: true,
        _count: { select: { reviews: { where: { status: 'APPROVED' } } } },
      },
      orderBy: { reviews: { _count: 'desc' } },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        stampRanking: stampLeaders.map((u, i) => ({
          rank: i + 1,
          nickname: u.nickname,
          stampCount: u._count.stampScans,
          reviewCount: u._count.reviews,
        })),
        reviewRanking: reviewLeaders.map((u, i) => ({
          rank: i + 1,
          nickname: u.nickname,
          reviewCount: u._count.reviews,
        })),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: '랭킹 조회 실패' }, { status: 500 });
  }
}
