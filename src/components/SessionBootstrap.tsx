"use client";

import { useEffect } from "react";
import { ensureGuestSession } from "@/lib/guest";

export function SessionBootstrap() {
  useEffect(() => {
    ensureGuestSession();
  }, []);

  return null;
}
