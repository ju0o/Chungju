import { NextResponse } from "next/server";
import { logAdminAction, requireAdminRole, revokeAccessCode } from "@/lib/admin-auth";
import { persistAdminAccessCode, persistAdminAuditLog } from "@/lib/supabase-admin-store";
import { memoryStore } from "@/lib/server-store";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminRole(["super_admin"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const revoked = revokeAccessCode(id, session.id);
  if (!revoked) return NextResponse.json({ error: "Not found" }, { status: 404 });
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "revoke",
    resourceType: "admin_access_codes",
    resourceId: revoked.id,
    before: { status: "active" },
    after: { status: "revoked" },
  });
  await persistAdminAccessCode(revoked);
  await persistAdminAuditLog(memoryStore.adminAuditLogs[0]);
  return NextResponse.json({ ok: true });
}
