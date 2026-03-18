'use client';

import { useAdminSession, useApiData, fetchApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface QrCodeItem {
  id: string;
  token: string;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
  expiresAt: string | null;
  booth: { id: string; name: string; category: string };
}

export default function AdminQrPage() {
  const { session, loading: authLoading } = useAdminSession();
  const router = useRouter();
  const { data: qrCodes, loading, refetch } = useApiData<QrCodeItem[]>(session ? '/api/qr' : null);
  const [busy, setBusy] = useState<string | null>(null);
  const [printTarget, setPrintTarget] = useState<QrCodeItem | null>(null);

  useEffect(() => { if (!authLoading && !session) router.push('/admin/login'); }, [authLoading, session, router]);

  if (authLoading || loading) return <div className="p-6 text-center">로딩 중...</div>;
  if (!session) return null;

  const handleRefresh = async (boothId: string) => {
    setBusy(boothId);
    await fetchApi('/api/qr', { method: 'POST', body: JSON.stringify({ boothId }) });
    await refetch();
    setBusy(null);
  };

  const handleToggle = async (qrId: string, isActive: boolean) => {
    setBusy(qrId);
    await fetchApi('/api/qr', { method: 'PATCH', body: JSON.stringify({ qrCodeId: qrId, isActive: !isActive }) });
    await refetch();
    setBusy(null);
  };

  const downloadQr = async (token: string, format: 'png' | 'svg', boothName: string) => {
    const res = await fetch(`/api/qr/download?token=${encodeURIComponent(token)}&format=${format}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${boothName}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">QR 코드 관리</h1>
        <button onClick={() => router.push('/admin/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← 대시보드</button>
      </div>

      {!qrCodes?.length && <p className="text-gray-500 text-center py-12">등록된 QR 코드가 없습니다. 부스를 먼저 등록하세요.</p>}

      <div className="grid gap-4">
        {qrCodes?.map(qr => (
          <div key={qr.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${qr.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <h3 className="font-semibold truncate">{qr.booth.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{qr.booth.category}</span>
                </div>
                <p className="text-xs text-gray-500">스캔 {qr.scanCount}회 · 생성 {new Date(qr.createdAt).toLocaleDateString('ko')}</p>
                {qr.expiresAt && <p className="text-xs text-orange-500">만료: {new Date(qr.expiresAt).toLocaleString('ko')}</p>}
              </div>
              <QrImage token={qr.token} size={80} />
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button onClick={() => handleToggle(qr.id, qr.isActive)} disabled={busy === qr.id}
                className={`text-xs px-3 py-1.5 rounded-lg ${qr.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {qr.isActive ? '비활성화' : '활성화'}
              </button>
              <button onClick={() => handleRefresh(qr.booth.id)} disabled={busy === qr.booth.id}
                className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600">갱신</button>
              <button onClick={() => downloadQr(qr.token, 'png', qr.booth.name)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">PNG</button>
              <button onClick={() => downloadQr(qr.token, 'svg', qr.booth.name)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700">SVG</button>
              <button onClick={() => setPrintTarget(qr)} className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600">인쇄용</button>
            </div>
          </div>
        ))}
      </div>

      {/* Print Layout Modal */}
      {printTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPrintTarget(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()} id="printArea">
            <p className="text-sm text-gray-500 mb-2">충주 축제</p>
            <h2 className="text-xl font-bold mb-4">{printTarget.booth.name}</h2>
            <div className="flex justify-center mb-4"><QrImage token={printTarget.token} size={200} /></div>
            <p className="text-sm text-gray-600">QR을 스캔하여 스탬프를 받으세요!</p>
            <div className="mt-6 flex gap-2 justify-center print:hidden">
              <button onClick={() => window.print()} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">인쇄</button>
              <button onClick={() => setPrintTarget(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QrImage({ token, size }: { token: string; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    import('qrcode').then(QRCode => {
      const scanUrl = `${window.location.origin}/stamp/scan?token=${token}`;
      QRCode.toCanvas(canvasRef.current, scanUrl, { width: size, margin: 1 });
    });
  }, [token, size]);
  return <canvas ref={canvasRef} />;
}
