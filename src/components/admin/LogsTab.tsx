"use client";

import { useEffect, useState } from "react";
import { fetchAdminLogs } from "@/lib/api";
import { AdminAuditLog } from "@/lib/types";

export function LogsTab() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    fetchAdminLogs().then(setLogs).catch(() => undefined);
  }, []);

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">운영 로그</h2>
      <div className="mt-4 grid gap-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-[var(--line)] p-4 text-sm">
            <p>{log.resourceType} · {log.actionType}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {log.adminRole} · {new Date(log.createdAt).toLocaleString("ko-KR")}
            </p>
            {log.before || log.after ? (
              <div className="mt-3 grid gap-2 rounded-2xl bg-[rgba(248,244,238,0.72)] p-3 text-xs">
                <div>
                  <p className="font-semibold">변경 전</p>
                  <pre className="whitespace-pre-wrap break-all text-[11px] text-[var(--muted)]">
                    {JSON.stringify(log.before ?? {}, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold">변경 후</p>
                  <pre className="whitespace-pre-wrap break-all text-[11px] text-[var(--muted)]">
                    {JSON.stringify(log.after ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
