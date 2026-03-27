import { DEFAULT_EVENT_SETTINGS, DEFAULT_STAMP_POINTS } from "@/lib/constants";
import { memoryStore } from "@/lib/server-store";
import { EventSettings, MomentEntry, StampPoint } from "@/lib/types";
import { hasServerSupabase, supabaseAdmin } from "@/lib/supabase-admin";

function mergeBooths(rawBooths: unknown): EventSettings["booths"] {
  const booths = Array.isArray(rawBooths) ? (rawBooths as EventSettings["booths"]) : [];
  const titleSet = new Set(booths.map((item) => item.bookTitle?.trim()).filter(Boolean));
  const missing = DEFAULT_EVENT_SETTINGS.booths.filter((item) => !titleSet.has(item.bookTitle.trim()));
  return [...booths, ...missing].sort((a, b) => a.order - b.order);
}

function mergeQuotes(rawQuotes: unknown): EventSettings["quotes"] {
  const quotes = Array.isArray(rawQuotes) ? (rawQuotes as EventSettings["quotes"]) : [];
  const quoteKey = (text: string, source?: string) => `${text.trim()}::${(source ?? "").trim()}`;
  const keySet = new Set(quotes.map((item) => quoteKey(item.text, item.sourceBook)));
  const missing = DEFAULT_EVENT_SETTINGS.quotes.filter((item) => !keySet.has(quoteKey(item.text, item.sourceBook)));
  return [...quotes, ...missing];
}

export async function getSiteSettings(): Promise<EventSettings> {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("site_settings").select("*").limit(1).maybeSingle();
    if (data) {
      return {
        ...DEFAULT_EVENT_SETTINGS,
        ...data,
        booths: mergeBooths(data.booths),
        quotes: mergeQuotes(data.quotes),
      } as EventSettings;
    }
  }
  return memoryStore.settings ?? DEFAULT_EVENT_SETTINGS;
}

export async function getStampPoints(): Promise<StampPoint[]> {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin.from("stamp_points").select("*").order("recommended_order");
    if (data) {
      return data.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.name,
        location: item.location ?? "",
        pointType: item.point_type ?? "location",
        description: item.description,
        phrase: item.short_copy,
        color: item.color ?? "#E79D73",
        order: item.recommended_order ?? item.order_index ?? item.order ?? 0,
        icon: item.icon_name,
        x: item.map_x,
        y: item.map_y,
        isPublished: item.is_published,
        qrEnabled: item.qr_enabled ?? true,
        rewardCopy: item.reward_copy,
        linkedBoothId: item.linked_booth_id ?? undefined,
      }));
    }
  }
  return [...(memoryStore.stampPoints ?? DEFAULT_STAMP_POINTS)].sort((a, b) => a.order - b.order);
}

export async function getDashboardSummary() {
  const settings = await getSiteSettings();
  return {
    siteMode: settings.siteMode,
    totalPageViews: memoryStore.visitStats.totalPageViews,
    uniqueGuestCount: memoryStore.visitStats.uniqueGuests.length,
    routeHits: memoryStore.visitStats.routeHits,
    hourlyHits: memoryStore.visitStats.hourlyHits,
    guestbookCount: memoryStore.guestbooks.length,
    momentCount: memoryStore.moments.length,
    stampCompletionCount: memoryStore.cards.length,
    hiddenQueueCount:
      memoryStore.guestbooks.filter((item) => item.hidden).length +
      memoryStore.moments.filter((item) => item.hidden).length,
    programCount: settings.programs.filter((item) => item.isPublished).length,
    boothCount: settings.booths.length,
    recentLogs: memoryStore.adminAuditLogs.slice(0, 5),
  };
}

export async function getPublicMoments(limit = 6): Promise<MomentEntry[]> {
  if (hasServerSupabase() && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from("public_moments")
      .select("*")
      .eq("is_public", true)
      .neq("hidden", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (data) {
      return data.map((item) => ({
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
      }));
    }
  }

  return [...memoryStore.moments]
    .filter((item) => item.isPublic && !item.hidden && item.approved !== false)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, limit);
}
