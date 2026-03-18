import { useState } from "react";
import { ProgramItem } from "@/lib/types";

export function ProgramsTab({
  items,
  onChange,
  canEditAll,
}: {
  items: ProgramItem[];
  onChange: (next: ProgramItem[]) => void;
  canEditAll: boolean;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">프로그램 관리</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              const next = [...items];
              const [moved] = next.splice(dragIndex, 1);
              next.splice(index, 0, moved);
              onChange(next.map((program, order) => ({ ...program, order: order + 1 })));
              setDragIndex(null);
            }}
            className="rounded-2xl border border-[var(--line)] p-4"
          >
            <input
              className="festival-input"
              value={item.time}
              disabled={!canEditAll}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...next[index], time: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={item.title}
              disabled={!canEditAll}
              onChange={(e) => {
                const next = [...items];
                next[index] = { ...next[index], title: e.target.value };
                onChange(next);
              }}
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-[var(--muted)]">{item.location}</span>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.isPublished}
                  onChange={() => {
                    const next = [...items];
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
