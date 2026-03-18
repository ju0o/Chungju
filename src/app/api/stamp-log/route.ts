import { NextResponse } from "next/server";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const payload = await request.json();
  if (hasServerSupabase() && supabaseAdmin) {
    await supabaseAdmin.from("stamp_logs").insert({
      guest_id: payload.guestId,
      stamp_point_id: payload.stampId,
    });
  }
  return NextResponse.json({ ok: true });
}
