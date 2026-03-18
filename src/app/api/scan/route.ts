import { NextRequest, NextResponse } from 'next/server';
import { processQrScan } from '@/lib/qr-stamp';
import { ensureUserSession } from '@/lib/auth';

// QR 스캔 처리
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 QR 토큰입니다.' },
        { status: 400 }
      );
    }

    // 사용자 세션 확인/생성
    const userSession = await ensureUserSession();

    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    const result = await processQrScan(token, userSession.userId, ipAddress, userAgent);

    return NextResponse.json({
      success: result.success,
      data: result,
    }, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('QR 스캔 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '스탬프 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
