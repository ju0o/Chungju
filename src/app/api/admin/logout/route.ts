import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { clearAdminSession, getAdminSession, logAdminAction } from "@/lib/admin-auth";
import { deactivateAdminSession, persistAdminAuditLog } from "@/lib/supabase-admin-store";
import { memoryStore } from "@/lib/server-store";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    logAdminAction({
      adminSessionId: session.id,
      adminRole: session.role,
      actionType: "logout",
      resourceType: "admin_sessions",
      resourceId: session.id,
    });
    await deactivateAdminSession(session.id);
    await persistAdminAuditLog(memoryStore.adminAuditLogs[0]);
  }
  await clearAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
