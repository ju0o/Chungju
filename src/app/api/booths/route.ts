import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';
import { createOrRefreshQrCode } from '@/lib/qr-stamp';

// 부스 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = {};
    if (festivalId) where.festivalId = festivalId;
    if (category) where.category = category;

    // 관리자가 아니면 활성 부스만
    try {
      await requireAdmin();
    } catch {
      where.isActive = true;
    }

    const [booths, total] = await Promise.all([
      prisma.booth.findMany({
        where,
        include: {
          qrCode: { select: { isActive: true, scanCount: true } },
          _count: { select: { reviews: true } },
          festival: { select: { name: true } },
        },
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booth.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: booths,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    return NextResponse.json({ success: false, error: '부스 목록 조회 실패' }, { status: 500 });
  }
}

// 부스 생성
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();

    const { festivalId, name, description, category, location, operatingHours, imageUrl, contactInfo, mapX, mapY, sortOrder } = body;

    if (!festivalId || !name || !description || !location) {
      return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const booth = await prisma.booth.create({
      data: {
        festivalId,
        name,
        description,
        category: category || '일반',
        location,
        operatingHours: operatingHours || null,
        imageUrl: imageUrl || null,
        contactInfo: contactInfo || null,
        mapX: mapX ?? null,
        mapY: mapY ?? null,
        sortOrder: sortOrder ?? 0,
      },
    });

    // QR 코드 자동 생성
    await createOrRefreshQrCode(booth.id);

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_BOOTH',
      target: 'booth',
      targetId: booth.id,
      details: { name, festivalId },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: booth }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '부스 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
