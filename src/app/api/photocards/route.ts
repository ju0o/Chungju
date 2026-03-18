import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession, requireAdmin, logAudit } from '@/lib/auth';

// 포토카드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId');
    const my = searchParams.get('my') === 'true';

    if (my) {
      // 내 포토카드 보관함
      const userSession = await getUserSession();
      if (!userSession) {
        return NextResponse.json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
      }

      const userPhotocards = await prisma.userPhotocard.findMany({
        where: { userId: userSession.userId },
        include: {
          photocard: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              rarity: true,
              conditionType: true,
            },
          },
        },
        orderBy: { acquiredAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: userPhotocards });
    }

    // 전체 포토카드 목록 (공개)
    const where: Record<string, unknown> = { isPublic: true };
    if (festivalId) where.festivalId = festivalId;

    const photocards = await prisma.photocard.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, data: photocards });
  } catch {
    return NextResponse.json({ success: false, error: '포토카드 조회 실패' }, { status: 500 });
  }
}

// 포토카드 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();

    const {
      festivalId, name, description, imageUrl, rarity,
      conditionType, conditionValue, isPublic, maxIssuance, sortOrder,
    } = body;

    if (!festivalId || !name || !description || !imageUrl || !conditionType) {
      return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const photocard = await prisma.photocard.create({
      data: {
        festivalId,
        name,
        description,
        imageUrl,
        rarity: rarity || 'COMMON',
        conditionType,
        conditionValue: conditionValue || {},
        isPublic: isPublic ?? true,
        maxIssuance: maxIssuance ?? null,
        sortOrder: sortOrder ?? 0,
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_PHOTOCARD',
      target: 'photocard',
      targetId: photocard.id,
      details: { name, rarity },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: photocard }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '포토카드 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
