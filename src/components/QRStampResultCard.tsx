"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PartyPopper } from "lucide-react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { createStampLog } from "@/lib/api";
import { evaluateStampCompletion } from "@/lib/stamp-tour";
import { EventSettings, StampPoint, StampState } from "@/lib/types";

type Props = {
  point: StampPoint;
  stampState: StampState;
  guestId: string;
  onAcquire: (next: StampState) => void;
  points: StampPoint[];
  settings: EventSettings;
  disabled?: boolean;
};

export function QRStampResultCard({ point, stampState, guestId, onAcquire, points, settings, disabled = false }: Props) {
  const [loading, setLoading] = useState(false);
  const acquired = useMemo(
    () => stampState.acquiredStampIds.includes(point.id),
    [point.id, stampState.acquiredStampIds],
  );

  async function handleAcquire() {
    if (acquired || disabled || point.qrEnabled === false) return;
    setLoading(true);
    const nextIds = [...stampState.acquiredStampIds, point.id];
    const evaluated = evaluateStampCompletion(points, { ...stampState, acquiredStampIds: nextIds }, settings);
    const nextState: StampState = {
      acquiredStampIds: nextIds,
      lastVisitedStampId: point.id,
      completedAt: evaluated.completed ? new Date().toISOString() : stampState.completedAt,
      completionBadge: evaluated.completed ? evaluated.badge : stampState.completionBadge,
    };
    onAcquire(nextState);
    try {
      await createStampLog({ guestId, stampId: point.id });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-card stamp-burst paper-stack soft-pattern rounded-[1.9rem] p-5">
      <div className="flex flex-wrap gap-2">
        <PaperLabel text="QR Stamp Point" tone="petal" />
        <PaperLabel text={`${point.order}번째 장면`} tone="leaf" />
        <PaperLabel text={point.pointType === "location" ? "location_type" : "booth_type"} />
      </div>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-[2.3rem] leading-tight">{point.title}</h1>
      <p className="body-copy mt-2 max-w-[24ch] text-sm text-[var(--foreground-soft)]">{point.phrase}</p>
      <div className="mt-5 rounded-[1.6rem] border border-dashed border-[var(--line)] bg-white/55 p-5">
        <p className="text-sm font-semibold">{point.location}</p>
        <p className="body-copy mt-1 text-sm text-[var(--foreground-soft)]">{point.description}</p>
        <div className="mt-3 grid gap-1 text-xs text-[var(--foreground-soft)]">
          <p>QR 발급 상태: {point.qrEnabled === false ? "비활성" : "활성"}</p>
          <p>방문 인증 방식: QR을 통해 이 포인트 방문 인증이 기록됩니다.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        <button
          type="button"
          disabled={loading || acquired || disabled || point.qrEnabled === false}
          onClick={handleAcquire}
          className="festival-button festival-button--primary disabled:opacity-60"
        >
          <PartyPopper size={18} />
          {point.qrEnabled === false
            ? "이 포인트는 QR 방문 인증이 비활성화되어 있습니다"
            : disabled
              ? "아카이브 모드에서는 스탬프를 획득할 수 없습니다"
              : acquired
                ? "이미 획득한 스탬프입니다"
                : "이 스탬프 획득하기"}
        </button>
        <Link href="/tour" className="festival-button festival-button--paper">
          투어 현황 보기
        </Link>
      </div>
    </section>
  );
}
