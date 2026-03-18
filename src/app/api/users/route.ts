import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// 사용자 참여 현황 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '30');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (search) {
      where.nickname = { contains: search, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              stampScans: true,
              reviews: true,
              userPhotocards: true,
            },
          },
          stampProgress: {
            select: {
              totalStamps: true,
              isCompleted: true,
              stampCampaign: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '사용자 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
