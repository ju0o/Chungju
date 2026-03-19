import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// GET: 공지 목록 (공개)
export async function GET() {
  try {
    const now = new Date();
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { startAt: null, endAt: null },
          { startAt: { lte: now }, endAt: null },
          { startAt: null, endAt: { gte: now } },
          { startAt: { lte: now }, endAt: { gte: now } },
        ],
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ success: true, data: announcements });
  } catch {
    return NextResponse.json({ success: false, error: '공지 조회 실패' }, { status: 500 });
  }
}

// POST: 공지 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { title, content, type, priority, startAt, endAt } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ success: false, error: '제목과 내용은 필수입니다.' }, { status: 400 });
    }

    const validTypes = ['banner', 'popup', 'urgent'];
    const safeType = validTypes.includes(type) ? type : 'banner';

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: safeType,
        priority: priority ?? 0,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_ANNOUNCEMENT',
      target: 'announcement',
      targetId: announcement.id,
      details: { title, type: safeType },
    });

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '생성 실패' }, { status: 500 });
  }
}
