import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { requireAdminPage } from "@/lib/admin-page-data";

export default async function AdminCardsPage() {
  const data = await requireAdminPage();
  return <AdminSectionPage role={data.session.role} pathname="/admin/cards" title="카드뉴스 설정" section="cards" initialSettings={data.settings} initialGuestbooks={data.guestbooks} initialMoments={data.moments} initialStampPoints={data.stampPoints} cards={data.cards} summary={data.summary} />;
}
