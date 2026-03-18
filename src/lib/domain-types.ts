// ─────────────────────────────────────────────
// 공통 타입 정의 (Prisma 모델 기반)
// ─────────────────────────────────────────────

export type SiteMode = 'preparing' | 'live' | 'ended' | 'archive';

// 관리자 역할
export type AdminRoleType = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

// 포토카드 희귀도
export type PhotocardRarityType = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

// 포토카드 조건 타입
export type PhotocardConditionTypeValue = 'BOOTH_VISIT' | 'STAMP_COUNT' | 'CAMPAIGN_COMPLETE' | 'REVIEW_WRITE' | 'MANUAL';

// 후기 상태
export type ReviewStatusType = 'PENDING' | 'APPROVED' | 'HIDDEN' | 'DELETED';

// ─────────────────────────────────────────────
// API 응답
// ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// 축제 관련
// ─────────────────────────────────────────────
export interface NoticeItem {
  title: string;
  content: string;
  date: string;
  isPinned?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  location?: string;
  date?: string;
}

// ─────────────────────────────────────────────
// QR 스캔 결과
// ─────────────────────────────────────────────
export interface ScanResult {
  success: boolean;
  message: string;
  boothName?: string;
  stampCount?: number;
  totalRequired?: number;
  isCompleted?: boolean;
  newPhotocards?: Array<{ id: string; name: string; imageUrl: string; rarity: string }>;
  rewardEarned?: { name: string; description: string };
}

// ─────────────────────────────────────────────
// 통계
// ─────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalScans: number;
  totalReviews: number;
  totalCompletedCampaigns: number;
  totalPhotocardIssued: number;
  todayScans: number;
  todayReviews: number;
  boothScanRanking: Array<{ boothName: string; scanCount: number }>;
  hourlyScans: Array<{ hour: number; count: number }>;
}

// ─────────────────────────────────────────────
// 세션 / 인증
// ─────────────────────────────────────────────
export interface UserSession {
  userId: string;
  nickname: string;
}

export interface AdminSessionPayload {
  adminUserId: string;
  role: AdminRoleType;
  name: string;
  email: string;
}

// ─────────────────────────────────────────────
// 부스 관련 DTO
// ─────────────────────────────────────────────
export interface BoothListItem {
  id: string;
  name: string;
  category: string;
  location: string;
  imageUrl: string | null;
  operatingHours: string | null;
  isActive: boolean;
}

export interface BoothDetail extends BoothListItem {
  description: string;
  contactInfo: string | null;
  mapX: number | null;
  mapY: number | null;
  metadata: Record<string, unknown>;
  qrCode?: {
    isActive: boolean;
    scanCount: number;
  };
  reviewCount: number;
  averageRating: number;
}

// ─────────────────────────────────────────────
// 포토카드 조건 값
// ─────────────────────────────────────────────
export interface BoothVisitCondition {
  boothId: string;
}

export interface StampCountCondition {
  stampCount: number;
}

export interface CampaignCompleteCondition {
  campaignId: string;
}

export type PhotocardConditionValue =
  | BoothVisitCondition
  | StampCountCondition
  | CampaignCompleteCondition
  | Record<string, never>; // REVIEW_WRITE, MANUAL
