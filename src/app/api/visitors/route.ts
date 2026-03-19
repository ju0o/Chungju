import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST: heartbeat (세션 ID 기반)
export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'sessionId 필요' }, { status: 400 });
    }

    await prisma.activeVisitor.upsert({
      where: { sessionId },
      update: { lastSeen: new Date() },
      create: { sessionId },
    });

    // 5분 이내 heartbeat = 현재 접속자
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeCount = await prisma.activeVisitor.count({
      where: { lastSeen: { gte: fiveMinAgo } },
    });

    // 오늘 총 방문자
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.activeVisitor.count({
      where: { lastSeen: { gte: todayStart } },
    });

    return NextResponse.json({
      success: true,
      data: { activeNow: activeCount, todayTotal: todayCount },
    });
  } catch {
    return NextResponse.json({ success: false, error: '카운터 오류' }, { status: 500 });
  }
}

// GET: 현재 접속자 수 조회
export async function GET() {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeCount = await prisma.activeVisitor.count({
      where: { lastSeen: { gte: fiveMinAgo } },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.activeVisitor.count({
      where: { lastSeen: { gte: todayStart } },
    });

    return NextResponse.json({
      success: true,
      data: { activeNow: activeCount, todayTotal: todayCount },
    });
  } catch {
    return NextResponse.json({ success: false, error: '카운터 오류' }, { status: 500 });
  }
}
