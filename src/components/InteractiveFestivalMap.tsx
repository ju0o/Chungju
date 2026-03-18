"use client";

import Image from "next/image";
import { useState } from "react";
import { BoothDetailModal } from "@/components/BoothDetailModal";
import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { MapPointSheet } from "@/components/MapPointSheet";
import { SectionHeader } from "@/components/SectionHeader";
import { BoothProfile, StampPoint } from "@/lib/types";

export function InteractiveFestivalMap({ points, booths = [] }: { points: StampPoint[]; booths?: BoothProfile[] }) {
  const [activeId, setActiveId] = useState(points[0]?.id);
  const [modalOpen, setModalOpen] = useState(false);
  const active = points.find((item) => item.id === activeId) ?? points[0];
  const activeBooth = booths.find((booth) => booth.id === active?.linkedBoothId);

  return (
    <section className="section-card paper-stack relative rounded-[1.75rem] p-5">
      <CollageOrnaments className="opacity-60" />
      <SectionHeader
        eyebrow="Festival Map"
        title="머무는 동선"
        description="포인트를 눌러 이곳이 어떤 공간인지, 여기서 무엇을 할 수 있는지, 다음 장면은 어디인지 확인하세요."
      />
      <div className="mt-5 grid gap-4">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="꽃시장" tone="petal" />
          <PaperLabel text="공원 산책길" tone="leaf" />
          <PaperLabel text="QR 포인트" />
          <PaperLabel text="부스 터치 상세 모달" />
        </div>
        <div className="relative h-80 overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[#f6f0e7] shadow-[var(--shadow-soft)]">
          <Image src="/청주축제.jpg" alt="청주 축제 지도" fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(252,248,242,0.06),rgba(44,37,30,0.1))]" />
          {points.filter((point) => point.isPublished).map((point) => (
            <button
              key={point.id}
              type="button"
              onClick={() => {
                setActiveId(point.id);
                if (point.pointType === "booth" && point.linkedBoothId) {
                  setModalOpen(true);
                } else {
                  setModalOpen(false);
                }
              }}
              className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/90 text-xs font-semibold text-white shadow-lg transition ${active?.id === point.id ? "scale-110 bg-[var(--accent-strong)]" : point.pointType === "booth" ? "bg-[var(--leaf-deep)]" : "bg-[rgba(46,42,35,0.88)]"}`}
              style={{ left: point.x, top: point.y }}
              aria-label={`${point.title} 포인트 열기`}
            >
              {point.title.slice(0, 1)}
            </button>
          ))}
        </div>
        {active ? <MapPointSheet point={active} onOpenBooth={activeBooth ? () => setModalOpen(true) : undefined} /> : null}
      </div>
      {modalOpen && active && activeBooth ? <BoothDetailModal booth={activeBooth} point={active} onClose={() => setModalOpen(false)} /> : null}
    </section>
  );
}
