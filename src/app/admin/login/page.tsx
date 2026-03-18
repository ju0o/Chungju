"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { verifyAdminPassword } from "@/lib/api";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="app-shell">
      <section className="section-card rounded-[1.75rem] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">Admin Access</p>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-4xl">운영자 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          접근 코드를 입력하면 서버 검증 후 httpOnly 세션 쿠키가 발급됩니다. 권한에 따라 보이는 메뉴가 달라집니다.
        </p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");
            try {
              const result = await verifyAdminPassword(password);
              if (result.ok) {
                window.location.href = "/admin";
                return;
              }
              setError("접근 코드를 확인하세요.");
            } catch {
              setError("로그인에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="relative">
            <input
              type={visible ? "text" : "password"}
              className="festival-input pr-12"
              placeholder="접근 코드"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setVisible((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button disabled={loading} className="festival-button bg-[var(--foreground)] text-white">
            <Shield size={18} />
            관리자 로그인
          </button>
        </form>
      </section>
    </main>
  );
}
