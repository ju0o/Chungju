import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_HOURS, ROLE_TABS } from "@/lib/constants";
import { memoryStore } from "@/lib/server-store";
import { AdminAccessCode, AdminAuditLog, AdminRole, AdminSession } from "@/lib/types";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function secureCompare(a: string, b: string) {
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function createReadableCode(prefix = "FEST") {
  const block = () => randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${new Date().getFullYear()}-${block()}-${block()}`;
}

function seedCode(label: string, role: AdminRole, rawCode: string) {
  if (!rawCode) return;
  const hash = sha256(rawCode);
  if (memoryStore.adminAccessCodes.some((item) => item.codeHash === hash)) return;
  memoryStore.adminAccessCodes.push({
    id: `code-${label}`,
    codeHash: hash,
    role,
    status: "active",
    label,
    createdAt: new Date().toISOString(),
    createdBy: "system",
  });
}

export function ensureSeedAdminCodes() {
  seedCode("super-admin", "super_admin", process.env.ADMIN_SUPER_CODE ?? process.env.ADMIN_PASSWORD ?? "festival-admin");
  seedCode("content-manager", "content_manager", process.env.ADMIN_CONTENT_CODE ?? "festival-content");
  seedCode("field-moderator", "field_moderator", process.env.ADMIN_MODERATOR_CODE ?? "festival-moderator");
}

export function findAccessCode(rawCode: string) {
  ensureSeedAdminCodes();
  const hash = sha256(rawCode);
  return memoryStore.adminAccessCodes.find((item) => item.status === "active" && secureCompare(item.codeHash, hash));
}

export function generateAccessCode(
  role: AdminRole,
  createdBy: string,
  label: string,
  expiresAt?: string,
  oneTime = false,
) {
  ensureSeedAdminCodes();
  const rawCode = createReadableCode(role === "super_admin" ? "SUPER" : role === "content_manager" ? "CONT" : "FIELD");
  const record: AdminAccessCode = {
    id: `code-${Date.now()}`,
    codeHash: sha256(rawCode),
    role,
    status: "active",
    label,
    expiresAt,
    oneTime,
    createdAt: new Date().toISOString(),
    createdBy,
    preview: rawCode,
  };
  memoryStore.adminAccessCodes.unshift(record);
  return { rawCode, record };
}

export function revokeAccessCode(id: string, revokedBy: string) {
  const found = memoryStore.adminAccessCodes.find((item) => item.id === id);
  if (!found) return null;
  found.status = "revoked";
  found.revokedAt = new Date().toISOString();
  found.revokedBy = revokedBy;
  return found;
}

export function createAdminSession(accessCode: AdminAccessCode) {
  const token = randomBytes(24).toString("base64url");
  const tokenHash = sha256(token);
  const session: AdminSession = {
    id: `session-${Date.now()}`,
    accessCodeId: accessCode.id,
    role: accessCode.role,
    sessionTokenHash: tokenHash,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000).toISOString(),
    lastSeenAt: new Date().toISOString(),
    isActive: true,
  };
  memoryStore.adminSessions[tokenHash] = session;
  if (accessCode.oneTime) {
    accessCode.status = "used";
    accessCode.usedAt = new Date().toISOString();
  }
  return { token, session };
}

export async function getAdminSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE_NAME)?.value;
}

export async function getAdminSession() {
  const token = await getAdminSessionToken();
  if (!token) return null;
  const tokenHash = sha256(token);
  const session = memoryStore.adminSessions[tokenHash];
  if (!session || !session.isActive || new Date(session.expiresAt).getTime() < Date.now()) {
    delete memoryStore.adminSessions[tokenHash];
    return null;
  }
  session.lastSeenAt = new Date().toISOString();
  return session;
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdminRole(allowed: AdminRole[]) {
  const session = await getAdminSession();
  return session && allowed.includes(session.role) ? session : null;
}

export function canAccessTab(role: AdminRole, tabKey: string) {
  return ROLE_TABS[role].includes(tabKey as never);
}

export async function clearAdminSession() {
  const token = await getAdminSessionToken();
  if (!token) return;
  const tokenHash = sha256(token);
  delete memoryStore.adminSessions[tokenHash];
}

export function logAdminAction(payload: Omit<AdminAuditLog, "id" | "createdAt">) {
  const log: AdminAuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...payload,
  };
  memoryStore.adminAuditLogs.unshift(log);
  return log;
}
