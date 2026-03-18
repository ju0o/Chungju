"use client";

import { STORAGE_KEYS } from "@/lib/constants";
import { GENERATED_CARD_LIMIT } from "@/lib/constants";
import { GeneratedCardSet, GuestSession, StampState, VisitorInterestState } from "@/lib/types";

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getStoredSession() {
  return loadJson<GuestSession | null>(STORAGE_KEYS.session, null);
}

export function saveStoredSession(session: GuestSession) {
  saveJson(STORAGE_KEYS.session, session);
}

export function getStoredStamps() {
  return loadJson<StampState>(STORAGE_KEYS.stampState, {
    acquiredStampIds: [],
    completionBadge: "",
  });
}

export function saveStoredStamps(state: StampState) {
  saveJson(STORAGE_KEYS.stampState, state);
}

export function getStoredCards() {
  return loadJson<GeneratedCardSet[]>(STORAGE_KEYS.cards, []);
}

export function saveStoredCards(cards: GeneratedCardSet[]) {
  saveJson(STORAGE_KEYS.cards, cards.slice(0, GENERATED_CARD_LIMIT));
}

export function getStoredInterests() {
  return loadJson<VisitorInterestState>(STORAGE_KEYS.interests, {
    favoriteBoothIds: [],
    favoriteAuthorNames: [],
    savedProgramIds: [],
  });
}

export function saveStoredInterests(state: VisitorInterestState) {
  saveJson(STORAGE_KEYS.interests, state);
}
