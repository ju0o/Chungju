"use client";

import { useState } from "react";
import { QRCardPreview } from "@/components/QRCardPreview";
import { BoothProfile, EventSettings, StampPoint } from "@/lib/types";

export function StampPointsTab({
  points,
  onChange,
  settings,
  onSettingsChange,
  booths,
}: {
  points: StampPoint[];
  onChange: (next: StampPoint[]) => void;
  settings: EventSettings;
  onSettingsChange: (next: EventSettings) => void;
  booths: BoothProfile[];
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState(points[0]?.id ?? "");

  return (
    <div className="grid gap-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl">Stamp Points</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
          location_type과 booth_type을 구분해서 포인트를 관리하고, 공개/QR 사용 여부, 방문 인증 연결, 부스 상세 연결까지 함께 조정합니다.
        </p>
        <button
          type="button"
          className="mt-4 rounded-full border border-[var(--line)] px-4 py-2 text-sm"
          onClick={() =>
            onChange([
              ...points,
              {
                id: `point-${Date.now()}`,
                slug: `point-${Date.now()}`,
                title: "새 포인트",
                location: "",
                pointType: "location",
                description: "",
                phrase: "",
                color: "#E79D73",
                order: points.length + 1,
                icon: "map-pin",
                x: "50%",
                y: "50%",
                isPublished: true,
                qrEnabled: true,
                rewardCopy: "",
              },
            ])
          }
        >
          포인트 추가
        </button>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <input
            className="festival-input"
            type="number"
            value={settings.stampCompletionRule.requiredCount}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                stampCompletionRule: {
                  ...settings.stampCompletionRule,
                  requiredCount: Number(event.target.value),
                },
              })
            }
            placeholder="필요 스탬프 개수"
          />
          <input
            className="festival-input"
            type="number"
            value={settings.stampCompletionRule.locationRequired}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                stampCompletionRule: {
                  ...settings.stampCompletionRule,
                  locationRequired: Number(event.target.value),
                },
              })
            }
            placeholder="location 필요 개수"
          />
          <input
            className="festival-input"
            type="number"
            value={settings.stampCompletionRule.boothRequired}
            onChange={(event) =>
              onSettingsChange({
                ...settings,
                stampCompletionRule: {
                  ...settings.stampCompletionRule,
                  boothRequired: Number(event.target.value),
                },
              })
            }
            placeholder="booth 필요 개수"
          />
        </div>
        <div className="mt-4 grid gap-3">
          {points.map((point, index) => (
            <div
              key={point.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex === null || dragIndex === index) return;
                const next = [...points];
                const [moved] = next.splice(dragIndex, 1);
                next.splice(index, 0, moved);
                onChange(next.map((item, order) => ({ ...item, order: order + 1 })));
                setDragIndex(null);
              }}
              className="rounded-[1.35rem] border border-[var(--line)] bg-white/70 p-4"
            >
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  className="festival-input"
                  value={point.title}
                  placeholder="포인트 이름"
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], title: e.target.value };
                    onChange(next);
                  }}
                />
                <input
                  className="festival-input"
                  value={point.slug}
                  placeholder="slug"
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], slug: e.target.value };
                    onChange(next);
                  }}
                />
                <select
                  className="festival-input"
                  value={point.pointType}
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], pointType: e.target.value as StampPoint["pointType"] };
                    onChange(next);
                  }}
                >
                  <option value="location">location</option>
                  <option value="booth">booth</option>
                </select>
                <input
                  className="festival-input"
                  value={point.location}
                  placeholder="포인트 위치"
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], location: e.target.value };
                    onChange(next);
                  }}
                />
                <select
                  className="festival-input"
                  value={point.linkedBoothId ?? ""}
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], linkedBoothId: e.target.value || undefined };
                    onChange(next);
                  }}
                >
                  <option value="">연결할 부스 없음</option>
                  {booths.map((booth) => (
                    <option key={booth.id} value={booth.id}>
                      {booth.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="festival-input festival-textarea mt-2"
                value={point.description}
                placeholder="설명"
                onChange={(e) => {
                  const next = [...points];
                  next[index] = { ...next[index], description: e.target.value };
                  onChange(next);
                }}
              />
              <textarea
                className="festival-input festival-textarea mt-2"
                value={point.phrase}
                placeholder="짧은 안내 문구"
                onChange={(e) => {
                  const next = [...points];
                  next[index] = { ...next[index], phrase: e.target.value };
                  onChange(next);
                }}
              />
              <input
                className="festival-input mt-2"
                value={point.rewardCopy}
                placeholder="방문 인증 완료 메시지"
                onChange={(e) => {
                  const next = [...points];
                  next[index] = { ...next[index], rewardCopy: e.target.value };
                  onChange(next);
                }}
              />
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                <input
                  className="festival-input"
                  value={point.x}
                  placeholder="map x"
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], x: e.target.value };
                    onChange(next);
                  }}
                />
                <input
                  className="festival-input"
                  value={point.y}
                  placeholder="map y"
                  onChange={(e) => {
                    const next = [...points];
                    next[index] = { ...next[index], y: e.target.value };
                    onChange(next);
                  }}
                />
                <label className="flex items-center gap-2 rounded-[1rem] border border-[var(--line)] bg-white/70 px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={point.isPublished}
                    onChange={() => {
                      const next = [...points];
                      next[index] = { ...next[index], isPublished: !next[index].isPublished };
                      onChange(next);
                    }}
                  />
                  공개
                </label>
                <label className="flex items-center gap-2 rounded-[1rem] border border-[var(--line)] bg-white/70 px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={point.qrEnabled !== false}
                    onChange={() => {
                      const next = [...points];
                      next[index] = { ...next[index], qrEnabled: !(next[index].qrEnabled !== false) };
                      onChange(next);
                    }}
                  />
                  QR 사용
                </label>
              </div>
              <button
                type="button"
                className="mt-3 rounded-full border border-[var(--line)] px-4 py-2 text-xs"
                onClick={() => setPreviewId(point.id)}
              >
                QR 카드 미리보기
              </button>
            </div>
          ))}
        </div>
      </section>
      {points.find((point) => point.id === previewId) ? <QRCardPreview point={points.find((point) => point.id === previewId)!} /> : null}
    </div>
  );
}
