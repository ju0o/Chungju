'use client';

import { useCallback, useEffect, useState } from 'react';

// API 호출 유틸
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '요청에 실패했습니다.');
  }
  return data.data;
}

// ─── 사용자 세션 ───
export function useUserSession() {
  const [session, setSession] = useState<{ userId: string; nickname: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchApi<{ userId: string; nickname: string }>('/api/auth/user', { method: 'POST' });
        setSession(data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const updateNickname = async (nickname: string) => {
    const data = await fetchApi<{ id: string; nickname: string }>('/api/me', {
      method: 'PATCH',
      body: JSON.stringify({ nickname }),
    });
    setSession((prev) => prev ? { ...prev, nickname: data.nickname } : null);
  };

  return { session, loading, updateNickname };
}

// ─── 관리자 세션 ───
export function useAdminSession() {
  const [session, setSession] = useState<{ adminUserId: string; role: string; name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const data = await fetchApi<typeof session>('/api/auth/admin/session');
        setSession(data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await fetchApi<typeof session>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSession(data);
  };

  const logout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' });
    setSession(null);
  };

  return { session, loading, login, logout };
}

// ─── 범용 데이터 훅 ───
export function useApiData<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      const result = await fetchApi<T>(url);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

export { fetchApi };
