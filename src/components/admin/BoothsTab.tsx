import { useState } from "react";
import { BoothProfile } from "@/lib/types";

export function BoothsTab({
  booths,
  onChange,
}: {
  booths: BoothProfile[];
  onChange: (next: BoothProfile[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">문화 부스 / 작가 관리</h2>
      <button
        type="button"
        className="mt-4 rounded-full border border-[var(--line)] px-4 py-2 text-sm"
        onClick={() =>
          onChange([
            ...booths,
            {
              id: `booth-${Date.now()}`,
              name: "새 부스",
              authorName: "",
              subtitle: "",
              description: "",
              bookTitle: "",
              imageUrl: "",
              bookDescription: "",
              quote: "",
              favoriteQuote: "",
              authorMessage: "",
              bookPrice: "",
              bookStock: 0,
              participationType: "현장 판매",
              isOnsite: true,
              isConsignment: false,
              link: "",
              snsLink: "",
              mapLabel: "",
              order: booths.length + 1,
            },
          ])
        }
      >
        부스 / 작가 추가
      </button>
      <div className="mt-4 grid gap-3">
        {booths.map((booth, index) => (
          <div
            key={booth.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragIndex === null || dragIndex === index) return;
              const next = [...booths];
              const [moved] = next.splice(dragIndex, 1);
              next.splice(index, 0, moved);
              onChange(next.map((item, order) => ({ ...item, order: order + 1 })));
              setDragIndex(null);
            }}
            className="rounded-2xl border border-[var(--line)] p-4"
          >
            <input
              className="festival-input"
              value={booth.name}
              placeholder="부스 이름"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], name: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={booth.authorName ?? ""}
              placeholder="작가 이름"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], authorName: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={booth.subtitle}
              placeholder="부스 한 줄 소개"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], subtitle: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={booth.bookTitle}
              placeholder="책 제목"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], bookTitle: e.target.value };
                onChange(next);
              }}
            />
            <textarea
              className="festival-input festival-textarea mt-2"
              value={booth.bookDescription ?? ""}
              placeholder="책 소개"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], bookDescription: e.target.value };
                onChange(next);
              }}
            />
            <textarea
              className="festival-input festival-textarea mt-2"
              value={booth.description}
              placeholder="부스 소개"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], description: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={booth.imageUrl ?? ""}
              placeholder="대표 이미지 경로"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], imageUrl: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={booth.bookPrice ?? ""}
              placeholder="책 가격"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], bookPrice: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              value={booth.participationType}
              placeholder="참여 방식"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], participationType: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              type="number"
              value={booth.bookStock ?? 0}
              placeholder="재고"
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], bookStock: Number(e.target.value) };
                onChange(next);
              }}
            />
            <textarea
              className="festival-input festival-textarea mt-2"
              placeholder="기본 문장"
              value={booth.quote}
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], quote: e.target.value };
                onChange(next);
              }}
            />
            <textarea
              className="festival-input festival-textarea mt-2"
              placeholder="대표 문장"
              value={booth.favoriteQuote ?? ""}
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], favoriteQuote: e.target.value };
                onChange(next);
              }}
            />
            <textarea
              className="festival-input festival-textarea mt-2"
              placeholder="작가의 말"
              value={booth.authorMessage ?? ""}
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], authorMessage: e.target.value };
                onChange(next);
              }}
            />
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <label className="flex items-center gap-2 rounded-[1rem] border border-[var(--line)] bg-white/70 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={booth.isOnsite}
                  onChange={() => {
                    const next = [...booths];
                    next[index] = { ...next[index], isOnsite: !next[index].isOnsite };
                    onChange(next);
                  }}
                />
                현장 상주
              </label>
              <label className="flex items-center gap-2 rounded-[1rem] border border-[var(--line)] bg-white/70 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={booth.isConsignment}
                  onChange={() => {
                    const next = [...booths];
                    next[index] = { ...next[index], isConsignment: !next[index].isConsignment };
                    onChange(next);
                  }}
                />
                위탁 참여
              </label>
            </div>
            <input
              className="festival-input mt-2"
              placeholder="지도 라벨"
              value={booth.mapLabel ?? ""}
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], mapLabel: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              placeholder="외부 링크"
              value={booth.link ?? ""}
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], link: e.target.value };
                onChange(next);
              }}
            />
            <input
              className="festival-input mt-2"
              placeholder="SNS 링크"
              value={booth.snsLink ?? ""}
              onChange={(e) => {
                const next = [...booths];
                next[index] = { ...next[index], snsLink: e.target.value };
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
