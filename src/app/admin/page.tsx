import { AdminPanel } from "@/components/AdminPanel";
import { requireAdminPage } from "@/lib/admin-page-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await requireAdminPage();
  return (
    <main className="app-shell">
      <AdminPanel role={data.session.role} initialTab="overview" initialSettings={data.settings} initialGuestbooks={data.guestbooks} initialMoments={data.moments} initialStampPoints={data.stampPoints} summary={data.summary} />
    </main>
  );
}
