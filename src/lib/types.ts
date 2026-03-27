export type SiteMode = "preparing" | "live" | "ended" | "archive";
export type AdminRole = "super_admin" | "content_manager" | "field_moderator";

export type AdminAccessCode = {
  id: string;
  codeHash: string;
  role: AdminRole;
  status: "active" | "revoked" | "expired" | "used";
  label: string;
  expiresAt?: string;
  oneTime?: boolean;
  usedAt?: string;
  createdAt: string;
  createdBy: string;
  revokedAt?: string;
  revokedBy?: string;
  preview?: string;
};

export type AdminSession = {
  id: string;
  accessCodeId: string;
  role: AdminRole;
  sessionTokenHash: string;
  issuedAt: string;
  expiresAt: string;
  lastSeenAt: string;
  isActive: boolean;
};

export type AdminAuditLog = {
  id: string;
  adminSessionId: string;
  adminRole: AdminRole;
  actionType: string;
  resourceType: string;
  resourceId: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
};

export type SectionVisibility = {
  showMap: boolean;
  showPrograms: boolean;
  showBooths: boolean;
  showQuoteDraw: boolean;
  showGuestbookShortcut: boolean;
  showCardBanner: boolean;
};

export type ProgramItem = {
  id: string;
  time: string;
  title: string;
  detail: string;
  location: string;
  status: "upcoming" | "live" | "done";
  isPublished: boolean;
  order: number;
};

export type BoothProfile = {
  id: string;
  name: string;
  authorName?: string;
  subtitle: string;
  description: string;
  bookTitle: string;
  imageUrl?: string;
  bookDescription?: string;
  quote: string;
  favoriteQuote?: string;
  authorMessage?: string;
  bookPrice?: string;
  bookStock?: number;
  participationType: string;
  isOnsite: boolean;
  isConsignment: boolean;
  link?: string;
  snsLink?: string;
  mapLabel?: string;
  order: number;
};

export type QuoteItem = {
  id: string;
  text: string;
  author?: string;
  sourceBook?: string;
  source?: string;
  category: string;
  isPublished: boolean;
  isFeatured: boolean;
};

export type StampPointType = "location" | "booth";

export type StampCompletionRule = {
  requiredCount: number;
  locationRequired: number;
  boothRequired: number;
};

export type CardTemplateSettings = {
  card1Title: string;
  card2Title: string;
  finalMessage: string;
  badgePrefix: string;
  saveButtonLabel: string;
  themeName: string;
};

export type GuestSession = {
  guestId: string;
  nickname: string;
  createdAt: string;
};

export type StampPoint = {
  id: string;
  slug: string;
  title: string;
  location: string;
  pointType: StampPointType;
  description: string;
  phrase: string;
  color: string;
  order: number;
  icon: string;
  x: string;
  y: string;
  isPublished: boolean;
  qrEnabled?: boolean;
  rewardCopy: string;
  linkedBoothId?: string;
};

export type StampState = {
  acquiredStampIds: string[];
  lastVisitedStampId?: string;
  completedAt?: string;
  completionBadge?: string;
};

export type GuestbookEntry = {
  id: string;
  guestId: string;
  nickname: string;
  message: string;
  mood: "설렘" | "평온" | "반짝임" | "따뜻함";
  isPublic: boolean;
  createdAt: string;
  hidden?: boolean;
  reported?: boolean;
  reportReason?: string;
  approved?: boolean;
  deleted?: boolean;
  moderatorNote?: string;
};

export type MomentEntry = {
  id: string;
  guestId: string;
  nickname: string;
  text: string;
  imageUrl?: string;
  hashtags: string[];
  isPublic: boolean;
  createdAt: string;
  hidden?: boolean;
  reported?: boolean;
  reportReason?: string;
  approved?: boolean;
  deleted?: boolean;
  moderatorNote?: string;
};

export type CardSlideData = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  accent: string;
};

export type GeneratedCardSet = {
  id: string;
  guestId: string;
  createdAt: string;
  ratio: "square" | "story";
  slides: CardSlideData[];
  imageDataUrl?: string;
  thumbnailUrl?: string;
};

export type VisitorInterestState = {
  favoriteBoothIds: string[];
  favoriteAuthorNames: string[];
  savedProgramIds: string[];
};

export type PublishingConsultation = {
  id: string;
  activityName: string;
  hasManuscript: "유" | "무";
  genre: string;
  publishFormat: "전자책" | "POD";
  contact: string;
  note?: string;
  createdAt: string;
};

export type EventSettings = {
  eventName: string;
  heroTitle: string;
  heroDescription: string;
  featuredBookBoothId?: string;
  eventDate: string;
  eventPlace: string;
  operationHours: string;
  notice: string;
  archiveNotice: string;
  introSteps: string[];
  momentTags: string[];
  ctaLabels: {
    start: string;
    guestbook: string;
    moments: string;
    card: string;
  };
  sectionVisibility: SectionVisibility;
  siteMode: SiteMode;
  stampCompletionRule: StampCompletionRule;
  programs: ProgramItem[];
  booths: BoothProfile[];
  quotes: QuoteItem[];
  cardTemplate: CardTemplateSettings;
};
