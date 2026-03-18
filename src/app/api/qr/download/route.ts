import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const format = searchParams.get('format') || 'png';

    if (!token) {
      return NextResponse.json({ error: 'token required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
    const scanUrl = `${baseUrl}/stamp/scan?token=${encodeURIComponent(token)}`;

    if (format === 'svg') {
      const svg = await QRCode.toString(scanUrl, { type: 'svg', width: 400, margin: 2 });
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="qr-${token.slice(0, 8)}.svg"`,
        },
      });
    }

    const buffer = await QRCode.toBuffer(scanUrl, { width: 400, margin: 2, type: 'png' });
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="qr-${token.slice(0, 8)}.png"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
