import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

// 내 스탬프 현황 조회
export async function GET(request: NextRequest) {
  try {
    const userSession = await getUserSession();
    if (!userSession) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const progress = await prisma.userStampProgress.findMany({
      where: { userId: userSession.userId },
      include: {
        stampCampaign: {
          select: {
            id: true,
            name: true,
            description: true,
            requiredStamps: true,
            startDate: true,
            endDate: true,
            rewardDescription: true,
          },
        },
      },
    });

    // 각 캠페인별 스캔 기록
    const scans = await prisma.stampScan.findMany({
      where: { userId: userSession.userId },
      include: {
        qrCode: {
          include: {
            booth: { select: { id: true, name: true, category: true, imageUrl: true } },
          },
        },
        stampCampaign: { select: { id: true, name: true } },
      },
      orderBy: { scannedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        progress,
        scans,
        totalStamps: scans.length,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: '스탬프 현황 조회 실패' }, { status: 500 });
  }
}
