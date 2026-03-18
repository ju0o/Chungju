import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { requireAdminPage } from "@/lib/admin-page-data";

export default async function AdminSettingsPage() {
  const data = await requireAdminPage();
  return <AdminSectionPage role={data.session.role} pathname="/admin/settings" title="기본 설정" section="settings" initialSettings={data.settings} initialGuestbooks={data.guestbooks} initialMoments={data.moments} initialStampPoints={data.stampPoints} summary={data.summary} />;
}
