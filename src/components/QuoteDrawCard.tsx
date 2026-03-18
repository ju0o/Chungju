"use client";

import { useState } from "react";
import { BookOpenText, Sparkles } from "lucide-react";
import { CollageOrnaments, PaperLabel } from "@/components/CollageOrnaments";
import { SectionHeader } from "@/components/SectionHeader";
import { QuoteItem } from "@/lib/types";

export function QuoteDrawCard({
  quotes,
  title = "문장 하나 가져가기",
  description = "공원과 꽃시장 사이를 걷다 만난 오늘의 문장을 한 장의 종이 조각처럼 꺼내보세요.",
}: {
  quotes: QuoteItem[];
  title?: string;
  description?: string;
}) {
  const published = quotes.filter((item) => item.isPublished);
  const [quote, setQuote] = useState(published[0] ?? null);

  return (
    <section className="section-card paper-stack soft-pattern relative rounded-[1.75rem] p-5">
      <CollageOrnaments className="opacity-70" />
      <SectionHeader
        eyebrow="Sentence"
        title={title}
        description={description}
      />
      <div className="mt-5 rounded-[1.6rem] border border-dashed border-[rgba(94,86,72,0.2)] bg-[rgba(255,253,248,0.88)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <PaperLabel text="오늘의 문장" tone="petal" />
          <BookOpenText size={18} className="text-[var(--leaf-deep)]" />
        </div>
        <p className="quote-text max-w-[13ch] text-[2rem] text-[var(--foreground)]">{quote?.text ?? ""}</p>
        {quote?.author || quote?.sourceBook ? (
          <p className="mt-4 text-xs leading-6 text-[var(--foreground-soft)]">
            {[quote.author, quote.sourceBook].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setQuote(published[Math.floor(Math.random() * published.length)] ?? published[0] ?? null)}
        className="festival-button festival-button--paper mt-4"
      >
        <Sparkles size={18} />
        다른 문장 뽑기
      </button>
    </section>
  );
}
