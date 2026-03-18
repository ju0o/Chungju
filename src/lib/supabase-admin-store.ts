import { supabaseAdmin, hasServerSupabase } from "@/lib/supabase-admin";
import { AdminAccessCode, AdminAuditLog, AdminSession } from "@/lib/types";

export async function persistAdminAccessCode(record: AdminAccessCode) {
  if (!hasServerSupabase() || !supabaseAdmin) return;
  await supabaseAdmin.from("admin_access_codes").upsert({
    id: record.id,
    code_hash: record.codeHash,
    role: record.role,
    status: record.status,
    label: record.label,
    expires_at: record.expiresAt,
    created_at: record.createdAt,
    created_by: record.createdBy,
    revoked_at: record.revokedAt,
    revoked_by: record.revokedBy,
  });
}

export async function persistAdminSession(record: AdminSession) {
  if (!hasServerSupabase() || !supabaseAdmin) return;
  await supabaseAdmin.from("admin_sessions").upsert({
    id: record.id,
    access_code_id: record.accessCodeId,
    role: record.role,
    session_token_hash: record.sessionTokenHash,
    issued_at: record.issuedAt,
    expires_at: record.expiresAt,
    last_seen_at: record.lastSeenAt,
    is_active: record.isActive,
  });
}

export async function deactivateAdminSession(id: string) {
  if (!hasServerSupabase() || !supabaseAdmin) return;
  await supabaseAdmin.from("admin_sessions").update({ is_active: false }).eq("id", id);
}

export async function persistAdminAuditLog(record: AdminAuditLog) {
  if (!hasServerSupabase() || !supabaseAdmin) return;
  await supabaseAdmin.from("admin_audit_logs").insert({
    id: record.id,
    admin_session_id: record.adminSessionId,
    admin_role: record.adminRole,
    action_type: record.actionType,
    resource_type: record.resourceType,
    resource_id: record.resourceId,
    before_json: record.before,
    after_json: record.after,
    created_at: record.createdAt,
  });
}

export async function persistPageView(params: { pathname: string; guestId?: string | null; createdAt: string }) {
  if (!hasServerSupabase() || !supabaseAdmin) return;
  await supabaseAdmin.from("site_visit_stats").insert({
    id: `${params.pathname}-${Date.now()}`,
    pathname: params.pathname,
    guest_id: params.guestId,
    visited_at: params.createdAt,
    hour_bucket: params.createdAt.slice(0, 13),
  });
}
