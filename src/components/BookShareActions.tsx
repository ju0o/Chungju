"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function BookShareActions({
  path,
  title,
  author,
  compact = false,
}: {
  path: string;
  title: string;
  author: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(path);
  const [message, setMessage] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${path}`);
  }, [path]);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 1800);
  };

  const copyToClipboard = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  const share = async () => {
    try {
      const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
      if (nav.share) {
        try {
          await nav.share({ title, text: `${author} 도서 상세페이지`, url: shareUrl });
          return;
        } catch {
          // 공유 취소 또는 미지원 에러 시 복사로 폴백
        }
      }
      await copyToClipboard(shareUrl);
      setCopied(true);
      notify("링크가 복사되었습니다.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify("링크 복사에 실패했습니다.");
    }
  };

  const downloadQr = async () => {
    try {
      setQrLoading(true);
      const dataUrl = await QRCode.toDataURL(shareUrl, {
        width: 1200,
        margin: 2,
        color: { dark: "#1f1b16", light: "#fffdf8" },
      });
      const a = document.createElement("a");
      const safeTitle = title.replace(/[\\/:*?"<>|]/g, "").trim() || "book";
      a.href = dataUrl;
      a.download = `${safeTitle}-qr.png`;
      a.click();
      notify("QR 이미지가 저장되었습니다.");
    } catch {
      notify("QR 생성에 실패했습니다.");
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className={`grid gap-2 ${compact ? "" : "rounded-xl border border-[var(--line)] bg-white/80 p-3"}`}>
      <p className="text-[11px] text-[var(--foreground-soft)] break-all">{shareUrl}</p>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={share} className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--foreground-soft)]">
          {copied ? "링크 복사 완료" : "공유 링크 만들기"}
        </button>
        <button type="button" onClick={downloadQr} disabled={qrLoading} className="rounded-full border border-[rgba(123,151,117,0.34)] bg-[rgba(123,151,117,0.12)] px-3 py-1 text-xs text-[var(--leaf-deep)] disabled:opacity-60">
          {qrLoading ? "QR 생성 중..." : "QR 이미지 자동 생성"}
        </button>
      </div>
      {message ? <p className="text-[11px] text-[var(--foreground-soft)]">{message}</p> : null}
    </div>
  );
}
