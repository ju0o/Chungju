"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PaperLabel } from "@/components/CollageOrnaments";
import { StampJourneySummary } from "@/components/StampJourneySummary";
import { StampProgressCard } from "@/components/StampProgressCard";
import { fetchEventSettings, fetchStampPoints } from "@/lib/api";
import { DEFAULT_EVENT_SETTINGS, DEFAULT_STAMP_POINTS } from "@/lib/constants";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { evaluateStampCompletion } from "@/lib/stamp-tour";
import { EventSettings, StampPoint } from "@/lib/types";

export default function TourPage() {
  const { stampState } = useFestivalSession();
  const [points, setPoints] = useState<StampPoint[]>(DEFAULT_STAMP_POINTS);
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [siteMode, setSiteMode] = useState("live");

  useEffect(() => {
    fetchStampPoints().then(setPoints).catch(() => setPoints(DEFAULT_STAMP_POINTS));
    fetchEventSettings().then((data) => {
      setSettings(data);
      setSiteMode(data.siteMode);
    }).catch(() => undefined);
  }, []);

  const completion = evaluateStampCompletion(points, stampState, settings);
  const completed = completion.completed;
  const isArchive = siteMode === "ended" || siteMode === "archive";

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Stamp Tour" tone="petal" />
          <PaperLabel text="Festival Walk" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">머무는 동선</h1>
        <p className="mt-3 max-w-[28ch] text-sm leading-7 text-[var(--foreground-soft)]">
          각 포인트는 단순 체크가 아니라 오늘 지나간 장면의 기록입니다. QR에 접속하면 스탬프가 저장되고, 이미 받은 장면은 중복 처리되지 않습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <PaperLabel text={`${settings.stampCompletionRule.requiredCount}개 중 완료`} tone="leaf" />
          <PaperLabel text={`location ${settings.stampCompletionRule.locationRequired}개`} />
          <PaperLabel text={`booth ${settings.stampCompletionRule.boothRequired}개`} tone="petal" />
        </div>
      </section>
      <StampProgressCard points={points} stampState={stampState} settings={settings} />
      <StampJourneySummary points={points} stampState={stampState} settings={settings} />
      {isArchive ? (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="section-title">투어 비활성화</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
            현재는 행사 종료 후 아카이브 모드입니다. 스탬프 참여는 닫혀 있고 남겨진 기록만 볼 수 있습니다.
          </p>
        </section>
      ) : null}
      {completed ? (
        <section className="section-card soft-pattern rounded-[1.75rem] p-5">
          <h2 className="section-title">기록으로 남는 하루</h2>
          <p className="mt-2 max-w-[28ch] text-sm leading-7 text-[var(--foreground-soft)]">
            완료 조건을 만족했습니다. 방문 경로와 남긴 문장을 바탕으로 카드뉴스를 생성할 수 있습니다.
          </p>
          <Link href="/card" className="festival-button festival-button--primary mt-4">
            기록 카드 만들기
          </Link>
        </section>
      ) : null}
    </main>
  );
}
