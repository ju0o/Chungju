import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/server-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await request.json().catch(() => ({}));
  const index = memoryStore.moments.findIndex((item) => item.id === id);
  if (index < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  memoryStore.moments[index] = {
    ...memoryStore.moments[index],
    reported: true,
    reportReason: payload.reason ?? "기타",
  };
  return NextResponse.json(memoryStore.moments[index]);
}
