import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/server-store";
import { persistPageView } from "@/lib/supabase-admin-store";

export async function POST(request: Request) {
  const payload = await request.json();
  const createdAt = new Date().toISOString();
  const hourKey = createdAt.slice(11, 13);
  memoryStore.visitStats.totalPageViews += 1;
  memoryStore.visitStats.routeHits[payload.pathname] = (memoryStore.visitStats.routeHits[payload.pathname] ?? 0) + 1;
  memoryStore.visitStats.hourlyHits[hourKey] = (memoryStore.visitStats.hourlyHits[hourKey] ?? 0) + 1;
  if (payload.guestId && !memoryStore.visitStats.uniqueGuests.includes(payload.guestId)) {
    memoryStore.visitStats.uniqueGuests.push(payload.guestId);
  }
  await persistPageView({ pathname: payload.pathname, guestId: payload.guestId, createdAt });
  return NextResponse.json({ ok: true });
}
