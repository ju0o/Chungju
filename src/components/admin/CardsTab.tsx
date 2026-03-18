import Image from "next/image";
import { CardTemplateSettings, GeneratedCardSet } from "@/lib/types";

export function CardsTab({
  cardTemplate,
  onChange,
  cards = [],
}: {
  cardTemplate: CardTemplateSettings;
  onChange: (next: CardTemplateSettings) => void;
  cards?: GeneratedCardSet[];
}) {
  return (
    <section className="section-card rounded-[1.75rem] p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-3xl">카드뉴스 설정</h2>
      <div className="mt-4 grid gap-3">
        <input className="festival-input" value={cardTemplate.card1Title} onChange={(e) => onChange({ ...cardTemplate, card1Title: e.target.value })} />
        <input className="festival-input" value={cardTemplate.card2Title} onChange={(e) => onChange({ ...cardTemplate, card2Title: e.target.value })} />
        <textarea className="festival-input festival-textarea" value={cardTemplate.finalMessage} onChange={(e) => onChange({ ...cardTemplate, finalMessage: e.target.value })} />
        <input className="festival-input" value={cardTemplate.badgePrefix} onChange={(e) => onChange({ ...cardTemplate, badgePrefix: e.target.value })} />
        <input className="festival-input" value={cardTemplate.saveButtonLabel} onChange={(e) => onChange({ ...cardTemplate, saveButtonLabel: e.target.value })} />
      </div>
      {cards.length > 0 ? (
        <div className="mt-5 grid gap-3">
          <p className="text-sm font-semibold">저장된 카드 예시</p>
          <div className="grid grid-cols-2 gap-3">
            {cards.slice(0, 4).map((card) => (
              <div key={card.id} className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white/70">
                {card.thumbnailUrl ? (
                  <div className="relative aspect-square">
                    <Image src={card.thumbnailUrl} alt={card.id} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-square bg-[linear-gradient(135deg,rgba(214,93,56,0.12),rgba(97,115,99,0.12))]" />
                )}
                <div className="p-3 text-xs text-[var(--muted)]">{new Date(card.createdAt).toLocaleDateString("ko-KR")}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
