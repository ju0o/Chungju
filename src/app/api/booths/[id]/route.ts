import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// 부스 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booth = await prisma.booth.findUnique({
      where: { id },
      include: {
        festival: { select: { id: true, name: true } },
        qrCode: true,
        reviews: {
          where: { status: 'APPROVED' },
          include: { user: { select: { nickname: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!booth) {
      return NextResponse.json({ success: false, error: '부스를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 평균 평점 계산
    const ratingResult = await prisma.review.aggregate({
      where: { boothId: id, status: 'APPROVED' },
      _avg: { rating: true },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...booth,
        averageRating: ratingResult._avg.rating || 0,
        approvedReviewCount: ratingResult._count,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: '부스 조회 실패' }, { status: 500 });
  }
}

// 부스 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await params;
    const body = await request.json();

    const before = await prisma.booth.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: '부스를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatableFields = [
      'name', 'description', 'category', 'location', 'operatingHours',
      'imageUrl', 'contactInfo', 'mapX', 'mapY', 'isActive', 'sortOrder', 'metadata',
    ];

    const data: Record<string, unknown> = {};
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const booth = await prisma.booth.update({ where: { id }, data });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'UPDATE_BOOTH',
      target: 'booth',
      targetId: id,
      details: { before, after: booth },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: booth });
  } catch (error) {
    const message = error instanceof Error ? error.message : '부스 수정 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 부스 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN']);
    const { id } = await params;

    await prisma.booth.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'DELETE_BOOTH',
      target: 'booth',
      targetId: id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '부스 삭제 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
