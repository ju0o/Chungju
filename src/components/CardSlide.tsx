import { PaperLabel } from "@/components/CollageOrnaments";
import { CardSlideData } from "@/lib/types";

export function CardSlide({
  slide,
  index,
  ratio = "story",
}: {
  slide: CardSlideData;
  index: number;
  ratio?: "square" | "story";
}) {
  return (
    <div
      className={`section-card grain soft-pattern flex flex-col justify-between overflow-hidden rounded-[2rem] p-6 ${ratio === "story" ? "aspect-[9/16]" : "aspect-square"}`}
      style={{
        background: `linear-gradient(180deg, ${slide.accent}22 0%, rgba(255,251,245,0.96) 44%, rgba(255,251,245,1) 100%)`,
      }}
    >
      <div>
        <PaperLabel text={`Archive ${index + 1}`} tone={index % 2 === 0 ? "petal" : "leaf"} />
        <h3 className="mt-4 max-w-[10ch] font-[family-name:var(--font-heading)] text-[2.45rem] leading-[1.16] tracking-[-0.03em]">
          {slide.title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">{slide.subtitle}</p>
      </div>
      <p className="quote-text max-w-[14rem] text-[1.05rem] leading-8 text-[var(--foreground)]">{slide.body}</p>
    </div>
  );
}
