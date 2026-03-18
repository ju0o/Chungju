import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_HOURS } from "@/lib/constants";
import { createAdminSession, findAccessCode, logAdminAction } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";
import { persistAdminAuditLog, persistAdminSession } from "@/lib/supabase-admin-store";

export async function POST(request: Request) {
  const payload = await request.json();
  const attemptKey = request.headers.get("x-forwarded-for") ?? "admin";
  const failed = memoryStore.adminFailedAttempts[attemptKey] ?? 0;
  if (failed >= 5) {
    return NextResponse.json({ ok: false, error: "잠시 후 다시 시도해주세요." }, { status: 429 });
  }
  const accessCode = findAccessCode(payload.password ?? "");
  if (!accessCode) {
    memoryStore.adminFailedAttempts[attemptKey] = failed + 1;
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  memoryStore.adminFailedAttempts[attemptKey] = 0;
  const { token, session } = createAdminSession(accessCode);
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "login",
    resourceType: "admin_sessions",
    resourceId: session.id,
    after: { role: session.role },
  });
  await persistAdminSession(session);
  await persistAdminAuditLog(memoryStore.adminAuditLogs[0]);
  const response = NextResponse.json({ ok: true, role: accessCode.role, sessionId: session.id });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * ADMIN_SESSION_HOURS,
  });
  return response;
}
