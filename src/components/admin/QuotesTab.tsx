import { QuoteItem } from "@/lib/types";

export function QuotesTab({
  quotes,
  onChange,
}: {
  quotes: QuoteItem[];
  onChange: (next: QuoteItem[]) => void;
}) {
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">문장 뽑기 관리</h2>
      <div className="mt-4 grid gap-3">
        {quotes.map((quote, index) => (
          <div key={quote.id} className="rounded-2xl border border-[var(--line)] p-4">
            <textarea
              className="festival-input festival-textarea"
              value={quote.text}
              onChange={(e) => {
                const next = [...quotes];
                next[index] = { ...next[index], text: e.target.value };
                onChange(next);
              }}
            />
            <label className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={quote.isPublished}
                onChange={() => {
                  const next = [...quotes];
                  next[index] = { ...next[index], isPublished: !next[index].isPublished };
                  onChange(next);
                }}
              />
              공개
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
