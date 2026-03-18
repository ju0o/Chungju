import { NextResponse } from "next/server";
import { generateAccessCode, logAdminAction, requireAdminRole } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";
import { persistAdminAccessCode, persistAdminAuditLog } from "@/lib/supabase-admin-store";
import { AdminRole } from "@/lib/types";

export async function GET() {
  const session = await requireAdminRole(["super_admin"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(
    memoryStore.adminAccessCodes.map((item) => ({
      ...item,
      codeHash: undefined,
      preview: undefined,
    })),
  );
}

export async function POST(request: Request) {
  const session = await requireAdminRole(["super_admin"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payload = await request.json();
  const role = payload.role as AdminRole;
  const created = generateAccessCode(role, session.id, payload.label ?? role, payload.expiresAt, Boolean(payload.oneTime));
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "create",
    resourceType: "admin_access_codes",
    resourceId: created.record.id,
    after: { role: created.record.role, label: created.record.label },
  });
  await persistAdminAccessCode(created.record);
  await persistAdminAuditLog(memoryStore.adminAuditLogs[0]);
  return NextResponse.json({
    ...created.record,
    rawCode: created.rawCode,
    codeHash: undefined,
  });
}
