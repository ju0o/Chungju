import { BookBoothHomeClient } from "@/components/BookBoothHomeClient";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const settings = await getSiteSettings();
  return <BookBoothHomeClient settings={settings} initialTab="reviews" hideHomeTab />;
}

