import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// GET: 전체 부스 혼잡도 조회 (공개)
export async function GET() {
  try {
    const statuses = await prisma.boothCrowdStatus.findMany({
      include: { booth: { select: { id: true, name: true, location: true } } },
    });
    return NextResponse.json({ success: true, data: statuses });
  } catch {
    return NextResponse.json({ success: false, error: '혼잡도 조회 실패' }, { status: 500 });
  }
}

// PUT: 부스 혼잡도 업데이트 (관리자)
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { boothId, level, waitMin, note } = await request.json();

    if (!boothId || !['LOW', 'MODERATE', 'HIGH'].includes(level)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 입력' }, { status: 400 });
    }

    const status = await prisma.boothCrowdStatus.upsert({
      where: { boothId },
      update: { level, waitMin: waitMin ?? 0, note, updatedBy: admin.adminUserId },
      create: { boothId, level, waitMin: waitMin ?? 0, note, updatedBy: admin.adminUserId },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'UPDATE_CROWD',
      target: 'booth_crowd',
      targetId: boothId,
      details: { level, waitMin },
    });

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '업데이트 실패' }, { status: 500 });
  }
}
