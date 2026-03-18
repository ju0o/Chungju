import { mockCards, mockEventSettings, mockGuestbooks, mockMoments, mockStampPoints } from "@/lib/mock-data";
import {
  AdminAccessCode,
  AdminAuditLog,
  AdminSession,
  EventSettings,
  GeneratedCardSet,
  GuestbookEntry,
  MomentEntry,
  StampPoint,
} from "@/lib/types";

export const memoryStore: {
  guestbooks: GuestbookEntry[];
  moments: MomentEntry[];
  cards: GeneratedCardSet[];
  stampPoints: StampPoint[];
  settings: EventSettings;
  rateLimit: Record<string, number>;
  adminFailedAttempts: Record<string, number>;
  adminAccessCodes: AdminAccessCode[];
  adminSessions: Record<string, AdminSession>;
  adminAuditLogs: AdminAuditLog[];
  visitStats: {
    totalPageViews: number;
    uniqueGuests: string[];
    routeHits: Record<string, number>;
    hourlyHits: Record<string, number>;
  };
} = {
  guestbooks: [...mockGuestbooks],
  moments: [...mockMoments],
  cards: [...mockCards],
  stampPoints: [...mockStampPoints],
  settings: { ...mockEventSettings },
  rateLimit: {},
  adminFailedAttempts: {},
  adminAccessCodes: [],
  adminSessions: {},
  adminAuditLogs: [],
  visitStats: {
    totalPageViews: 0,
    uniqueGuests: [],
    routeHits: {},
    hourlyHits: {},
  },
};
