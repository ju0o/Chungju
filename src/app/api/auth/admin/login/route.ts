import { NextRequest, NextResponse } from 'next/server';
import { adminLogin, adminLoginWithEntryCode, logAudit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, entryCode } = body;

    let loginResult: Awaited<ReturnType<typeof adminLogin>>;
    if (typeof entryCode === 'string' && entryCode.trim().length > 0) {
      loginResult = await adminLoginWithEntryCode(entryCode.trim());
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
          { status: 400 }
        );
      }
      loginResult = await adminLogin(email, password);
    }

    const { token, session } = loginResult;

    await logAudit({
      adminUserId: session.adminUserId,
      action: 'ADMIN_LOGIN',
      target: 'admin_session',
      details: { email: session.email, role: session.role, byEntryCode: Boolean(entryCode) },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    });

    const response = NextResponse.json({ success: true, data: session });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}
