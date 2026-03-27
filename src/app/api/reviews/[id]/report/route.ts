import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserSession } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureUserSession();
    const { id } = await params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ success: false, error: "후기를 찾을 수 없습니다." }, { status: 404 });
    }

    const prev = review.adminNote ?? "";
    const marker = "[USER_REPORT]";
    const next = prev.includes(marker) ? prev : `${marker} ${prev}`.trim();
    await prisma.review.update({ where: { id }, data: { adminNote: next, status: "PENDING" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "신고 처리 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

