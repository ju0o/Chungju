"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ensureGuestSession } from "@/lib/guest";

export function GuestStartButton() {
  const [label, setLabel] = useState(() => {
    if (typeof window === "undefined") return "게스트로 시작하기";
    const session = ensureGuestSession();
    return session.nickname ? `${session.nickname} 님으로 계속하기` : "게스트로 시작하기";
  });

  return (
    <button
      type="button"
      onClick={() => {
        const session = ensureGuestSession();
        setLabel(session.nickname ? `${session.nickname} 님으로 계속하기` : "게스트로 시작하기");
      }}
      className="festival-button festival-button--primary"
    >
      <Sparkles size={18} />
      {label}
    </button>
  );
}
