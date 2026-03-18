import { NextResponse } from 'next/server';
import { adminLogout } from '@/lib/auth';

export async function POST() {
  try {
    await adminLogout();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: '로그아웃에 실패했습니다.' }, { status: 500 });
  }
}
