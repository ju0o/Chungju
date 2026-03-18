import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { requireAdminPage } from "@/lib/admin-page-data";

export default async function AdminStatusPage() {
  const data = await requireAdminPage();
  return <AdminSectionPage role={data.session.role} pathname="/admin/status" title="사이트 상태 관리" section="status" initialSettings={data.settings} initialGuestbooks={data.guestbooks} initialMoments={data.moments} initialStampPoints={data.stampPoints} summary={data.summary} />;
}
