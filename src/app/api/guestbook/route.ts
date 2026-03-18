import { NextResponse } from "next/server";
import { GUESTBOOK_LIMIT, RATE_LIMIT_MS } from "@/lib/constants";
import { memoryStore } from "@/lib/server-store";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";
import { containsBadWords } from "@/lib/utils";

export async function GET() {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("public_guestbooks").select("*").order("created_at", { ascending: false });
    if (data) {
      return NextResponse.json(
        data.map((item) => ({
          id: item.id,
          guestId: item.guest_id,
          nickname: item.nickname,
          message: item.message,
          mood: item.mood,
          isPublic: item.is_public,
          createdAt: item.created_at,
          hidden: item.hidden,
          reported: item.reported,
          approved: item.approved,
        })),
      );
    }
  }
  return NextResponse.json(
    [...memoryStore.guestbooks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload.message || payload.message.length > GUESTBOOK_LIMIT) {
    return NextResponse.json({ error: "메시지 길이를 확인하세요." }, { status: 400 });
  }
  if (containsBadWords(payload.message)) {
    return NextResponse.json({ error: "부적절한 표현은 등록할 수 없습니다." }, { status: 400 });
  }

  const key = payload.guestId ?? request.headers.get("x-forwarded-for") ?? "anonymous";
  const lastPostedAt = memoryStore.rateLimit[key] ?? 0;
  if (Date.now() - lastPostedAt < RATE_LIMIT_MS) {
    return NextResponse.json({ error: "잠시 후 다시 작성해주세요." }, { status: 429 });
  }

  memoryStore.rateLimit[key] = Date.now();
  if (hasServerSupabase() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("public_guestbooks")
      .insert({
        guest_id: payload.guestId,
        nickname: payload.nickname || "게스트",
        message: payload.message,
        mood: payload.mood,
        is_public: Boolean(payload.isPublic),
      })
      .select()
      .single();
    if (!error && data) {
      return NextResponse.json({
        id: data.id,
        guestId: data.guest_id,
        nickname: data.nickname,
        message: data.message,
        mood: data.mood,
        isPublic: data.is_public,
        createdAt: data.created_at,
        hidden: data.hidden,
      });
    }
  }

  const entry = {
    id: `gb-${Date.now()}`,
    guestId: payload.guestId,
    nickname: payload.nickname || "게스트",
    message: payload.message,
    mood: payload.mood,
    isPublic: Boolean(payload.isPublic),
    createdAt: new Date().toISOString(),
    approved: !Boolean(payload.isPublic) ? false : false,
  };
  memoryStore.guestbooks.unshift(entry);
  return NextResponse.json(entry);
}
