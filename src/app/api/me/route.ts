import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession } from '@/lib/auth';

// 마이페이지 데이터 조회
export async function GET() {
  try {
    const userSession = await getUserSession();
    if (!userSession) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const [user, stampProgress, reviews, photocards] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userSession.userId },
        select: { id: true, nickname: true, createdAt: true },
      }),
      prisma.userStampProgress.findMany({
        where: { userId: userSession.userId },
        include: {
          stampCampaign: {
            select: { name: true, requiredStamps: true },
          },
        },
      }),
      prisma.review.findMany({
        where: { userId: userSession.userId },
        include: { booth: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.userPhotocard.findMany({
        where: { userId: userSession.userId },
        include: {
          photocard: {
            select: { id: true, name: true, imageUrl: true, rarity: true, description: true },
          },
        },
        orderBy: { acquiredAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user,
        stampProgress,
        reviews,
        photocards,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: '데이터 조회 실패' }, { status: 500 });
  }
}

// 닉네임 변경
export async function PATCH(request: NextRequest) {
  try {
    const userSession = await getUserSession();
    if (!userSession) {
      return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { nickname } = body;

    if (!nickname || typeof nickname !== 'string' || nickname.length > 20) {
      return NextResponse.json({ success: false, error: '닉네임은 1~20자여야 합니다.' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userSession.userId },
      data: { nickname: nickname.trim() },
      select: { id: true, nickname: true },
    });

    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: '닉네임 변경 실패' }, { status: 500 });
  }
}
