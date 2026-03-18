import { NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";

export async function GET() {
  const session = await requireAdminRole(["super_admin", "content_manager"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const logs = session.role === "super_admin" ? memoryStore.adminAuditLogs : memoryStore.adminAuditLogs.slice(0, 20);
  return NextResponse.json(logs);
}
