"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] p-4">
      <div className="w-full max-w-sm">
        <section className="section-card rounded-[1.75rem] p-6">
          <div className="text-center mb-5">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-xl font-bold">관리자 로그인</h1>
            <p className="text-sm text-[var(--foreground-soft)] mt-1">축제 관리 시스템</p>
          </div>
          {error && <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</p>}
          <form
            className="grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              setError("");
              try {
                const res = await fetch("/api/auth/admin/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (data.success) {
                  router.push("/admin/dashboard");
                  return;
                }
                setError(data.error || "로그인에 실패했습니다.");
              } catch {
                setError("로그인에 실패했습니다.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">이메일</label>
              <input
                id="email"
                type="email"
                className="festival-input w-full"
                placeholder="admin@festival.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">비밀번호</label>
              <div className="relative">
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  className="festival-input w-full pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button disabled={loading} className="festival-button primary mt-2 w-full rounded-xl py-3 text-sm font-semibold">
              <Shield size={18} />
              {loading ? "로그인 중..." : "관리자 로그인"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
