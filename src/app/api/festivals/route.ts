import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// 축제 목록 조회 (관리자)
export async function GET() {
  try {
    const festivals = await prisma.festival.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { booths: true, stampCampaigns: true } },
      },
    });

    return NextResponse.json({ success: true, data: festivals });
  } catch {
    return NextResponse.json({ success: false, error: '축제 목록 조회 실패' }, { status: 500 });
  }
}

// 축제 생성
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();

    const { name, description, startDate, endDate, location, address, heroImageUrl, notices, faqs, schedule } = body;

    if (!name || !description || !startDate || !endDate || !location) {
      return NextResponse.json({ success: false, error: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const festival = await prisma.festival.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        address: address || null,
        heroImageUrl: heroImageUrl || null,
        notices: notices || [],
        faqs: faqs || [],
        schedule: schedule || [],
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_FESTIVAL',
      target: 'festival',
      targetId: festival.id,
      details: { name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: festival }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '축제 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
