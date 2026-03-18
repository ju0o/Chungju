import Link from "next/link";
import { MapPin, Sparkles, Store, TentTree } from "lucide-react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { EventSettings, StampPoint, StampState } from "@/lib/types";
import { evaluateStampCompletion } from "@/lib/stamp-tour";

export function StampProgressCard({
  points,
  stampState,
  settings,
}: {
  points: StampPoint[];
  stampState: StampState;
  settings: EventSettings;
}) {
  const acquiredCount = stampState.acquiredStampIds.length;
  const progress = points.length ? Math.round((acquiredCount / points.length) * 100) : 0;
  const completion = evaluateStampCompletion(points, stampState, settings);

  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="section-eyebrow">Tour</p>
          <h2 className="section-title mt-1">머무는 동선의 진행률</h2>
        </div>
        <p className="text-sm text-[var(--foreground-soft)]">
          {acquiredCount}/{points.length}
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-[rgba(94,86,72,0.1)]">
        <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--leaf),var(--accent))]" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
        당신은 지금 이 축제의 {acquiredCount === 0 ? "첫 번째" : `${acquiredCount}번째`} 장면을 향해 걷고 있어요.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <PaperLabel text={`완료 조건 ${settings.stampCompletionRule.requiredCount}개`} tone="leaf" />
        <PaperLabel text={`location ${completion.locationCount}/${settings.stampCompletionRule.locationRequired}`} />
        <PaperLabel text={`booth ${completion.boothCount}/${settings.stampCompletionRule.boothRequired}`} tone="petal" />
      </div>
      <div className="mt-4 grid gap-3">
        {points.map((point) => {
          const acquired = stampState.acquiredStampIds.includes(point.id);
          const Icon = point.pointType === "booth" ? Store : point.order === 1 ? Sparkles : point.order === 2 ? MapPin : TentTree;
          return (
            <Link
              key={point.id}
              href={`/stamp/${point.slug}`}
              className="flex items-center justify-between rounded-[1.4rem] border border-[var(--line)] bg-[rgba(255,252,246,0.78)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(222,133,101,0.12)] text-[var(--accent-strong)]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{point.title}</p>
                  <p className="text-xs leading-5 text-[var(--foreground-soft)]">{point.description}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--foreground-soft)]">{point.pointType}</p>
                </div>
              </div>
              <span className="hidden sm:block">
                <PaperLabel text={point.phrase} tone="petal" />
              </span>
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: acquired ? "rgba(123,151,117,0.16)" : "rgba(234,183,190,0.18)",
                  color: acquired ? "var(--leaf-deep)" : "var(--accent-strong)",
                }}
              >
                {acquired ? "획득 완료" : "QR 대기"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
