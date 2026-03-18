import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/server-store";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const payload = await request.json();
  if (hasServerSupabase() && supabaseAdmin) {
    let thumbnailUrl = payload.thumbnailUrl;
    if (payload.imageDataUrl && typeof payload.imageDataUrl === "string" && payload.imageDataUrl.startsWith("data:")) {
      const match = payload.imageDataUrl.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const base64 = match[2];
        const buffer = Buffer.from(base64, "base64");
        const filePath = `cards/${payload.id ?? `card-${Date.now()}`}.png`;
        const upload = await supabaseAdmin.storage
          .from(process.env.SUPABASE_STORAGE_BUCKET ?? "festival-moments")
          .upload(filePath, buffer, {
            contentType: mime,
            upsert: true,
          });
        if (!upload.error) {
          const { data } = supabaseAdmin.storage
            .from(process.env.SUPABASE_STORAGE_BUCKET ?? "festival-moments")
            .getPublicUrl(filePath);
          thumbnailUrl = data.publicUrl;
        }
      }
    }
    const { data, error } = await supabaseAdmin
      .from("generated_cards")
      .insert({
        guest_id: payload.guestId,
        ratio: payload.ratio,
        slides: payload.slides,
        image_data_url: payload.imageDataUrl,
        image_url: thumbnailUrl,
      })
      .select()
      .single();
    if (!error && data) return NextResponse.json(data);
  }
  const card = {
    ...payload,
    thumbnailUrl: payload.thumbnailUrl ?? payload.imageDataUrl,
    id: payload.id ?? `card-${Date.now()}`,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };
  memoryStore.cards.unshift(card);
  return NextResponse.json(card);
}
