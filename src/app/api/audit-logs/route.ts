import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// 감사로그 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const action = searchParams.get('action');
    const target = searchParams.get('target');

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (target) where.target = target;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          adminUser: { select: { name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '감사로그 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
