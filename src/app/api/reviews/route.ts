import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureUserSession, requireAdmin } from '@/lib/auth';

// 후기 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boothId = searchParams.get('boothId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    // 관리자는 모든 상태 조회 가능
    try {
      await requireAdmin();
      if (status) where.status = status;
    } catch {
      where.status = 'APPROVED';
    }

    if (boothId) where.boothId = boothId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, nickname: true } },
          booth: { select: { id: true, name: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: reviews,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return NextResponse.json({ success: false, error: '후기 목록 조회 실패' }, { status: 500 });
  }
}

// 후기 작성
export async function POST(request: NextRequest) {
  try {
    const userSession = await ensureUserSession();
    const body = await request.json();
    const { boothId, content, rating, imageUrls } = body;

    if (!boothId || !content) {
      return NextResponse.json({ success: false, error: '부스와 후기 내용을 입력해주세요.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: '평점은 1~5 사이여야 합니다.' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ success: false, error: '후기는 500자 이내로 작성해주세요.' }, { status: 400 });
    }

    // 부스 존재 확인
    const booth = await prisma.booth.findUnique({ where: { id: boothId } });
    if (!booth) {
      return NextResponse.json({ success: false, error: '존재하지 않는 부스입니다.' }, { status: 404 });
    }

    // 중복 후기 확인 (같은 사용자가 같은 부스에 30분 내 작성 방지)
    const recentReview = await prisma.review.findFirst({
      where: {
        userId: userSession.userId,
        boothId,
        createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
      },
    });

    if (recentReview) {
      return NextResponse.json({ success: false, error: '30분 이내에 같은 부스에 중복 후기를 작성할 수 없습니다.' }, { status: 429 });
    }

    // 이미지 URL 검증 (최대 5개)
    const validImageUrls = Array.isArray(imageUrls)
      ? imageUrls.filter((url: string) => typeof url === 'string').slice(0, 5)
      : [];

    const review = await prisma.review.create({
      data: {
        userId: userSession.userId,
        boothId,
        content: content.trim(),
        rating: Math.round(rating),
        imageUrls: validImageUrls,
      },
      include: {
        user: { select: { nickname: true } },
        booth: { select: { name: true } },
      },
    });

    // 후기 작성 시 포토카드 지급 확인
    const photocards = await prisma.photocard.findMany({
      where: {
        festivalId: booth.festivalId,
        conditionType: 'REVIEW_WRITE',
        isPublic: true,
      },
    });

    for (const card of photocards) {
      const alreadyOwned = await prisma.userPhotocard.findUnique({
        where: { userId_photocardId: { userId: userSession.userId, photocardId: card.id } },
      });
      if (!alreadyOwned && (card.maxIssuance === null || card.issuedCount < card.maxIssuance)) {
        await prisma.userPhotocard.create({
          data: { userId: userSession.userId, photocardId: card.id },
        });
        await prisma.photocard.update({
          where: { id: card.id },
          data: { issuedCount: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '후기 작성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
