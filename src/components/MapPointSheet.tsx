import Link from "next/link";
import { PaperLabel } from "@/components/CollageOrnaments";
import { StampPoint } from "@/lib/types";

export function MapPointSheet({ point, onOpenBooth }: { point: StampPoint; onOpenBooth?: () => void }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,251,244,0.88)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap gap-2">
        <PaperLabel text={point.location} tone="leaf" />
        <PaperLabel text={`${point.order}번째 장면`} />
        <PaperLabel text={point.pointType === "booth" ? "부스 포인트" : "장소 포인트"} />
      </div>
      <p className="mt-3 font-[family-name:var(--font-heading)] text-[1.9rem] leading-tight">{point.title}</p>
      <p className="body-copy mt-2 text-sm text-[var(--foreground-soft)]">{point.description}</p>
      <blockquote className="quote-text mt-4 rounded-[1.2rem] border border-[rgba(94,86,72,0.08)] bg-[rgba(255,255,255,0.58)] px-4 py-3 text-lg text-[var(--foreground)]">
        {point.phrase}
      </blockquote>
      <div className="mt-4 grid gap-1 text-xs leading-6 text-[var(--foreground-soft)]">
        <p>이곳에서 할 수 있는 일: {point.pointType === "booth" ? "부스 정보 보기, QR 방문 인증, 사진 기록" : "QR 스탬프, 사진 기록, 포인트 감상"}</p>
        <p>QR 발급 및 방문 인증: {point.qrEnabled === false ? "사용 안 함" : "사용 가능"}</p>
        <p>추천 순서: {point.order}번째 방문</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {point.qrEnabled === false ? (
          <div className="festival-button border border-[var(--line)] bg-[rgba(94,86,72,0.08)] text-[var(--foreground-soft)]">
            이 포인트는 QR 방문 인증이 비활성화되어 있습니다
          </div>
        ) : (
          <Link href={`/stamp/${point.slug}`} className="festival-button festival-button--primary">
            QR 방문 인증 열기
          </Link>
        )}
        {point.pointType === "booth" && onOpenBooth ? (
          <button type="button" onClick={onOpenBooth} className="festival-button festival-button--paper">
            부스 상세 보기
          </button>
        ) : null}
      </div>
    </div>
  );
}
