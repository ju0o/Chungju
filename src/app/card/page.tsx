"use client";

import { useEffect, useMemo, useState } from "react";
import { CardNewsPreview } from "@/components/CardNewsPreview";
import { PaperLabel } from "@/components/CollageOrnaments";
import { fetchEventSettings, fetchStampPoints, saveGeneratedCard } from "@/lib/api";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { DEFAULT_EVENT_SETTINGS, DEFAULT_STAMP_POINTS, TOUR_BADGES } from "@/lib/constants";
import { evaluateStampCompletion } from "@/lib/stamp-tour";
import { CardSlideData, EventSettings, GeneratedCardSet, GuestbookEntry, MomentEntry, StampPoint } from "@/lib/types";

function buildSlides(params: {
  nickname: string;
  stampCount: number;
  guestbooks: GuestbookEntry[];
  moments: MomentEntry[];
  settings: EventSettings;
}): CardSlideData[] {
  const latestGuestbook = params.guestbooks[0];
  const latestMoment = params.moments[0];
  const badge = TOUR_BADGES[Math.min(Math.max(params.stampCount - 1, 0), TOUR_BADGES.length - 1)];
  return [
    {
      id: "slide-1",
      title: params.settings.cardTemplate.card1Title,
      subtitle: params.nickname || "Guest Archive",
      body: "살아있던 적이 없는 꽃을 팝니다, 그런데 이제 영원히 시들지 않는.",
      accent: "#E9A17A",
    },
    {
      id: "slide-2",
      title: params.settings.cardTemplate.card2Title,
      subtitle: latestGuestbook?.mood ?? "기록 없음",
      body: latestGuestbook?.message ?? "아직 방명록이 없다면 한 줄 메모를 남겨보세요.",
      accent: "#89A67C",
    },
    {
      id: "slide-3",
      title: "순간 기록",
      subtitle: latestMoment ? latestMoment.hashtags.join(" · ") : "기록 없음",
      body: latestMoment?.text ?? "사진 한 장과 함께 오늘의 한순간을 남길 수 있습니다.",
      accent: "#D77B57",
    },
    {
      id: "slide-4",
      title: badge,
      subtitle: params.settings.cardTemplate.badgePrefix,
      body: `${params.settings.cardTemplate.finalMessage} ${params.stampCount}개의 장면을 지나며 오늘의 산책을 완성했습니다.`,
      accent: "#758B68",
    },
  ];
}

export default function CardPage() {
  const { session, stampState, cards, upsertCards } = useFestivalSession();
  const [guestbooks, setGuestbooks] = useState<GuestbookEntry[]>([]);
  const [moments, setMoments] = useState<MomentEntry[]>([]);
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [points, setPoints] = useState<StampPoint[]>(DEFAULT_STAMP_POINTS);
  const [ratio, setRatio] = useState<"story" | "square">("story");

  useEffect(() => {
    fetchEventSettings().then(setSettings).catch(() => setSettings(DEFAULT_EVENT_SETTINGS));
    fetchStampPoints().then(setPoints).catch(() => setPoints(DEFAULT_STAMP_POINTS));
    fetch("/api/guestbook")
      .then((response) => response.json())
      .then((data: GuestbookEntry[]) => setGuestbooks(data.filter((item) => item.guestId === session?.guestId)))
      .catch(() => undefined);
    fetch("/api/moments")
      .then((response) => response.json())
      .then((data: MomentEntry[]) => setMoments(data.filter((item) => item.guestId === session?.guestId)))
      .catch(() => undefined);
  }, [session?.guestId]);

  const completion = evaluateStampCompletion(points, stampState, settings);
  const canGenerate = Boolean(stampState.completedAt) || completion.completed || stampState.acquiredStampIds.length >= settings.stampCompletionRule.requiredCount;
  const draft = useMemo<GeneratedCardSet | null>(() => {
    if (!session || !canGenerate) return null;
    return {
      id: `card-${session.guestId}-${stampState.completedAt ?? "draft"}`,
      guestId: session.guestId,
      createdAt: stampState.completedAt ?? session.createdAt,
      ratio,
      slides: buildSlides({
        nickname: session.nickname || "게스트",
        stampCount: stampState.acquiredStampIds.length,
        guestbooks,
        moments,
        settings,
      }),
    };
  }, [canGenerate, guestbooks, moments, ratio, session, settings, stampState.acquiredStampIds.length, stampState.completedAt]);

  if (!draft) {
    return (
      <main className="app-shell">
        <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
          <h1 className="section-title">카드뉴스 생성</h1>
          <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">
            모든 스탬프를 획득한 뒤 카드뉴스를 만들 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="#8 율량마르쉐 애착꽃시장" tone="petal" />
          <PaperLabel text="기록 카드" tone="leaf" />
        </div>
        <h1 className="section-title mt-4">기록 카드 만들기</h1>
        <p className="mt-3 max-w-[28ch] text-sm leading-7 text-[var(--foreground-soft)]">
          기록물처럼 차분한 템플릿으로 자동 생성되며, 이미지 저장 후 localStorage에 보관됩니다.
        </p>
        <div className="mt-4 flex gap-2">
          {(["story", "square"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRatio(item)}
              className={`rounded-full px-4 py-2 text-xs ${ratio === item ? "bg-[rgba(123,151,117,0.18)] text-[var(--leaf-deep)]" : "border border-[var(--line)] bg-white/70 text-[var(--foreground-soft)]"}`}
            >
              {item === "story" ? "스토리형" : "정사각형"}
            </button>
          ))}
        </div>
      </section>
      <CardNewsPreview
        card={draft}
        saveLabel={settings.cardTemplate.saveButtonLabel}
        onShareReady={(imageDataUrl) => {
          const next = { ...draft, imageDataUrl, thumbnailUrl: imageDataUrl };
          upsertCards([next, ...cards]);
        }}
        onImageReady={async (imageDataUrl) => {
          const next = { ...draft, imageDataUrl, thumbnailUrl: imageDataUrl };
          upsertCards([next, ...cards]);
          await saveGeneratedCard(next);
        }}
      />
      {cards.length > 0 ? (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="section-title">다시 보기</h2>
          <div className="mt-4 grid gap-3">
            {cards.map((card) => (
              <div key={card.id} className="rounded-[1.35rem] border border-[var(--line)] bg-white/70 p-4 text-sm leading-7 text-[var(--foreground-soft)]">
                {new Date(card.createdAt).toLocaleString("ko-KR")}에 저장한 카드
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
