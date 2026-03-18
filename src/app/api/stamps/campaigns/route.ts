import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession, requireAdmin, logAudit } from '@/lib/auth';

// 스탬프 캠페인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId');

    const where: Record<string, unknown> = {};
    if (festivalId) where.festivalId = festivalId;

    try {
      await requireAdmin();
    } catch {
      where.isActive = true;
    }

    const campaigns = await prisma.stampCampaign.findMany({
      where,
      include: {
        _count: { select: { stampScans: true, progress: true } },
        rewards: { where: { isActive: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: campaigns });
  } catch {
    return NextResponse.json({ success: false, error: '캠페인 목록 조회 실패' }, { status: 500 });
  }
}

// 스탬프 캠페인 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();

    const { festivalId, name, description, requiredStamps, startDate, endDate, allowDuplicateScan, rewardDescription } = body;

    if (!festivalId || !name || !description || !requiredStamps || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const campaign = await prisma.stampCampaign.create({
      data: {
        festivalId,
        name,
        description,
        requiredStamps: parseInt(requiredStamps),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allowDuplicateScan: allowDuplicateScan ?? false,
        rewardDescription: rewardDescription || null,
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_CAMPAIGN',
      target: 'stamp_campaign',
      targetId: campaign.id,
      details: { name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '캠페인 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
