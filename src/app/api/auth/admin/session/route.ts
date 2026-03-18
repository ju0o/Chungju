import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: '인증되지 않았습니다.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: session });
  } catch {
    return NextResponse.json({ success: false, error: '세션 확인에 실패했습니다.' }, { status: 500 });
  }
}
