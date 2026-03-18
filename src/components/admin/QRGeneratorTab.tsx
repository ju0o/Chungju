"use client";

import { useMemo, useState } from "react";
import { QRCardPreview } from "@/components/QRCardPreview";
import { StampPoint } from "@/lib/types";

export function QRGeneratorTab({ points }: { points: StampPoint[] }) {
  const published = useMemo(() => points.filter((point) => point.isPublished && point.qrEnabled !== false), [points]);
  const [selectedId, setSelectedId] = useState(published[0]?.id ?? points[0]?.id ?? "");
  const selected = published.find((point) => point.id === selectedId) ?? points[0];

  return (
    <div className="grid gap-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl">QR Generator</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
          스탬프 포인트를 선택하면 QR 미리보기와 출력용 카드 이미지를 바로 다운로드할 수 있습니다.
        </p>
        <select
          className="festival-input mt-4"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {published.map((point) => (
            <option key={point.id} value={point.id}>
              {point.title} · {point.slug}
            </option>
          ))}
        </select>
      </section>
      {selected ? <QRCardPreview point={selected} /> : null}
    </div>
  );
}
