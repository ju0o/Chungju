import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { memoryStore } from "@/lib/server-store";
import { PublishingConsultation } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));
  const search = (searchParams.get("search") ?? "").trim();
  const format = (searchParams.get("format") ?? "").trim();
  const hasManuscript = (searchParams.get("hasManuscript") ?? "").trim();
  const adminSession = await getAdminSession();
  const isAdmin = Boolean(adminSession);

  try {
    const where: {
      OR?: Array<{
        activityName?: { contains: string; mode: "insensitive" };
        genre?: { contains: string; mode: "insensitive" };
        contact?: { contains: string; mode: "insensitive" };
      }>;
      publishFormat?: string;
      hasManuscript?: string;
    } = {};
    if (search) {
      where.OR = [
        { activityName: { contains: search, mode: "insensitive" } },
        { genre: { contains: search, mode: "insensitive" } },
        { contact: { contains: search, mode: "insensitive" } },
      ];
    }
    if (format === "전자책" || format === "POD") where.publishFormat = format;
    if (hasManuscript === "유" || hasManuscript === "무") where.hasManuscript = hasManuscript;

    const [rows, total] = await Promise.all([
      prisma.publishingConsultation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.publishingConsultation.count({ where }),
    ]);

    const data: PublishingConsultation[] = rows.map((row) => ({
      id: row.id,
      activityName: row.activityName,
      hasManuscript: row.hasManuscript === "무" ? "무" : "유",
      genre: row.genre,
      publishFormat: row.publishFormat === "POD" ? "POD" : "전자책",
      contact: isAdmin ? row.contact : "비공개",
      note: isAdmin ? row.note ?? undefined : undefined,
      createdAt: row.createdAt.toISOString(),
    }));
    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch {
    const filtered = memoryStore.publishingConsultations
      .filter((item) => (format ? item.publishFormat === format : true))
      .filter((item) => (hasManuscript ? item.hasManuscript === hasManuscript : true))
      .filter((item) =>
        search ? `${item.activityName} ${item.genre} ${item.contact}`.toLowerCase().includes(search.toLowerCase()) : true,
      );

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize).map((item) => ({
      ...item,
      contact: isAdmin ? item.contact : "비공개",
      note: isAdmin ? item.note : undefined,
    }));
    return NextResponse.json({
      success: true,
      data: pageItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const activityName = typeof body?.activityName === "string" ? body.activityName.trim() : "";
    const hasManuscript = body?.hasManuscript === "유" ? "유" : body?.hasManuscript === "무" ? "무" : "";
    const genre = typeof body?.genre === "string" ? body.genre.trim() : "";
    const publishFormat = body?.publishFormat === "전자책" ? "전자책" : body?.publishFormat === "POD" ? "POD" : "";
    const contact = typeof body?.contact === "string" ? body.contact.trim() : "";
    const note = typeof body?.note === "string" ? body.note.trim() : "";

    if (!activityName || !hasManuscript || !genre || !publishFormat || !contact) {
      return NextResponse.json({ success: false, error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
    }

    try {
      const created = await prisma.publishingConsultation.create({
        data: {
          activityName,
          hasManuscript,
          genre,
          publishFormat,
          contact,
          note: note || null,
        },
      });

      const data: PublishingConsultation = {
        id: created.id,
        activityName: created.activityName,
        hasManuscript: created.hasManuscript === "무" ? "무" : "유",
        genre: created.genre,
        publishFormat: created.publishFormat === "POD" ? "POD" : "전자책",
        contact: created.contact,
        note: created.note ?? undefined,
        createdAt: created.createdAt.toISOString(),
      };
      return NextResponse.json({ success: true, data }, { status: 201 });
    } catch {
      const entry: PublishingConsultation = {
        id: crypto.randomUUID(),
        activityName,
        hasManuscript,
        genre,
        publishFormat,
        contact,
        note: note || undefined,
        createdAt: new Date().toISOString(),
      };

      memoryStore.publishingConsultations = [entry, ...memoryStore.publishingConsultations].slice(0, 200);
      return NextResponse.json({ success: true, data: entry }, { status: 201 });
    }
  } catch {
    return NextResponse.json({ success: false, error: "신청 저장에 실패했습니다." }, { status: 500 });
  }
}
