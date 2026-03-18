"use client";

import { GuestSession } from "@/lib/types";
import { createGuestId } from "@/lib/utils";
import { getStoredSession, saveStoredSession } from "@/lib/storage";

export function ensureGuestSession() {
  const existing = getStoredSession();
  if (existing) return existing;

  const session: GuestSession = {
    guestId: createGuestId(),
    nickname: "",
    createdAt: new Date().toISOString(),
  };
  saveStoredSession(session);
  return session;
}

export function updateGuestNickname(nickname: string) {
  const current = ensureGuestSession();
  const next = { ...current, nickname };
  saveStoredSession(next);
  return next;
}
