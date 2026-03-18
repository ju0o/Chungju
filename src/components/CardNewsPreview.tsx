"use client";

import { useRef, useState } from "react";
import { useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Share2 } from "lucide-react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { CardSlide } from "@/components/CardSlide";
import { GeneratedCardSet } from "@/lib/types";

export function CardNewsPreview({
  card,
  onImageReady,
  saveLabel = "이미지 저장하기",
  onShareReady,
}: {
  card: GeneratedCardSet;
  onImageReady: (imageDataUrl: string) => void;
  saveLabel?: string;
  onShareReady?: (imageDataUrl: string) => void;
}) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  async function handleSaveImage() {
    if (!captureRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      onImageReady(dataUrl);
      const link = document.createElement("a");
      link.download = `festival-card-${card.id}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!captureRef.current || !navigator.share) return;
    const dataUrl = await toPng(captureRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });
    onShareReady?.(dataUrl);
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `festival-card-${card.id}.png`, { type: "image/png" });
    await navigator.share({
      title: "축제 기록 카드",
      files: [file],
    });
  }

  return (
    <section className="grid gap-4">
      <div className="section-card rounded-[1.5rem] p-4 text-sm leading-7 text-[var(--foreground-soft)]">
        <div className="mb-3 flex flex-wrap gap-2">
          <PaperLabel text={card.ratio === "story" ? "스토리형 비율" : "정사각형 비율"} tone="petal" />
          <PaperLabel text="저장 후 다시 보기 가능" tone="leaf" />
        </div>
        저장 안내: 버튼을 누르면 이미지가 다운로드됩니다. 모바일에서는 공유 시트 또는 파일 앱으로 저장될 수 있습니다.
      </div>
      <div ref={captureRef} className="grid gap-4">
        {card.slides.map((slide, index) => (
          <CardSlide key={slide.id} slide={slide} index={index} ratio={card.ratio} />
        ))}
      </div>
      <div className="sticky bottom-24 z-20 grid gap-2">
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={saving}
          className="festival-button festival-button--primary"
        >
          <Download size={18} />
          {saveLabel}
        </button>
        {canShare ? (
          <button
            type="button"
            onClick={handleShare}
            className="festival-button festival-button--paper"
          >
            <Share2 size={18} />
            공유하기
          </button>
        ) : null}
      </div>
    </section>
  );
}
