import { useState } from "react";
import { StampPoint } from "@/lib/types";

export function StampsTab({
  points,
  onChange,
}: {
  points: StampPoint[];
  onChange: (next: StampPoint[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">스탬프 / 지도 관리</h2>
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
            className="rounded-2xl border border-[var(--line)] p-4"
          >
            <input
              className="festival-input"
              value={point.title}
              onChange={(e) => {
                const next = [...points];
                next[index] = { ...next[index], title: e.target.value };
                onChange(next);
              }}
            />
            <textarea
              className="festival-input festival-textarea mt-2"
              value={point.description}
              onChange={(e) => {
                const next = [...points];
                next[index] = { ...next[index], description: e.target.value };
                onChange(next);
              }}
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>{point.slug} · 좌표 {point.x}, {point.y}</span>
              <label className="flex items-center gap-2">
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
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
