import { BookCatalogPage } from "@/components/BookCatalogPage";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const settings = await getSiteSettings();
  return <BookCatalogPage settings={settings} />;
}
