"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ScanQrCode, AlertCircle } from "lucide-react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { createStampLog } from "@/lib/api";
import { evaluateStampCompletion } from "@/lib/stamp-tour";
import { EventSettings, StampPoint, StampState } from "@/lib/types";
import { QRScanner } from "@/components/QRScanner";

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
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

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
      setShowScanner(false);
    }
  }

  const handleScan = (data: string) => {
    // QR 코드 데이터 검증
    // 1. URL에 현재 포인트의 slug가 포함되어 있는지 확인하거나
    // 2. 데이터 자체가 slug와 일치하는지 확인
    const isCorrectPoint = data.includes(point.slug) || data === point.slug;

    if (isCorrectPoint) {
      setScanError(null);
      handleAcquire();
    } else {
      setScanError("이 부스의 QR 코드가 아닌 것 같습니다. 다시 확인해주세요.");
      // 잠깐 오류 보여주고 다시 스캔 가능하게 함 (또는 알림)
      setTimeout(() => setScanError(null), 3000);
    }
  };

  return (
    <section className="section-card stamp-burst paper-stack soft-pattern rounded-[1.9rem] p-5">
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => {
            setShowScanner(false);
            setScanError(null);
          }}
        />
      )}

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
          <p>방문 인증 방식: 현장 QR을 직접 스캔하여 방문을 인증합니다.</p>
        </div>
      </div>

      {scanError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 animate-pulse">
          <AlertCircle size={14} />
          {scanError}
        </div>
      )}

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          disabled={loading || acquired || disabled || point.qrEnabled === false}
          onClick={() => setShowScanner(true)}
          className="festival-button festival-button--primary disabled:opacity-60"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <ScanQrCode size={18} />
          )}
          {point.qrEnabled === false
            ? "이 포인트는 QR 방문 인증이 비활성화되어 있습니다"
            : disabled
              ? "아카이브 모드에서는 스탬프를 획득할 수 없습니다"
              : acquired
                ? "이미 획득한 스탬프입니다"
                : "부스에서 스탬프 획득하기"}
        </button>
        <Link href="/tour" className="festival-button festival-button--paper">
          투어 현황 보기
        </Link>
      </div>
    </section>
  );
}
