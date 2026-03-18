import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, logAudit } from '@/lib/auth';
import { createOrRefreshQrCode, getQrScanUrl } from '@/lib/qr-stamp';

// 부스별 QR 코드 조회 (관리자)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const festivalId = searchParams.get('festivalId');

    const where: Record<string, unknown> = {};
    if (festivalId) {
      where.booth = { festivalId };
    }

    const qrCodes = await prisma.boothQrCode.findMany({
      where,
      include: {
        booth: {
          select: { id: true, name: true, category: true, festivalId: true, festival: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const qrCodesWithUrl = qrCodes.map((qr) => ({
      ...qr,
      scanUrl: getQrScanUrl(qr.token),
    }));

    return NextResponse.json({ success: true, data: qrCodesWithUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'QR 코드 조회 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// QR 코드 재발급
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();
    const { boothId, validFrom, validUntil } = body;

    if (!boothId) {
      return NextResponse.json({ success: false, error: '부스 ID가 필요합니다.' }, { status: 400 });
    }

    const booth = await prisma.booth.findUnique({ where: { id: boothId } });
    if (!booth) {
      return NextResponse.json({ success: false, error: '부스를 찾을 수 없습니다.' }, { status: 404 });
    }

    const qrCode = await createOrRefreshQrCode(
      boothId,
      validFrom ? new Date(validFrom) : undefined,
      validUntil ? new Date(validUntil) : undefined
    );

    await logAudit({
      adminUserId: admin.adminUserId,
      action: 'REFRESH_QR',
      target: 'booth_qr_code',
      targetId: qrCode.id,
      details: { boothId, boothName: booth.name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...qrCode,
        scanUrl: getQrScanUrl(qrCode.token),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'QR 재발급 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// QR 코드 활성화/비활성화
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin(['SUPER_ADMIN', 'ADMIN']);
    const body = await request.json();
    const { qrCodeId, isActive } = body;

    if (!qrCodeId || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, error: '잘못된 요청입니다.' }, { status: 400 });
    }

    const qrCode = await prisma.boothQrCode.update({
      where: { id: qrCodeId },
      data: { isActive },
      include: { booth: { select: { name: true } } },
    });

    await logAudit({
      adminUserId: admin.adminUserId,
      action: isActive ? 'ACTIVATE_QR' : 'DEACTIVATE_QR',
      target: 'booth_qr_code',
      targetId: qrCodeId,
      details: { boothName: qrCode.booth.name },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
    });

    return NextResponse.json({ success: true, data: qrCode });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'QR 상태 변경 실패';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
