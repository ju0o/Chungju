import { NextRequest, NextResponse } from 'next/server';
import { adminLogin, logAudit } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const { token, session } = await adminLogin(email, password);

    await logAudit({
      adminUserId: session.adminUserId,
      action: 'ADMIN_LOGIN',
      target: 'admin_session',
      details: { email: session.email, role: session.role },
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
