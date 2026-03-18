import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// 축제 상세 조회
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const festival = await prisma.festival.findUnique({
      where: { id },
      include: {
        booths: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        stampCampaigns: { where: { isActive: true } },
        rewards: { where: { isActive: true } },
        _count: { select: { booths: true, photocards: true } },
      },
    });

    if (!festival) {
      return NextResponse.json({ success: false, error: '축제를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: festival });
  } catch {
    return NextResponse.json({ success: false, error: '축제 조회 실패' }, { status: 500 });
  }
}

// 축제 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await params;
    const body = await request.json();

    const before = await prisma.festival.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: '축제를 찾을 수 없습니다.' }, { status: 404 });
    }

    const updatableFields = [
      'name', 'description', 'startDate', 'endDate', 'location', 'address',
      'heroImageUrl', 'mapImageUrl', 'isActive', 'notices', 'faqs', 'schedule', 'metadata',
    ];

    const data: Record<string, unknown> = {};
    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          data[field] = new Date(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    const festival = await prisma.festival.update({
      where: { id },
      data,
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'UPDATE_FESTIVAL',
      target: 'festival',
      targetId: id,
      details: { before, after: festival },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: festival });
  } catch (error) {
    const message = error instanceof Error ? error.message : '축제 수정 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 축제 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN']);
    const { id } = await params;

    await prisma.festival.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'DELETE_FESTIVAL',
      target: 'festival',
      targetId: id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '축제 삭제 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
