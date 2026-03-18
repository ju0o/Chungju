"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { PaperLabel } from "@/components/CollageOrnaments";
import { getStampUrl } from "@/lib/stamp-tour";
import { StampPoint } from "@/lib/types";

export function QRCardPreview({ point }: { point: StampPoint }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const url = getStampUrl(point.slug);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 240,
      margin: 1,
      color: {
        dark: "#2E2A23",
        light: "#FFF9F1",
      },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(""));
  }, [url]);

  async function downloadDataUrl(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.click();
  }

  return (
    <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
      <div className="flex flex-wrap gap-2">
        <PaperLabel text={point.pointType === "location" ? "location_type" : "booth_type"} tone="leaf" />
        <PaperLabel text="#8 율량마르쉐 애착꽃시장" tone="petal" />
      </div>
      <div ref={cardRef} className="mt-4 rounded-[1.6rem] border border-[var(--line)] bg-[rgba(255,251,244,0.9)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-soft)]">QR Print Card</p>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-[2rem] leading-tight">{point.title}</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">{point.description}</p>
        <div className="mt-5 flex justify-center rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white/80 p-4">
          {qrDataUrl ? (
            <div className="relative h-48 w-48">
              <Image src={qrDataUrl} alt={`${point.title} QR`} fill unoptimized className="rounded-xl object-contain" />
            </div>
          ) : (
            <div className="h-48 w-48 animate-pulse rounded-xl bg-[rgba(94,86,72,0.08)]" />
          )}
        </div>
        <p className="mt-4 text-xs leading-6 text-[var(--foreground-soft)]">
          {point.phrase}
          <br />
          {url}
        </p>
      </div>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={() => qrDataUrl && downloadDataUrl(qrDataUrl, `${point.slug}-qr.png`)}
          className="festival-button festival-button--paper"
        >
          <Download size={18} />
          QR PNG 다운로드
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!cardRef.current) return;
            const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
            await downloadDataUrl(dataUrl, `${point.slug}-qr-card.png`);
          }}
          className="festival-button festival-button--primary"
        >
          <Download size={18} />
          출력용 카드 다운로드
        </button>
      </div>
    </section>
  );
}
