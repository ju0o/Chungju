"use client";

import { useState } from "react";
import { ensureGuestSession, updateGuestNickname } from "@/lib/guest";
import { getStoredCards, getStoredInterests, getStoredStamps, saveStoredCards, saveStoredInterests, saveStoredStamps } from "@/lib/storage";
import { GeneratedCardSet, GuestSession, StampState, VisitorInterestState } from "@/lib/types";

export function useFestivalSession() {
  const [session, setSession] = useState<GuestSession | null>(() =>
    typeof window === "undefined" ? null : ensureGuestSession(),
  );
  const [stampState, setStampState] = useState<StampState>(() =>
    typeof window === "undefined" ? { acquiredStampIds: [] } : getStoredStamps(),
  );
  const [cards, setCards] = useState<GeneratedCardSet[]>(() =>
    typeof window === "undefined" ? [] : getStoredCards(),
  );
  const [interests, setInterests] = useState<VisitorInterestState>(() =>
    typeof window === "undefined"
      ? { favoriteBoothIds: [], favoriteAuthorNames: [], savedProgramIds: [] }
      : getStoredInterests(),
  );

  const rename = (nickname: string) => {
    const next = updateGuestNickname(nickname);
    setSession(next);
  };

  const upsertStampState = (next: StampState) => {
    saveStoredStamps(next);
    setStampState(next);
  };

  const upsertCards = (next: GeneratedCardSet[]) => {
    saveStoredCards(next);
    setCards(next);
  };

  const upsertInterests = (next: VisitorInterestState) => {
    saveStoredInterests(next);
    setInterests(next);
  };

  return { session, stampState, cards, interests, rename, upsertStampState, upsertCards, upsertInterests };
}
