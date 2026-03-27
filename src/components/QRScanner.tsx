"use client";

import { useEffect, useRef, useState } from "react";
import { X, RefreshCw } from "lucide-react";

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
};

export function QRScanner({
  onScan,
  onClose,
}: {
  onScan: (data: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const isDetectorSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
      }
    }

    if (isDetectorSupported === true) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isDetectorSupported]);

  useEffect(() => {
    if (isDetectorSupported !== true || !videoRef.current) return;

    let active = true;
    let animationFrameId: number | null = null;
    const Detector = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Detector) return;
    const barcodeDetector = new Detector({
      formats: ["qr_code"],
    });

    async function detect() {
      if (!active || !videoRef.current) return;

      try {
        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            onScan(barcodes[0].rawValue);
            active = false;
            return;
          }
        }
      } catch (err) {
        console.error("Detection error:", err);
      }

      if (active) {
        animationFrameId = requestAnimationFrame(detect);
      }
    }

    detect();

    return () => {
      active = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isDetectorSupported, onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-semibold">QR 코드 스캔</h2>
        <button onClick={onClose} className="rounded-full bg-white/20 p-2">
          <X size={24} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden bg-black flex items-center justify-center">
        {isDetectorSupported === false ? (
          <div className="p-8 text-center text-white">
            <p className="text-xl mb-4">😅</p>
            <p className="mb-6 text-sm opacity-80">
              죄송합니다. 현재 브라우저에서는 인앱 QR 스캔 기능을 지원하지 않습니다.
              기본 카메라 앱으로 QR 코드를 스캔하여 접속해주세요.
            </p>
            <button
              onClick={onClose}
              className="festival-button festival-button--primary w-full"
            >
              닫기
            </button>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-white">
            <p className="mb-4 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="festival-button festival-button--primary flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> 다시 시도
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {/* 스캐닝 가이드 UI */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[var(--accent-coral)] rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[var(--accent-coral)] rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[var(--accent-coral)] rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[var(--accent-coral)] rounded-br-xl" />
                
                {/* 스캐닝 라인 애니메이션 */}
                <div className="absolute top-0 left-4 right-4 h-1 bg-[var(--accent-coral)]/50 shadow-[0_0_15px_var(--accent-coral)] animate-scan-line" />
              </div>
            </div>
            <div className="absolute bottom-12 left-0 right-0 text-center text-white/70 text-sm">
              <p>부스에 비치된 QR 코드를 사각형 안에 맞춰주세요</p>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
