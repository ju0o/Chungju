"use client";

import { useEffect, useState } from "react";
import { createAdminAccessCode, fetchAdminAccessCodes, revokeAdminAccessCode } from "@/lib/api";
import { ROLE_LABELS } from "@/lib/constants";
import { AdminAccessCode, AdminRole } from "@/lib/types";

export function AccessTab() {
  const [codes, setCodes] = useState<AdminAccessCode[]>([]);
  const [lastCreated, setLastCreated] = useState("");
  const [role, setRole] = useState<AdminRole>("field_moderator");
  const [label, setLabel] = useState("현장용 코드");
  const [expiresAt, setExpiresAt] = useState("");
  const [oneTime, setOneTime] = useState(false);

  useEffect(() => {
    fetchAdminAccessCodes().then(setCodes).catch(() => undefined);
  }, []);

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">접근 관리</h2>
      <p className="body-copy mt-2 text-sm text-[var(--foreground-soft)]">
        슈퍼관리자는 접근 코드를 발급해 실무 운영자에게 부스 등록, 작가 등록, 지도 포인트 수정 권한을 줄 수 있습니다.
      </p>
      <div className="mt-4 grid gap-3">
        <select className="festival-input" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
          {(["super_admin", "content_manager", "field_moderator"] as AdminRole[]).map((item) => (
            <option key={item} value={item}>{ROLE_LABELS[item]}</option>
          ))}
        </select>
        <input className="festival-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="코드 라벨" />
        <input className="festival-input" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input type="checkbox" checked={oneTime} onChange={() => setOneTime((value) => !value)} />
          1회용 코드
        </label>
        <button
          type="button"
          onClick={async () => {
            const created = await createAdminAccessCode({ role, label, expiresAt: expiresAt || undefined, oneTime });
            setLastCreated(created.rawCode);
            setCodes((current) => [created, ...current]);
          }}
          className="festival-button bg-[var(--accent)] text-white"
        >
          접근 코드 생성
        </button>
        {lastCreated ? (
          <div className="rounded-2xl border border-[var(--accent)] bg-[var(--accent)]/10 p-4 text-sm">
            생성된 코드: <strong>{lastCreated}</strong>
          </div>
        ) : null}
        {codes.map((code) => (
          <div key={code.id} className="flex items-center justify-between rounded-2xl border border-[var(--line)] p-4 text-sm">
            <div>
              <p>{code.label}</p>
              <p className="text-xs text-[var(--muted)]">
                {ROLE_LABELS[code.role]} · {code.status} {code.oneTime ? "· 1회용" : ""} {code.expiresAt ? `· ${code.expiresAt}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await revokeAdminAccessCode(code.id);
                setCodes((current) => current.map((item) => (item.id === code.id ? { ...item, status: "revoked" } : item)));
              }}
              className="rounded-full border border-[var(--line)] px-3 py-2 text-xs"
            >
              폐기
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
