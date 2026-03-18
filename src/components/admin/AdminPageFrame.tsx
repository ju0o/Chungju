import { ReactNode } from "react";
import { AdminRole } from "@/lib/types";
import { AdminRouteNav } from "@/components/admin/AdminRouteNav";

export function AdminPageFrame({
  role,
  pathname,
  title,
  children,
}: {
  role: AdminRole;
  pathname: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="app-shell grid gap-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl">{title}</h1>
      </section>
      <AdminRouteNav role={role} pathname={pathname} />
      {children}
    </main>
  );
}
