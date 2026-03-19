import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureUserSession } from '@/lib/auth';

// GET: 퀴즈 목록 (활성화된 것만, 사용자 응답 포함)
export async function GET() {
  try {
    const user = await ensureUserSession();
    const festival = await prisma.festival.findFirst({ where: { isActive: true } });
    if (!festival) {
      return NextResponse.json({ success: true, data: [] });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { festivalId: festival.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        submissions: { where: { userId: user.userId }, select: { chosenIndex: true, isCorrect: true } },
        _count: { select: { submissions: true } },
      },
    });

    const data = quizzes.map((q) => ({
      id: q.id,
      question: q.question,
      choices: q.choices,
      totalSubmissions: q._count.submissions,
      myAnswer: q.submissions[0] ?? null,
      // 정답은 사용자가 답한 후에만 공개
      correctIndex: q.submissions[0] ? q.correctIndex : undefined,
      explanation: q.submissions[0] ? q.explanation : undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '퀴즈 조회 실패' }, { status: 500 });
  }
}

// POST: 퀴즈 답변 제출
export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserSession();
    const { quizId, chosenIndex } = await request.json();

    if (!quizId || chosenIndex === undefined) {
      return NextResponse.json({ success: false, error: 'quizId와 chosenIndex 필요' }, { status: 400 });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz || !quiz.isActive) {
      return NextResponse.json({ success: false, error: '유효하지 않은 퀴즈' }, { status: 404 });
    }

    const existing = await prisma.quizSubmission.findUnique({
      where: { quizId_userId: { quizId, userId: user.userId } },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: '이미 답변했습니다.' }, { status: 409 });
    }

    const isCorrect = chosenIndex === quiz.correctIndex;

    await prisma.quizSubmission.create({
      data: { quizId, userId: user.userId, chosenIndex, isCorrect },
    });

    return NextResponse.json({
      success: true,
      data: {
        isCorrect,
        correctIndex: quiz.correctIndex,
        explanation: quiz.explanation,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '답변 제출 실패' }, { status: 500 });
  }
}
