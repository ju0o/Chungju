import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';

// GET: 퀴즈 전체 목록 (관리자)
export async function GET() {
  try {
    await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const quizzes = await prisma.quiz.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { submissions: true } } },
    });
    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '조회 실패' }, { status: 500 });
  }
}

// POST: 퀴즈 생성 (관리자)
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();

    const festival = await prisma.festival.findFirst({ where: { isActive: true } });
    if (!festival) {
      return NextResponse.json({ success: false, error: '활성 축제 없음' }, { status: 400 });
    }

    const { question, choices, correctIndex, explanation, rewardType, rewardValue, sortOrder } = body;

    if (!question || !choices || correctIndex === undefined) {
      return NextResponse.json({ success: false, error: '필수 항목 누락' }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        festivalId: festival.id,
        question,
        choices,
        correctIndex,
        explanation,
        rewardType,
        rewardValue,
        sortOrder: sortOrder ?? 0,
      },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'CREATE_QUIZ',
      target: 'quiz',
      targetId: quiz.id,
      details: { question },
    });

    return NextResponse.json({ success: true, data: quiz }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '생성 실패' }, { status: 500 });
  }
}
