'use client';

import { useState, useRef, useCallback } from 'react';
import { useApiData } from '@/hooks/useApi';
import Link from 'next/link';

interface StampScan {
  id: string;
  scannedAt: string;
  qrCode: {
    booth: { id: string; name: string; category: string };
  };
}

interface StampData {
  progress: Array<{
    totalStamps: number;
    isCompleted: boolean;
    completedAt: string | null;
    stampCampaign: { name: string; requiredStamps: number };
  }>;
  scans: StampScan[];
  totalStamps: number;
}

const THEMES = [
  { id: 'spring', label: '봄가든', bg: '#FFF8F0', accent: '#E9A17A', secondary: '#89A67C', border: '#D98B8B' },
  { id: 'flower', label: '꽃시장', bg: '#FFF5F5', accent: '#D77B57', secondary: '#D98B8B', border: '#E9A17A' },
  { id: 'leaf', label: '공원산책', bg: '#F5FAF0', accent: '#89A67C', secondary: '#A3B18A', border: '#6B8F5B' },
  { id: 'night', label: '봄밤', bg: '#2C2C3A', accent: '#E9A17A', secondary: '#B8A9C9', border: '#D98B8B' },
] as const;

export default function CertificatePage() {
  const { data, loading } = useApiData<StampData>('/api/stamps/my');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nickname, setNickname] = useState(() => {
    if (typeof window === 'undefined') return '';
    const saved = localStorage.getItem('festival-archive-session');
    if (!saved) return '';
    try {
      const parsed = JSON.parse(saved);
      return typeof parsed?.nickname === 'string' ? parsed.nickname : '';
    } catch {
      return '';
    }
  });
  const [theme, setTheme] = useState<(typeof THEMES)[number]>(THEMES[0]);
  const [generated, setGenerated] = useState(false);

  const generateCertificate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;

    const W = 1080, H = 1440;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = theme.id === 'night';
    const textColor = isDark ? '#F0EDE8' : '#3C2A1E';
    const softColor = isDark ? '#B0A8A0' : '#8C7B6B';

    // Background
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    // Decorative border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    const m = 40;
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(m + 12, m + 12, W - 2 * (m + 12), H - 2 * (m + 12));

    // Corner ornaments
    const corners = [[m + 20, m + 20], [W - m - 20, m + 20], [m + 20, H - m - 20], [W - m - 20, H - m - 20]];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top icon
    ctx.font = '64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌸', W / 2, 120);

    // Title
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('방문 인증서', W / 2, 200);

    // Subtitle
    ctx.fillStyle = softColor;
    ctx.font = '22px sans-serif';
    ctx.fillText('CERTIFICATE OF VISIT', W / 2, 240);

    // Divider
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(200, 270);
    ctx.lineTo(W - 200, 270);
    ctx.stroke();

    // Festival name
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('#8 율량마르쉐 애착꽃시장', W / 2, 340);

    ctx.fillStyle = softColor;
    ctx.font = '20px sans-serif';
    ctx.fillText('2026.03.28 - 29 · 청주 율량동 공원', W / 2, 380);

    // Nickname section
    ctx.fillStyle = theme.accent;
    ctx.font = '18px sans-serif';
    ctx.fillText('— 방 문 자 —', W / 2, 450);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(nickname || '방문객', W / 2, 510);

    // Stats section
    const totalStamps = data.totalStamps;
    const completed = data.progress.some(p => p.isCompleted);
    const visitedBooths = data.scans.map(s => s.qrCode.booth.name);
    const uniqueBooths = [...new Set(visitedBooths)];

    ctx.fillStyle = softColor;
    ctx.font = '18px sans-serif';
    ctx.fillText('— 방 문 기 록 —', W / 2, 590);

    // Stamp count circle
    const cx = W / 2, cy = 690;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fillStyle = theme.accent + '20';
    ctx.fill();
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(`${totalStamps}`, cx, cy + 12);
    ctx.font = '14px sans-serif';
    ctx.fillText('스탬프 획득', cx, cy + 40);

    // Completion badge
    if (completed) {
      ctx.fillStyle = theme.secondary;
      ctx.font = '28px sans-serif';
      ctx.fillText('🏆 스탬프 투어 완료!', W / 2, 800);
    }

    // Visited booths list
    if (uniqueBooths.length > 0) {
      ctx.fillStyle = softColor;
      ctx.font = '16px sans-serif';
      ctx.fillText('방문 부스', W / 2, 870);

      ctx.fillStyle = textColor;
      ctx.font = '20px sans-serif';
      uniqueBooths.slice(0, 6).forEach((boothName, i) => {
        ctx.fillText(`✦ ${boothName}`, W / 2, 910 + i * 36);
      });
    }

    // Scan timeline (last 3)
    const recentScans = data.scans.slice(0, 3);
    if (recentScans.length > 0) {
      const startY = uniqueBooths.length > 0 ? 910 + Math.min(uniqueBooths.length, 6) * 36 + 40 : 870;
      ctx.fillStyle = softColor;
      ctx.font = '14px sans-serif';
      recentScans.forEach((scan, i) => {
        const date = new Date(scan.scannedAt);
        ctx.fillText(
          `${date.toLocaleDateString('ko-KR')} ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} — ${scan.qrCode.booth.name}`,
          W / 2,
          startY + i * 28
        );
      });
    }

    // Bottom decorative line
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(200, H - 200);
    ctx.lineTo(W - 200, H - 200);
    ctx.stroke();

    // Footer message
    ctx.fillStyle = softColor;
    ctx.font = '16px sans-serif';
    ctx.fillText('살아있던 적이 없는 꽃을 팝니다,', W / 2, H - 160);
    ctx.fillText('그런데 이제 영원히 시들지 않는.', W / 2, H - 135);

    // Issue date
    ctx.fillStyle = softColor;
    ctx.font = '14px sans-serif';
    const now = new Date();
    ctx.fillText(`발급일: ${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`, W / 2, H - 90);

    setGenerated(true);
  }, [data, nickname, theme]);

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `축제인증서_${nickname || '방문객'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareCertificate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'certificate.png', { type: 'image/png' });
      if (navigator.share) {
        try {
          await navigator.share({ title: '축제 방문 인증서', files: [file] });
        } catch { /* cancelled */ }
      }
    }, 'image/png');
  };

  if (loading) {
    return (
      <main className="app-shell p-4 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-coral)] border-t-transparent" />
      </main>
    );
  }

  if (!data || data.totalStamps === 0) {
    return (
      <main className="app-shell grid gap-4 p-4">
        <section className="section-card rounded-[1.75rem] p-8 text-center">
          <div className="text-5xl mb-4">📜</div>
          <h1 className="section-title text-lg font-bold mb-2">방문 인증서</h1>
          <p className="body-copy text-sm text-[var(--foreground-soft)]">
            스탬프를 1개 이상 획득하면 방문 인증서를 발급받을 수 있어요!
          </p>
          <Link href="/stamp" className="festival-button primary mt-4 inline-block rounded-xl px-6 py-2 text-sm">
            스탬프 투어 시작하기
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell grid gap-4 p-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <h1 className="section-title text-lg font-bold">📜 방문 인증서 발급</h1>
        <p className="body-copy mt-1 text-sm text-[var(--foreground-soft)]">
          축제 방문 기록을 인증서로 만들어 보관하세요
        </p>
      </section>

      {/* 설정 */}
      <section className="section-card rounded-[1.75rem] p-5 grid gap-4">
        <div>
          <label className="text-xs font-medium text-[var(--foreground-soft)]">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="인증서에 표시될 이름"
            maxLength={20}
            className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white/70 p-3 text-sm focus:border-[var(--accent-coral)] focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--foreground-soft)]">테마</label>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t); setGenerated(false); }}
                className={`rounded-xl border-2 p-3 text-center text-xs transition-all ${
                  theme.id === t.id ? 'border-[var(--accent-coral)] shadow-md' : 'border-[var(--line)]'
                }`}
                style={{ backgroundColor: t.bg }}
              >
                <div className="h-4 w-4 mx-auto mb-1 rounded-full" style={{ backgroundColor: t.accent }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={generateCertificate}
          className="festival-button primary w-full rounded-xl py-3 text-sm font-semibold"
        >
          인증서 생성하기
        </button>
      </section>

      {/* 캔버스 미리보기 */}
      <section className="section-card rounded-[1.75rem] p-5">
        <canvas ref={canvasRef} className="w-full rounded-xl border border-[var(--line)]" style={{ aspectRatio: '3/4' }} />
        {generated && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={downloadCertificate} className="festival-button primary rounded-xl py-3 text-sm">
              📥 이미지 저장
            </button>
            <button onClick={shareCertificate} className="festival-button paper rounded-xl py-3 text-sm border border-[var(--line)]">
              📤 공유하기
            </button>
          </div>
        )}
      </section>

      <div className="text-center">
        <Link href="/" className="text-xs text-[var(--foreground-soft)] underline">← 홈으로 돌아가기</Link>
      </div>
    </main>
  );
}
