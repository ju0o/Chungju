import { BookLandingPage } from "@/components/BookLandingPage";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSiteSettings();
  return <BookLandingPage settings={settings} />;
}
