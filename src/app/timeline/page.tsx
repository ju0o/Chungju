"use client";

import { useEffect, useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  location?: string;
  status: "upcoming" | "live" | "done";
}

export default function TimelinePage() {
  const [schedule, setSchedule] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/festivals")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          const festival = d.data[0];
          const items = (festival.schedule as TimelineItem[]) || [];
          // 현재 시간 기준으로 status 자동 판별
          const now = new Date();
          const currentHour = now.getHours();
          const currentMin = now.getMinutes();
          const enhanced = items.map((item) => {
            const [h, m] = (item.time || "00:00").split(":").map(Number);
            const itemMin = h * 60 + (m || 0);
            const nowMin = currentHour * 60 + currentMin;
            let status: "upcoming" | "live" | "done" = "upcoming";
            if (nowMin >= itemMin + 60) status = "done";
            else if (nowMin >= itemMin - 5) status = "live";
            return { ...item, status };
          });
          setSchedule(enhanced);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Timeline" tone="petal" />
          <PaperLabel text="Today's Schedule" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">오늘의 타임라인</h1>
        <p className="body-copy mt-3 max-w-[30ch] text-sm text-[var(--foreground-soft)]">
          축제 일정을 시간순으로 확인하고, 진행 중인 프로그램을 놓치지 마세요.
        </p>
      </section>

      {loading ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center text-sm text-[var(--foreground-soft)]">
          일정을 불러오는 중...
        </div>
      ) : schedule.length === 0 ? (
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm text-[var(--foreground-soft)]">등록된 일정이 없습니다.</p>
        </div>
      ) : (
        <div className="relative pl-6">
          {/* 타임라인 선 */}
          <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-[var(--line)]" />

          <div className="grid gap-3">
            {schedule.map((item, i) => {
              const isLive = item.status === "live";
              const isDone = item.status === "done";
              return (
                <div key={i} className="relative">
                  {/* 타임라인 점 */}
                  <div className={`absolute -left-6 top-4 h-3 w-3 rounded-full border-2 ${
                    isLive
                      ? "border-green-400 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                      : isDone
                      ? "border-gray-300 bg-gray-300"
                      : "border-[var(--accent)] bg-white"
                  }`} />

                  <div className={`section-card rounded-[1.5rem] p-4 transition-all ${
                    isLive ? "border-green-300 bg-green-50/50 shadow-sm" : isDone ? "opacity-60" : ""
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[var(--accent-coral)] tabular-nums">{item.time}</span>
                      {isLive && (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                          </span>
                          진행 중
                        </span>
                      )}
                      {isDone && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">완료</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="mt-1 text-xs text-[var(--foreground-soft)]">{item.description}</p>
                    {item.location && (
                      <p className="mt-1 text-[11px] text-[var(--accent-leaf)]">📍 {item.location}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
