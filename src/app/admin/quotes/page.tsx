import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { requireAdminPage } from "@/lib/admin-page-data";

export default async function AdminQuotesPage() {
  const data = await requireAdminPage();
  return <AdminSectionPage role={data.session.role} pathname="/admin/quotes" title="문장 뽑기 관리" section="quotes" initialSettings={data.settings} initialGuestbooks={data.guestbooks} initialMoments={data.moments} initialStampPoints={data.stampPoints} summary={data.summary} />;
}
