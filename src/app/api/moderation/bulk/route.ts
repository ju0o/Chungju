import { NextResponse } from "next/server";
import { logAdminAction, requireAdminRole } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";

export async function POST(request: Request) {
  const session = await requireAdminRole(["super_admin", "content_manager", "field_moderator"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payload = await request.json();
  if (payload.target === "guestbooks") {
    memoryStore.guestbooks = memoryStore.guestbooks.map((item) => ({ ...item, hidden: Boolean(payload.hidden) }));
  }
  if (payload.target === "moments") {
    memoryStore.moments = memoryStore.moments.map((item) => ({ ...item, hidden: Boolean(payload.hidden) }));
  }
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "bulk_moderate",
    resourceType: payload.target,
    resourceId: "bulk",
    after: payload,
  });
  return NextResponse.json({ ok: true });
}
