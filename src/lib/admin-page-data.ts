import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { getDashboardSummary } from "@/lib/site-data";
import { memoryStore } from "@/lib/server-store";

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const summary = await getDashboardSummary();
  return {
    session,
    summary,
    settings: memoryStore.settings,
    stampPoints: memoryStore.stampPoints,
    cards: memoryStore.cards,
    guestbooks: memoryStore.guestbooks,
    moments: memoryStore.moments,
  };
}
