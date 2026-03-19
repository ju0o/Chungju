"use client";

import { useRef, useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { Download, Share2 } from "lucide-react";

const CARD_THEMES = [
  { id: "warm", bg: "linear-gradient(135deg, #FFF5EB 0%, #FFE4CC 100%)", text: "#5E4638", accent: "#E79D73" },
  { id: "green", bg: "linear-gradient(135deg, #F0F7ED 0%, #D4E8CC 100%)", text: "#3D5438", accent: "#7B9775" },
  { id: "sky", bg: "linear-gradient(135deg, #EDF4FA 0%, #CFE2F3 100%)", text: "#2C4A6E", accent: "#6B9EC4" },
  { id: "paper", bg: "linear-gradient(135deg, #FFFAF0 0%, #F5EEE0 100%)", text: "#6B5B4F", accent: "#A89882" },
];

export default function ShareCardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState(CARD_THEMES[0]);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);

  const generate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = 600;
    const h = 800;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // 배경 그래디언트
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.id === "warm" ? "#FFF5EB" : theme.id === "green" ? "#F0F7ED" : theme.id === "sky" ? "#EDF4FA" : "#FFFAF0");
    grad.addColorStop(1, theme.id === "warm" ? "#FFE4CC" : theme.id === "green" ? "#D4E8CC" : theme.id === "sky" ? "#CFE2F3" : "#F5EEE0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 장식 원
    ctx.fillStyle = theme.accent + "20";
    ctx.beginPath();
    ctx.arc(480, 120, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 650, 60, 0, Math.PI * 2);
    ctx.fill();

    // 축제 이름 (상단)
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("#8 율량마르쉐 애착꽃시장", 48, 80);

    // 날짜
    ctx.fillStyle = theme.text + "80";
    ctx.font = "12px sans-serif";
    ctx.fillText("2026.03.28 - 29", 48, 105);

    // 메시지
    ctx.fillStyle = theme.text;
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "left";
    const lines = wrapText(ctx, message || "살아있던 적이 없는 꽃을 팝니다", w - 96, 24);
    let y = 260;
    for (const line of lines) {
      ctx.fillText(`"${line}"`, 48, y);
      y += 40;
    }

    // 닉네임
    ctx.fillStyle = theme.text + "99";
    ctx.font = "16px sans-serif";
    ctx.fillText(`— ${nickname || "방문객"}`, 48, y + 30);

    // 하단 바
    ctx.fillStyle = theme.accent + "30";
    ctx.fillRect(0, h - 80, w, 80);
    ctx.fillStyle = theme.text + "99";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("festival-archive.vercel.app", w / 2, h - 35);

    setGenerated(canvas.toDataURL("image/png"));
  };

  const download = () => {
    if (!generated) return;
    const a = document.createElement("a");
    a.href = generated;
    a.download = `festival-card-${Date.now()}.png`;
    a.click();
  };

  const share = async () => {
    if (!generated) return;
    try {
      const blob = await (await fetch(generated)).blob();
      const file = new File([blob], "festival-card.png", { type: "image/png" });
      if (navigator.share) {
        await navigator.share({ files: [file], title: "축제 기록 카드" });
      } else {
        download();
      }
    } catch {
      download();
    }
  };

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Share Card" tone="petal" />
        </div>
        <h1 className="section-title mt-4">나만의 축제 카드</h1>
        <p className="body-copy mt-3 max-w-[30ch] text-sm text-[var(--foreground-soft)]">
          오늘의 한 줄을 담은 카드를 만들어 SNS에 공유해보세요.
        </p>
      </section>

      {/* 테마 선택 */}
      <div className="grid grid-cols-4 gap-2">
        {CARD_THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t)}
            className={`h-12 rounded-xl border-2 transition-all ${
              theme.id === t.id ? "border-[var(--accent)] scale-105" : "border-[var(--line)]"
            }`}
            style={{ background: t.bg }}
          />
        ))}
      </div>

      {/* 입력 폼 */}
      <div className="section-card rounded-[1.75rem] p-5 grid gap-3">
        <div>
          <label className="text-xs font-semibold text-[var(--foreground-soft)]">닉네임</label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
            placeholder="이름 또는 닉네임"
            maxLength={20}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--foreground-soft)]">오늘의 한 줄</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
            rows={3}
            placeholder="축제에서 느낀 한 줄을 적어보세요"
            maxLength={100}
          />
        </div>
        <button
          onClick={generate}
          className="festival-button festival-button--primary rounded-xl py-2.5 text-sm"
        >
          🎨 카드 만들기
        </button>
      </div>

      {/* 미리보기 */}
      {generated && (
        <div className="section-card rounded-[1.75rem] overflow-hidden">
          <img src={generated} alt="축제 카드" className="w-full" />
          <div className="grid grid-cols-2 gap-2 p-4">
            <button onClick={download} className="festival-button festival-button--paper flex items-center justify-center gap-2 text-sm">
              <Download size={16} /> 저장
            </button>
            <button onClick={share} className="festival-button festival-button--primary flex items-center justify-center gap-2 text-sm">
              <Share2 size={16} /> 공유
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}
