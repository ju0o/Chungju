import { cookies } from 'next/headers';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import prisma from './prisma';
import type { AdminRoleType, AdminSessionPayload } from './domain-types';

const SESSION_DURATION_HOURS = 8;

// ─────────────────────── 해싱 ───────────────────────
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ─────────────────────── 관리자 인증 ───────────────────────
export async function adminLogin(email: string, password: string): Promise<{ token: string; session: AdminSessionPayload }> {
  const { compareSync } = await import('bcryptjs');

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.isActive) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const valid = compareSync(password, admin.passwordHash);
  if (!valid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  const token = randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      adminUserId: admin.id,
      tokenHash,
      expiresAt,
    },
  });

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const session: AdminSessionPayload = {
    adminUserId: admin.id,
    role: admin.role as AdminRoleType,
    name: admin.name,
    email: admin.email,
  };

  return { token, session };
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.adminSession.deleteMany({ where: { tokenHash } });
    cookieStore.delete('admin_token');
  }
}

// ─────────────────────── 세션 검증 ───────────────────────
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { adminUser: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.adminSession.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    adminUserId: session.adminUser.id,
    role: session.adminUser.role as AdminRoleType,
    name: session.adminUser.name,
    email: session.adminUser.email,
  };
}

export async function requireAdmin(requiredRoles?: AdminRoleType[]): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('인증이 필요합니다.');
  }
  if (requiredRoles && !requiredRoles.includes(session.role)) {
    throw new Error('권한이 없습니다.');
  }
  return session;
}

// ─────────────────────── 사용자 세션 ───────────────────────
export async function getUserSession(): Promise<{ userId: string; nickname: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  if (!token) return null;

  const user = await prisma.user.findUnique({
    where: { sessionToken: token },
  });

  if (!user) return null;

  return { userId: user.id, nickname: user.nickname };
}

export async function ensureUserSession(): Promise<{ userId: string; nickname: string }> {
  const existing = await getUserSession();
  if (existing) return existing;

  const token = randomBytes(24).toString('hex');
  const user = await prisma.user.create({
    data: {
      nickname: '방문객',
      sessionToken: token,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('user_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30일
    path: '/',
  });

  return { userId: user.id, nickname: user.nickname };
}

// ─────────────────────── 감사로그 ───────────────────────
export async function logAudit(params: {
  adminUserId?: string;
  action: string;
  target: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      adminUserId: params.adminUserId ?? null,
      action: params.action,
      target: params.target,
      targetId: params.targetId ?? null,
      details: (params.details ?? {}) as Record<string, string>,
      ipAddress: params.ipAddress ?? null,
    },
  });
}

// ─────────────────────── 슈퍼관리자 시드 ───────────────────────
export async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return;

  const { hashSync } = await import('bcryptjs');
  await prisma.adminUser.create({
    data: {
      email,
      passwordHash: hashSync(password, 12),
      name: '슈퍼관리자',
      role: 'SUPER_ADMIN',
    },
  });
}
