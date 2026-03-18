import {
  AdminAccessCode,
  AdminAuditLog,
  AdminRole,
  EventSettings,
  GeneratedCardSet,
  GuestbookEntry,
  MomentEntry,
  StampPoint,
} from "@/lib/types";

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchEventSettings() {
  return parseJson<EventSettings>(await fetch("/api/event-settings", { cache: "no-store" }));
}

export async function updateEventSettings(payload: Partial<EventSettings>) {
  return parseJson<EventSettings>(
    await fetch("/api/event-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function fetchStampPoints() {
  return parseJson<StampPoint[]>(await fetch("/api/stamps", { cache: "no-store" }));
}

export async function updateStampPoints(payload: StampPoint[]) {
  return parseJson<StampPoint[]>(
    await fetch("/api/stamps", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function createStampLog(payload: { guestId: string; stampId: string }) {
  return parseJson<{ ok: boolean }>(
    await fetch("/api/stamp-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function fetchGuestbooks() {
  return parseJson<GuestbookEntry[]>(await fetch("/api/guestbook", { cache: "no-store" }));
}

export async function createGuestbook(payload: Omit<GuestbookEntry, "id" | "createdAt">) {
  return parseJson<GuestbookEntry>(
    await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateGuestbook(id: string, payload: Partial<GuestbookEntry>) {
  return parseJson<GuestbookEntry>(
    await fetch(`/api/guestbook/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteGuestbook(id: string) {
  return parseJson<{ ok: boolean }>(await fetch(`/api/guestbook/${id}`, { method: "DELETE" }));
}

export async function reportGuestbook(id: string, reason: string) {
  return parseJson<GuestbookEntry>(
    await fetch(`/api/guestbook/${id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  );
}

export async function fetchMoments() {
  return parseJson<MomentEntry[]>(await fetch("/api/moments", { cache: "no-store" }));
}

export async function createMoment(formData: FormData) {
  return parseJson<MomentEntry>(await fetch("/api/moments", { method: "POST", body: formData }));
}

export async function updateMoment(id: string, payload: Partial<MomentEntry>) {
  return parseJson<MomentEntry>(
    await fetch(`/api/moments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteMoment(id: string) {
  return parseJson<{ ok: boolean }>(await fetch(`/api/moments/${id}`, { method: "DELETE" }));
}

export async function reportMoment(id: string, reason: string) {
  return parseJson<MomentEntry>(
    await fetch(`/api/moments/${id}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  );
}

export async function saveGeneratedCard(payload: Omit<GeneratedCardSet, "id" | "createdAt"> & Partial<GeneratedCardSet>) {
  return parseJson<GeneratedCardSet>(
    await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function verifyAdminPassword(password: string) {
  return parseJson<{ ok: boolean }>(
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }),
  );
}

export async function logoutAdmin() {
  return parseJson<{ ok: boolean }>(await fetch("/api/admin/logout", { method: "POST" }));
}

export async function bulkModerate(target: "guestbooks" | "moments", hidden: boolean) {
  return parseJson<{ ok: boolean }>(
    await fetch("/api/moderation/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, hidden }),
    }),
  );
}

export async function fetchAdminSession() {
  return parseJson<{ authenticated: boolean; role: AdminRole | null; sessionId: string | null }>(
    await fetch("/api/admin/session", { cache: "no-store" }),
  );
}

export async function fetchAdminAccessCodes() {
  return parseJson<AdminAccessCode[]>(await fetch("/api/admin/access-codes", { cache: "no-store" }));
}

export async function createAdminAccessCode(payload: { role: AdminRole; label: string; expiresAt?: string; oneTime?: boolean }) {
  return parseJson<AdminAccessCode & { rawCode: string }>(
    await fetch("/api/admin/access-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function revokeAdminAccessCode(id: string) {
  return parseJson<{ ok: boolean }>(await fetch(`/api/admin/access-codes/${id}`, { method: "DELETE" }));
}

export async function fetchAdminLogs() {
  return parseJson<AdminAuditLog[]>(await fetch("/api/admin/logs", { cache: "no-store" }));
}
