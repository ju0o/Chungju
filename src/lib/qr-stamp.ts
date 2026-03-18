import { randomBytes } from 'crypto';
import prisma from './prisma';
import type { ScanResult, PhotocardConditionValue } from './domain-types';

// ─────────────────────── QR 토큰 생성 ───────────────────────
export function generateQrToken(): string {
  return randomBytes(32).toString('base64url');
}

// ─────────────────────── QR 코드 생성/재발급 ───────────────────────
export async function createOrRefreshQrCode(boothId: string, validFrom?: Date, validUntil?: Date) {
  const token = generateQrToken();

  const existing = await prisma.boothQrCode.findUnique({ where: { boothId } });

  if (existing) {
    return prisma.boothQrCode.update({
      where: { boothId },
      data: {
        token,
        isActive: true,
        validFrom: validFrom ?? null,
        validUntil: validUntil ?? null,
        scanCount: 0,
      },
    });
  }

  return prisma.boothQrCode.create({
    data: {
      boothId,
      token,
      isActive: true,
      validFrom: validFrom ?? null,
      validUntil: validUntil ?? null,
    },
  });
}

// ─────────────────────── QR 스캔 처리 ───────────────────────
export async function processQrScan(
  token: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<ScanResult> {
  // 1. 토큰 검증
  const qrCode = await prisma.boothQrCode.findUnique({
    where: { token },
    include: {
      booth: {
        include: { festival: true },
      },
    },
  });

  if (!qrCode) {
    return { success: false, message: '유효하지 않은 QR 코드입니다.' };
  }

  // 2. 활성화 확인
  if (!qrCode.isActive) {
    return { success: false, message: '비활성화된 QR 코드입니다.' };
  }

  // 3. 유효 기간 검증
  const now = new Date();
  if (qrCode.validFrom && now < qrCode.validFrom) {
    return { success: false, message: '아직 스캔 가능 시간이 아닙니다.' };
  }
  if (qrCode.validUntil && now > qrCode.validUntil) {
    return { success: false, message: 'QR 코드가 만료되었습니다.' };
  }

  // 4. 활성 캠페인 조회
  const campaigns = await prisma.stampCampaign.findMany({
    where: {
      festivalId: qrCode.booth.festivalId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (campaigns.length === 0) {
    return { success: false, message: '현재 진행 중인 스탬프 캠페인이 없습니다.' };
  }

  const campaign = campaigns[0]; // 활성 캠페인 중 첫 번째 사용

  // 5. 중복 스캔 확인
  if (!campaign.allowDuplicateScan) {
    const existingScan = await prisma.stampScan.findUnique({
      where: {
        userId_qrCodeId_stampCampaignId: {
          userId,
          qrCodeId: qrCode.id,
          stampCampaignId: campaign.id,
        },
      },
    });

    if (existingScan) {
      return {
        success: false,
        message: `이미 "${qrCode.booth.name}" 부스의 스탬프를 획득하셨습니다.`,
        boothName: qrCode.booth.name,
      };
    }
  }

  // 6. 스탬프 스캔 기록
  await prisma.stampScan.create({
    data: {
      userId,
      qrCodeId: qrCode.id,
      stampCampaignId: campaign.id,
      ipAddress,
      userAgent,
    },
  });

  // QR 스캔 카운트 증가
  await prisma.boothQrCode.update({
    where: { id: qrCode.id },
    data: { scanCount: { increment: 1 } },
  });

  // 7. 진행도 업데이트
  const progress = await prisma.userStampProgress.upsert({
    where: {
      userId_stampCampaignId: {
        userId,
        stampCampaignId: campaign.id,
      },
    },
    update: {
      totalStamps: { increment: 1 },
    },
    create: {
      userId,
      stampCampaignId: campaign.id,
      totalStamps: 1,
    },
  });

  const newTotal = progress.totalStamps + (progress.totalStamps === 1 ? 0 : 0); // upsert에서 이미 증가됨
  const actualTotal = await prisma.stampScan.count({
    where: { userId, stampCampaignId: campaign.id },
  });

  // 진행도 동기화
  const isCompleted = actualTotal >= campaign.requiredStamps;
  await prisma.userStampProgress.update({
    where: { id: progress.id },
    data: {
      totalStamps: actualTotal,
      isCompleted,
      completedAt: isCompleted && !progress.completedAt ? now : progress.completedAt,
    },
  });

  // 8. 포토카드 지급 확인
  const newPhotocards = await checkAndGrantPhotocards(userId, qrCode.booth.festivalId, {
    boothId: qrCode.boothId,
    stampCount: actualTotal,
    campaignId: campaign.id,
    isCompleted,
  });

  // 9. 보상 조건 확인
  let rewardEarned: ScanResult['rewardEarned'];
  if (isCompleted && !progress.isCompleted) {
    const reward = await prisma.reward.findFirst({
      where: {
        festivalId: qrCode.booth.festivalId,
        stampCampaignId: campaign.id,
        requiredStamps: { lte: actualTotal },
        isActive: true,
      },
      orderBy: { requiredStamps: 'desc' },
    });

    if (reward) {
      rewardEarned = { name: reward.name, description: reward.description };
    }
  }

  // 10. 감사로그 기록
  const { logAudit } = await import('./auth');
  await logAudit({
    action: 'STAMP_SCAN',
    target: 'stamp_scan',
    targetId: qrCode.boothId,
    details: {
      userId,
      boothName: qrCode.booth.name,
      stampCount: actualTotal,
      campaignId: campaign.id,
      isCompleted,
    },
    ipAddress,
  });

  return {
    success: true,
    message: `"${qrCode.booth.name}" 스탬프를 획득했습니다!`,
    boothName: qrCode.booth.name,
    stampCount: actualTotal,
    totalRequired: campaign.requiredStamps,
    isCompleted,
    newPhotocards: newPhotocards.map((pc) => ({
      id: pc.id,
      name: pc.name,
      imageUrl: pc.imageUrl,
      rarity: pc.rarity,
    })),
    rewardEarned,
  };
}

// ─────────────────────── 포토카드 자동 지급 ───────────────────────
async function checkAndGrantPhotocards(
  userId: string,
  festivalId: string,
  context: {
    boothId: string;
    stampCount: number;
    campaignId: string;
    isCompleted: boolean;
  }
) {
  const grantedCards: Array<{ id: string; name: string; imageUrl: string; rarity: string }> = [];

  // 해당 축제의 포토카드 조건 확인
  const photocards = await prisma.photocard.findMany({
    where: {
      festivalId,
      isPublic: true,
    },
  });

  for (const card of photocards) {
    // 이미 소유 여부 확인
    const alreadyOwned = await prisma.userPhotocard.findUnique({
      where: {
        userId_photocardId: { userId, photocardId: card.id },
      },
    });
    if (alreadyOwned) continue;

    // 발행 한도 확인
    if (card.maxIssuance !== null && card.issuedCount >= card.maxIssuance) continue;

    const condition = card.conditionValue as unknown as PhotocardConditionValue;
    let shouldGrant = false;

    switch (card.conditionType) {
      case 'BOOTH_VISIT':
        if ('boothId' in condition && condition.boothId === context.boothId) {
          shouldGrant = true;
        }
        break;
      case 'STAMP_COUNT':
        if ('stampCount' in condition && context.stampCount >= condition.stampCount) {
          shouldGrant = true;
        }
        break;
      case 'CAMPAIGN_COMPLETE':
        if ('campaignId' in condition && condition.campaignId === context.campaignId && context.isCompleted) {
          shouldGrant = true;
        }
        break;
      default:
        break;
    }

    if (shouldGrant) {
      await prisma.userPhotocard.create({
        data: { userId, photocardId: card.id },
      });
      await prisma.photocard.update({
        where: { id: card.id },
        data: { issuedCount: { increment: 1 } },
      });
      grantedCards.push({
        id: card.id,
        name: card.name,
        imageUrl: card.imageUrl,
        rarity: card.rarity,
      });
    }
  }

  return grantedCards;
}

// ─────────────────────── QR URL 생성 ───────────────────────
export function getQrScanUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/stamp/scan?token=${encodeURIComponent(token)}`;
}
