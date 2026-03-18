import { AdminSectionPage } from "@/components/admin/AdminSectionPage";
import { requireAdminPage } from "@/lib/admin-page-data";

export default async function AdminQrPage() {
  const data = await requireAdminPage();
  return (
    <AdminSectionPage
      role={data.session.role}
      pathname="/admin/qr"
      title="QR Generator"
      section="qr"
      initialSettings={data.settings}
      initialGuestbooks={data.guestbooks}
      initialMoments={data.moments}
      initialStampPoints={data.stampPoints}
      summary={data.summary}
    />
  );
}
