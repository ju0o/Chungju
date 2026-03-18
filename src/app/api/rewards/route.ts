import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// 보상 목록 조회
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

    const rewards = await prisma.reward.findMany({
      where,
      include: {
        stampCampaign: { select: { id: true, name: true } },
      },
      orderBy: { requiredStamps: 'asc' },
    });

    return NextResponse.json({ success: true, data: rewards });
  } catch {
    return NextResponse.json({ success: false, error: '보상 목록 조회 실패' }, { status: 500 });
  }
}

// 보상 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();

    const { festivalId, stampCampaignId, name, description, requiredStamps, imageUrl, totalQuantity } = body;

    if (!festivalId || !name || !description || !requiredStamps) {
      return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const reward = await prisma.reward.create({
      data: {
        festivalId,
        stampCampaignId: stampCampaignId || null,
        name,
        description,
        requiredStamps: parseInt(requiredStamps),
        imageUrl: imageUrl || null,
        totalQuantity: totalQuantity ?? null,
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_REWARD',
      target: 'reward',
      targetId: reward.id,
      details: { name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: reward }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '보상 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
