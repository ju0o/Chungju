import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

// 관리자 수정 (역할 변경, 활성/비활성, 비밀번호 초기화)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN']);
    const { id } = await params;
    const body = await request.json();

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ success: false, error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 자기 자신의 역할은 변경 불가
    if (id === admin.adminUserId && body.role && body.role !== target.role) {
      return NextResponse.json({ success: false, error: '자신의 역할은 변경할 수 없습니다.' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.role) {
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json({ success: false, error: '유효하지 않은 역할입니다.' }, { status: 400 });
      }
      updateData.role = body.role;
    }

    if (typeof body.isActive === 'boolean') {
      // 자기 자신 비활성화 불가
      if (id === admin.adminUserId && !body.isActive) {
        return NextResponse.json({ success: false, error: '자신을 비활성화할 수 없습니다.' }, { status: 400 });
      }
      updateData.isActive = body.isActive;
    }

    if (body.name) {
      updateData.name = body.name;
    }

    if (body.newPassword) {
      updateData.passwordHash = await bcrypt.hash(body.newPassword, 12);
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'UPDATE_ADMIN',
      target: 'admin_user',
      targetId: id,
      details: { changes: Object.keys(updateData) },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : '관리자 수정 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// 관리자 삭제 (SUPER_ADMIN만)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN']);
    const { id } = await params;

    if (id === admin.adminUserId) {
      return NextResponse.json({ success: false, error: '자신의 계정은 삭제할 수 없습니다.' }, { status: 400 });
    }

    await prisma.adminUser.delete({ where: { id } });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'DELETE_ADMIN',
      target: 'admin_user',
      targetId: id,
      details: {},
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '관리자 삭제 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
