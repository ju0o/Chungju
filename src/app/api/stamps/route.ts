import { NextResponse } from "next/server";
import { logAdminAction, requireAdminRole } from "@/lib/admin-auth";
import { memoryStore } from "@/lib/server-store";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("stamp_points").select("*").order("order_index");
    if (data) {
      return NextResponse.json(
        data.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.name,
          location: item.location ?? "",
          pointType: item.point_type ?? "location",
          description: item.description ?? "",
          phrase: item.short_copy ?? "",
          color: item.color ?? "#E79D73",
          order: item.recommended_order ?? item.order_index ?? 0,
          icon: item.icon_name ?? "map-pin",
          x: item.map_x ?? "50%",
          y: item.map_y ?? "50%",
          isPublished: item.is_published,
          qrEnabled: item.qr_enabled ?? true,
          rewardCopy: item.reward_copy ?? "",
          linkedBoothId: item.linked_booth_id ?? undefined,
        })),
      );
    }
  }
  return NextResponse.json(memoryStore.stampPoints);
}

export async function PATCH(request: Request) {
  const session = await requireAdminRole(["super_admin", "content_manager"]);
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const payload = await request.json();
  const before = memoryStore.stampPoints;
  memoryStore.stampPoints = payload;
  if (hasServerSupabase() && supabaseAdmin) {
    await supabaseAdmin.from("stamp_points").delete().not("id", "is", null);
    await supabaseAdmin.from("stamp_points").insert(
      payload.map((point: (typeof payload)[number]) => ({
        id: point.id,
        name: point.title,
        slug: point.slug,
        point_type: point.pointType,
        location: point.location,
        icon_name: point.icon,
        short_copy: point.phrase,
        description: point.description,
        map_x: point.x,
        map_y: point.y,
        order_index: point.order,
        recommended_order: point.order,
        is_published: point.isPublished,
        qr_enabled: point.qrEnabled ?? true,
        reward_copy: point.rewardCopy,
        color: point.color,
        linked_booth_id: point.linkedBoothId ?? null,
        updated_by: session.id,
      })),
    );
  }
  logAdminAction({
    adminSessionId: session.id,
    adminRole: session.role,
    actionType: "update",
    resourceType: "stamp_points",
    resourceId: "bulk",
    before,
    after: payload,
  });
  return NextResponse.json(memoryStore.stampPoints);
}
