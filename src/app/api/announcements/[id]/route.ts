import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// PATCH: 공지 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.startAt !== undefined && { startAt: body.startAt ? new Date(body.startAt) : null }),
        ...(body.endAt !== undefined && { endAt: body.endAt ? new Date(body.endAt) : null }),
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'UPDATE_ANNOUNCEMENT',
      target: 'announcement',
      targetId: id,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '수정 실패' }, { status: 500 });
  }
}

// DELETE: 공지 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const { id } = await params;

    await prisma.announcement.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'DELETE_ANNOUNCEMENT',
      target: 'announcement',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '삭제 실패' }, { status: 500 });
  }
}
