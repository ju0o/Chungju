import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// 후기 상태 변경 (숨김/승인/삭제)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']);
    const { id } = await params;
    const body = await request.json();
    const { status, adminNote } = body;

    const validStatuses = ['PENDING', 'APPROVED', 'HIDDEN', 'DELETED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 상태입니다.' }, { status: 400 });
    }

    const before = await prisma.review.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ success: false, error: '후기를 찾을 수 없습니다.' }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (status) data.status = status;
    if (adminNote !== undefined) data.adminNote = adminNote;

    const review = await prisma.review.update({ where: { id }, data });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'UPDATE_REVIEW',
      target: 'review',
      targetId: id,
      details: { before: { status: before.status }, after: { status: review.status }, adminNote },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    const message = error instanceof Error ? error.message : '후기 수정 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 후기 삭제 (관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await params;

    await prisma.review.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'DELETE_REVIEW',
      target: 'review',
      targetId: id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '후기 삭제 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
