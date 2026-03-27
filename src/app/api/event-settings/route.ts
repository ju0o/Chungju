import { NextResponse } from "next/server";
import { logAdminAction, requireAdminRole } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("site_settings").select("*").limit(1).maybeSingle();
    if (data) return NextResponse.json(data);
  }
  return NextResponse.json(memoryStore.settings);
}

export async function PATCH(request: Request) {
  const session = await requireAdminRole(["super_admin", "content_manager"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payload = await request.json();
  const before = memoryStore.settings;
  if (hasServerSupabase() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ id: "default", ...memoryStore.settings, ...payload })
      .select()
      .single();
    if (!error && data) return NextResponse.json(data);
  }
  memoryStore.settings = { ...memoryStore.settings, ...payload };
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "update",
    resourceType: "site_settings",
    resourceId: "default",
    before,
    after: memoryStore.settings,
  });
  return NextResponse.json(memoryStore.settings);
}
