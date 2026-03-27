import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserSession, requireAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await ensureUserSession();
    const body = await request.json();
    const bookTitle = String(body?.bookTitle ?? "").trim();
    const authorName = String(body?.authorName ?? "").trim();
    const contact = String(body?.contact ?? "").trim();
    const boothIdRaw = String(body?.boothId ?? "").trim();
    const boothId = boothIdRaw.length > 0 ? boothIdRaw : null;

    if (!bookTitle || !contact) {
      return NextResponse.json({ success: false, error: "도서명과 연락처를 입력해주세요." }, { status: 400 });
    }
    if (contact.length < 6) {
      return NextResponse.json({ success: false, error: "연락처 형식이 올바르지 않습니다." }, { status: 400 });
    }

    const alert = await prisma.bookStockAlert.create({
      data: { boothId, bookTitle, authorName: authorName || null, contact },
    });

    return NextResponse.json({ success: true, data: alert }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알림 신청 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(["SUPER_ADMIN", "ADMIN", "MODERATOR"]);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "30");

    const [items, total] = await Promise.all([
      prisma.bookStockAlert.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.bookStockAlert.count(),
    ]);
    return NextResponse.json({ success: true, data: items, total, page, pageSize });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알림 목록 조회 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin(["SUPER_ADMIN", "ADMIN", "MODERATOR"]);
    const body = await request.json();
    const id = String(body?.id ?? "").trim();
    const status = String(body?.status ?? "").trim();
    const note = typeof body?.note === "string" ? body.note : undefined;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id와 status가 필요합니다." }, { status: 400 });
    }

    const allowed = new Set(["PENDING", "CONTACTED", "DONE", "CANCELED"]);
    if (!allowed.has(status)) {
      return NextResponse.json({ success: false, error: "유효하지 않은 상태값입니다." }, { status: 400 });
    }

    const updated = await prisma.bookStockAlert.update({
      where: { id },
      data: {
        status,
        ...(note !== undefined ? { note } : {}),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알림 상태 변경 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
