import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

// 관리자 목록 조회 (SUPER_ADMIN만)
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN']);

    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    const message = error instanceof Error ? error.message : '관리자 목록 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 403 });
  }
}

// 관리자 생성 (SUPER_ADMIN만)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN']);
    const body = await request.json();

    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ success: false, error: '이메일, 이름, 비밀번호는 필수입니다.' }, { status: 400 });
    }

    const validRoles = ['ADMIN', 'MODERATOR'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: '유효하지 않은 역할입니다.' }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: '이미 등록된 이메일입니다.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newAdmin = await prisma.adminUser.create({
      data: {
        email,
        name,
        passwordHash,
        role: role || 'ADMIN',
        isActive: true,
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_ADMIN',
      target: 'admin_user',
      targetId: newAdmin.id,
      details: { email, name, role: role || 'ADMIN' },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '관리자 생성 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
