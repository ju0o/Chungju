import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/server-store";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("public_moments").select("*").order("created_at", { ascending: false });
    if (data) {
      return NextResponse.json(
        data.map((item) => ({
          id: item.id,
          guestId: item.guest_id,
          nickname: item.nickname,
          text: item.text,
          imageUrl: item.image_url,
          hashtags: item.hashtags ?? [],
          isPublic: item.is_public,
          createdAt: item.created_at,
          hidden: item.hidden,
          reported: item.reported,
          approved: item.approved,
        })),
      );
    }
  }
  return NextResponse.json(
    [...memoryStore.moments].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get("image");
  let imageUrl: string | undefined;

  if (image instanceof File && image.size > 0) {
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    imageUrl = `data:${image.type};base64,${base64}`;

    if (hasServerSupabase() && supabaseAdmin) {
      const filePath = `moments/${Date.now()}-${image.name}`;
      const upload = await supabaseAdmin.storage
        .from(process.env.SUPABASE_STORAGE_BUCKET ?? "festival-moments")
        .upload(filePath, image, {
          contentType: image.type,
          upsert: false,
        });
      if (!upload.error) {
        const { data } = supabaseAdmin.storage
          .from(process.env.SUPABASE_STORAGE_BUCKET ?? "festival-moments")
          .getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }
    }
  }

  if (hasServerSupabase() && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("public_moments")
      .insert({
        guest_id: String(formData.get("guestId") ?? "guest-anonymous"),
        nickname: String(formData.get("nickname") ?? "게스트"),
        text: String(formData.get("text") ?? ""),
        hashtags: JSON.parse(String(formData.get("hashtags") ?? "[]")) as string[],
        is_public: JSON.parse(String(formData.get("isPublic") ?? "true")) as boolean,
        image_url: imageUrl,
      })
      .select()
      .single();
    if (!error && data) {
      return NextResponse.json({
        id: data.id,
        guestId: data.guest_id,
        nickname: data.nickname,
        text: data.text,
        hashtags: data.hashtags ?? [],
        isPublic: data.is_public,
        createdAt: data.created_at,
        imageUrl: data.image_url,
        hidden: data.hidden,
        reported: data.reported,
        approved: data.approved,
      });
    }
  }

  const entry = {
    id: `moment-${Date.now()}`,
    guestId: String(formData.get("guestId") ?? "guest-anonymous"),
    nickname: String(formData.get("nickname") ?? "게스트"),
    text: String(formData.get("text") ?? ""),
    hashtags: JSON.parse(String(formData.get("hashtags") ?? "[]")) as string[],
    isPublic: JSON.parse(String(formData.get("isPublic") ?? "true")) as boolean,
    createdAt: new Date().toISOString(),
    imageUrl,
    approved: false,
  };

  memoryStore.moments.unshift(entry);
  return NextResponse.json(entry);
}
