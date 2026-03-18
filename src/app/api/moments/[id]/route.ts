import { NextResponse } from "next/server";
import { logAdminAction, requireAdminRole } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminRole(["super_admin", "content_manager", "field_moderator"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const payload = await request.json();
  const before = memoryStore.moments.find((item) => item.id === id);
  if (hasServerSupabase() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("public_moments")
      .update({
        hidden: payload.hidden,
        is_public: payload.isPublic,
      })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      return NextResponse.json({
        id: data.id,
        guestId: data.guest_id,
        nickname: data.nickname,
        text: data.text,
        hashtags: data.hashtags ?? [],
        isPublic: data.is_public,
        createdAt: data.created_at,
        imageUrl: data.image_url,
        hidden: data.hidden,
      });
    }
  }
  const index = memoryStore.moments.findIndex((item) => item.id === id);
  if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  memoryStore.moments[index] = { ...memoryStore.moments[index], ...payload };
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "moderate",
    resourceType: "public_moments",
    resourceId: id,
    before,
    after: memoryStore.moments[index],
  });
  return NextResponse.json(memoryStore.moments[index]);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminRole(["super_admin", "content_manager", "field_moderator"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  if (hasServerSupabase() && supabaseAdmin) {
    await supabaseAdmin.from("public_moments").delete().eq("id", id);
    logAdminAction({
      adminSessionId: session.id,
      adminRole: session.role,
      actionType: "delete",
      resourceType: "public_moments",
      resourceId: id,
    });
    return NextResponse.json({ ok: true });
  }
  memoryStore.moments = memoryStore.moments.filter((item) => item.id !== id);
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "delete",
    resourceType: "public_moments",
    resourceId: id,
  });
  return NextResponse.json({ ok: true });
}
