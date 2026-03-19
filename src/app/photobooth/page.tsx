"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { Camera, Download, RotateCcw } from "lucide-react";

const FRAMES = [
  { id: "spring", label: "봄꽃", borderColor: "#E79D73", overlayText: "#8 율량마르쉐 애착꽃시장" },
  { id: "leaf", label: "초록잎", borderColor: "#7B9775", overlayText: "2026.03.28-29 봄의 기록" },
  { id: "paper", label: "종이", borderColor: "#A89882", overlayText: "살아있던 적이 없는 꽃을 팝니다" },
];

export default function PhotoboothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [frame, setFrame] = useState(FRAMES[0]);
  const [streaming, setStreaming] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
        setCameraError(false);
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setStreaming(false);
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = 720;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // 배경 (프레임 색)
    ctx.fillStyle = frame.borderColor;
    ctx.fillRect(0, 0, size, size);

    // 사진 (약간 안쪽, 정사각형 crop)
    const padding = 32;
    const photoSize = size - padding * 2;
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cropSize = Math.min(vw, vh);
    const sx = (vw - cropSize) / 2;
    const sy = (vh - cropSize) / 2;
    ctx.drawImage(video, sx, sy, cropSize, cropSize, padding, padding, photoSize, photoSize);

    // 하단 텍스트 배경
    ctx.fillStyle = "rgba(255,250,244,0.88)";
    ctx.fillRect(padding, size - padding - 52, photoSize, 52);

    // 텍스트
    ctx.fillStyle = "#5E4638";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(frame.overlayText, size / 2, size - padding - 20);

    // 날짜
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#A89882";
    const now = new Date();
    ctx.fillText(
      `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
      size / 2,
      size - padding - 4,
    );

    setPhoto(canvas.toDataURL("image/png"));
    stopCamera();
  };

  const download = () => {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = `festival-photo-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    setPhoto(null);
    startCamera();
  };

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Photo Booth" tone="petal" />
        </div>
        <h1 className="section-title mt-4">포토부스</h1>
        <p className="body-copy mt-3 max-w-[30ch] text-sm text-[var(--foreground-soft)]">
          축제 프레임으로 특별한 사진을 남겨보세요.
        </p>
      </section>

      {/* 프레임 선택 */}
      <div className="grid grid-cols-3 gap-2">
        {FRAMES.map((f) => (
          <button
            key={f.id}
            onClick={() => setFrame(f)}
            className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
              frame.id === f.id ? "border-[var(--accent)]" : "border-[var(--line)]"
            }`}
            style={{ color: f.borderColor }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 카메라/사진 영역 */}
      <div className="section-card rounded-[1.75rem] overflow-hidden">
        {photo ? (
          <div className="relative">
            <img src={photo} alt="촬영된 사진" className="w-full" />
            <div className="grid grid-cols-2 gap-2 p-4">
              <button onClick={reset} className="festival-button festival-button--paper flex items-center justify-center gap-2 text-sm">
                <RotateCcw size={16} /> 다시 찍기
              </button>
              <button onClick={download} className="festival-button festival-button--primary flex items-center justify-center gap-2 text-sm">
                <Download size={16} /> 저장하기
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative aspect-square bg-black/5">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ borderColor: frame.borderColor, borderWidth: "8px", borderStyle: "solid" }}
              />
              {!streaming && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={startCamera}
                    className="festival-button festival-button--primary flex items-center gap-2 rounded-full px-6 py-3 text-sm"
                  >
                    <Camera size={18} />
                    카메라 시작
                  </button>
                </div>
              )}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <div>
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm text-[var(--foreground-soft)]">
                      카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {streaming && (
              <div className="p-4">
                <button
                  onClick={capture}
                  className="festival-button festival-button--primary flex w-full items-center justify-center gap-2 text-sm"
                >
                  <Camera size={16} />
                  📸 촬영하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
