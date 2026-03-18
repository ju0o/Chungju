import { DEFAULT_EVENT_SETTINGS, DEFAULT_STAMP_POINTS } from "@/lib/constants";
import { EventSettings, GeneratedCardSet, GuestbookEntry, MomentEntry, StampPoint } from "@/lib/types";

export const mockGuestbooks: GuestbookEntry[] = [
  {
    id: "gb-1",
    guestId: "guest-demo-1",
    nickname: "꽃길손",
    message: "향기 덕분에 천천히 걷게 되는 오전이었어요.",
    mood: "설렘",
    isPublic: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "gb-2",
    guestId: "guest-demo-2",
    nickname: "산책메모",
    message: "벤치에 앉아 꽃시장 소리를 듣는 시간이 좋았습니다.",
    mood: "평온",
    isPublic: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
];

export const mockMoments: MomentEntry[] = [
  {
    id: "moment-1",
    guestId: "guest-demo-1",
    nickname: "초록산책",
    text: "햇빛이 천천히 이동하는 걸 보며 아이스커피를 마셨어요.",
    hashtags: ["햇빛", "공원 벤치"],
    isPublic: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    imageUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=900&q=80",
  },
];

export const mockCards: GeneratedCardSet[] = [];
export const mockStampPoints: StampPoint[] = DEFAULT_STAMP_POINTS;
export const mockEventSettings: EventSettings = DEFAULT_EVENT_SETTINGS;
