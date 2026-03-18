import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { requireAdminPage } from "@/lib/admin-page-data";

export default async function AdminLogsPage() {
  const data = await requireAdminPage();
  return <AdminSectionPage role={data.session.role} pathname="/admin/logs" title="운영 로그" section="logs" initialSettings={data.settings} initialGuestbooks={data.guestbooks} initialMoments={data.moments} initialStampPoints={data.stampPoints} summary={data.summary} />;
}
