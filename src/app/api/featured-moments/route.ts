import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET: 베스트 모먼트 목록
export async function GET() {
  try {
    const featured = await prisma.featuredMoment.findMany({
      orderBy: { pickedAt: 'desc' },
      take: 10,
    });
    return NextResponse.json({ success: true, data: featured });
  } catch {
    return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 });
  }
}

// POST: 베스트 모먼트 선정 (관리자)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { momentId, note } = await request.json();

    if (!momentId) {
      return NextResponse.json({ success: false, error: 'momentId 필요' }, { status: 400 });
    }

    const featured = await prisma.featuredMoment.create({
      data: { momentId, note, pickedBy: admin.adminUserId },
    });

    return NextResponse.json({ success: true, data: featured }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '선정 실패' }, { status: 500 });
  }
}
