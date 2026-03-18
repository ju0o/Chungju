import { NextResponse } from 'next/server';
import { ensureUserSession, getUserSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ success: false, error: '세션이 없습니다.' }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: session });
  } catch {
    return NextResponse.json({ success: false, error: '세션 확인 실패' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await ensureUserSession();
    return NextResponse.json({ success: true, data: session });
  } catch {
    return NextResponse.json({ success: false, error: '세션 생성 실패' }, { status: 500 });
  }
}
