import { PaperLabel } from "@/components/CollageOrnaments";
import { evaluateStampCompletion } from "@/lib/stamp-tour";
import { EventSettings, StampPoint, StampState } from "@/lib/types";

export function StampJourneySummary({
  points,
  stampState,
  settings,
}: {
  points: StampPoint[];
  stampState: StampState;
  settings: EventSettings;
}) {
  const { visited, badge, completed } = evaluateStampCompletion(points, stampState, settings);

  return (
    <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
      <p className="section-eyebrow">Journey</p>
      <h2 className="section-title mt-2">축제 산책의 기록</h2>
      <p className="mt-2 max-w-[28ch] text-sm leading-7 text-[var(--foreground-soft)]">
        {visited.length > 0
          ? `당신은 지금 이 축제의 ${visited.length}번째 장면을 지나고 있어요.`
          : "첫 장면을 시작하면 방문 경로가 이곳에 쌓입니다."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {visited.map((point, index) => (
          <PaperLabel key={point.id} text={`${index + 1}. ${point.title}`} tone={index % 2 === 0 ? "leaf" : "petal"} />
        ))}
      </div>
      {completed ? (
        <div className="mt-5 rounded-[1.6rem] bg-[linear-gradient(135deg,#4f5b4c,#7b9775)] px-5 py-5 text-white shadow-[0_18px_32px_rgba(88,107,81,0.28)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Completion Badge</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-4xl leading-tight">{badge}</p>
          <p className="mt-2 max-w-[24ch] text-sm leading-7 text-white/82">
            오늘의 동선을 모두 지나 꽃시장과 문장을 기록한 방문자에게 주어지는 배지입니다.
          </p>
        </div>
      ) : null}
    </section>
  );
}
