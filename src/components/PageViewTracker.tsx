"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getStoredSession } from "@/lib/storage";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const session = getStoredSession();
    fetch("/api/stats/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathname,
        guestId: session?.guestId ?? null,
      }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
