"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { EventSettings, PublishingConsultation } from "@/lib/types";

type BoothType = "author" | "curation";
type FilterType = "all" | BoothType;
type ReviewSort = "latest" | "rating" | "short" | "trust";
type PresetKey = "emotion" | "reflection" | "essay" | "poetry";
type TabKey = "home" | "books" | "discover" | "saved" | "reviews" | "consult";

type ReviewItem = {
  id: string;
  boothId: string;
  rating: number;
  content: string;
  createdAt: string;
  status?: string;
  adminNote?: string | null;
  pending?: boolean;
};

type ReviewApiItem = {
  id: string;
  boothId: string;
  rating: number;
  content: string;
  createdAt: string;
  status?: string;
  adminNote?: string | null;
};

type BoothItem = EventSettings["booths"][number] & {
  boothType: BoothType;
  key: string;
  stock: number;
  active: boolean;
  sellable: boolean;
};

const PRESETS: Array<{ key: PresetKey; label: string; keyword: string; k: number; r: number; c: number }> = [
  { key: "emotion", label: "감성", keyword: "감정", k: 8, r: 2, c: 4 },
  { key: "reflection", label: "성찰", keyword: "성찰", k: 7, r: 4, c: 3 },
  { key: "essay", label: "에세이", keyword: "산문", k: 6, r: 3, c: 8 },
  { key: "poetry", label: "시집", keyword: "시", k: 9, r: 2, c: 5 },
];
const POPULAR_SEARCHES = ["이윤지", "황주영", "에세이", "시집", "위로", "성찰"];
const MOOD_PRESETS = [
  { key: "따뜻함", label: "따뜻함", k: 5, r: 5, c: 4 },
  { key: "성찰", label: "성찰", k: 8, r: 3, c: 5 },
  { key: "위로", label: "위로", k: 7, r: 4, c: 4 },
  { key: "루틴", label: "루틴", k: 6, r: 5, c: 3 },
];
const COVER_FALLBACK_BY_TITLE: Record<string, string> = {
  "간호사로사라지다단원병환아엄마로살아지다": "/books/간호사로 사라지다 단원병 환아 엄마로 살아지다.jpg",
  "간호사로사라지다당원병환아엄마로살아지다": "/books/간호사로 사라지다 단원병 환아 엄마로 살아지다.jpg",
  "고질라와헤엄치다": "/books/고질라와 헤엄치다.jpg",
  "층간소음블렌딩": "/books/층간소음 블렌딩.jpg",
  "그래도오늘은다르게살기로했다": "/books/그래도 오늘은 다르게 살기로 했다.jpg",
  "그래서오늘도사랑합니다": "/books/그래서 오늘도 사랑합니다.jpg",
  "오늘도덕분에숨을쉽니다": "/books/오늘도 덕분에 숨을 쉽니다.jpg",
  "필터교체가필요합니다": "/books/필터교체가필요합니다.jpg",
  "어제와다른내가되어": "/books/어제와 다른 내가 되어.jpg",
  "나비": "/books/나,비.jpg",
  "별을끄다": "/books/별을끄다.jpg",
};

const STOP = new Set(["작가", "부스", "도서", "책", "소개", "추천", "그리고"]);

const toKeywords = (v: string) =>
  v
    .toLowerCase()
    .split(/[^0-9a-zA-Z가-힣]+/)
    .filter((t) => t.length >= 2 && !STOP.has(t));

const typeOfBooth = (v: string): BoothType => (v.includes("큐레이션") ? "curation" : "author");
const boothKey = (author: string, title: string) => `${author.trim().toLowerCase()}::${title.trim().toLowerCase()}`;
const todayIndex = (total: number) => {
  if (!total) return 0;
  const d = new Date();
  const key = `${d.getFullYear()}${d.getMonth() + 1}${d.getDate()}`;
  let h = 0;
  for (const c of key) h = (h * 33 + c.charCodeAt(0)) % 100000;
  return h % total;
};

function readMetaText(meta: unknown, key: string) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function readMetaNum(meta: unknown, key: string) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const value = (meta as Record<string, unknown>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function shorten(text: string, max = 84) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trimEnd()}...`;
}

function getGenreBadge(booth: BoothItem): "시집" | "에세이" | "산문집" {
  const source = `${booth.subtitle} ${booth.participationType} ${booth.bookDescription ?? ""}`.toLowerCase();
  if (source.includes("시")) return "시집";
  if (source.includes("산문")) return "산문집";
  return "에세이";
}

function getMoodTags(booth: BoothItem): string[] {
  const source = `${booth.bookTitle} ${booth.bookDescription ?? ""} ${booth.quote}`.toLowerCase();
  const tags: string[] = [];
  if (source.includes("다정") || source.includes("사랑") || source.includes("따뜻")) tags.push("따뜻함");
  if (source.includes("성찰") || source.includes("질문") || source.includes("바라보")) tags.push("성찰");
  if (source.includes("희망") || source.includes("위로") || source.includes("회복")) tags.push("위로");
  if (source.includes("루틴") || source.includes("하루") || source.includes("일상")) tags.push("루틴");
  if (!tags.length) tags.push("위로");
  return tags.slice(0, 2);
}

function aiCurationLine(booth: BoothItem) {
  const genre = getGenreBadge(booth);
  const tags = getMoodTags(booth);
  if (genre === "시집") return `감정의 결을 천천히 읽고 싶은 분께 맞는 ${tags[0]} 시집입니다.`;
  if (genre === "산문집") return `생각이 많아진 날, 현실을 또렷하게 바라보고 싶은 분께 추천합니다.`;
  return `${tags[0]}이 필요한 날, 짧게 읽어도 오래 남는 에세이입니다.`;
}

function moodMatchScore(booth: BoothItem, activeMood: string) {
  if (!activeMood) return 70 + Math.min(getMoodTags(booth).length * 8, 18);
  return getMoodTags(booth).includes(activeMood) ? 92 : 41;
}

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

function resolveCoverUrl(booth: BoothItem) {
  if (booth.imageUrl && booth.imageUrl.trim().length > 0) return booth.imageUrl;
  return COVER_FALLBACK_BY_TITLE[normalizeTitle(booth.bookTitle)] ?? "/books/book-1.svg";
}

async function shareCard(booth: BoothItem) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const g = ctx.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, "#fff8ef");
  g.addColorStop(1, "#f3e7d6");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = "rgba(222,133,101,0.12)";
  ctx.fillRect(60, 60, 960, 1230);
  ctx.fillStyle = "#2e2a23";
  ctx.font = "700 52px sans-serif";
  ctx.fillText("운영자 추천 도서", 110, 170);
  ctx.font = "600 44px sans-serif";
  ctx.fillText(booth.bookTitle, 110, 260);
  ctx.font = "500 34px sans-serif";
  ctx.fillStyle = "#5e5648";
  ctx.fillText(booth.authorName ?? booth.name, 110, 320);
  ctx.fillStyle = "#2e2a23";
  ctx.font = "600 32px sans-serif";
  ctx.fillText("한 줄 소개", 110, 430);
  ctx.font = "500 30px sans-serif";
  ctx.fillText(`“${booth.favoriteQuote ?? booth.quote}”`, 110, 490);
  ctx.font = "700 40px sans-serif";
  ctx.fillText(booth.bookPrice ?? "현장 문의", 110, 820);
  ctx.font = "500 30px sans-serif";
  ctx.fillStyle = "#5e5648";
  ctx.fillText(booth.sellable ? `재고 ${booth.stock}권` : "품절", 110, 880);
  const dataUrl = canvas.toDataURL("image/png");
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], `${booth.bookTitle}-추천카드.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ title: `${booth.bookTitle} 추천`, files: [file] });
    return;
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${booth.bookTitle}-추천카드.png`;
  a.click();
}

async function shareBookLink(booth: BoothItem) {
  const url = `${window.location.origin}/book/${booth.id}`;
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    await nav.share({ title: booth.bookTitle, text: `${booth.authorName ?? booth.name} 도서`, url });
    return;
  }
  await navigator.clipboard.writeText(url);
}

export function BookBoothHomeClient({
  settings,
  initialTab = "home",
  hideHomeTab = false,
}: {
  settings: EventSettings;
  initialTab?: TabKey;
  hideHomeTab?: boolean;
}) {
  const { interests, upsertInterests } = useFestivalSession();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<ReviewSort>("latest");
  const [k, setK] = useState(6);
  const [r, setR] = useState(3);
  const [c, setC] = useState(4);
  const [preset, setPreset] = useState<PresetKey | null>(null);
  const [presetKeyword, setPresetKeyword] = useState("");
  const [activeMoodTag, setActiveMoodTag] = useState("");
  const [stockMap, setStockMap] = useState<Record<string, { stock: number; active: boolean }>>({});
  const [stockSyncAt, setStockSyncAt] = useState("");
  const [serverReviews, setServerReviews] = useState<ReviewItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ReviewItem[]>([]);
  const [reviewBoothId, setReviewBoothId] = useState(settings.booths[0]?.id ?? "");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [consultForm, setConsultForm] = useState({
    activityName: "",
    hasManuscript: "유" as "유" | "무",
    genre: "",
    publishFormat: "전자책" as "전자책" | "POD",
    contact: "",
    note: "",
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultMessage, setConsultMessage] = useState("");
  const [consultHistory, setConsultHistory] = useState<PublishingConsultation[]>([]);
  const [helpVotes, setHelpVotes] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("review-help-v1") ?? "{}");
    } catch {
      return {};
    }
  });
  const [helpVoted, setHelpVoted] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("review-help-voted-v1") ?? "{}");
    } catch {
      return {};
    }
  });
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [clickScores, setClickScores] = useState<Record<string, number>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("book-click-scores-v1") ?? "{}");
    } catch {
      return {};
    }
  });
  const [recentViewed, setRecentViewed] = useState<Array<{ id: string; title: string; author: string; cover: string }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("recent-books-v1") ?? "[]");
    } catch {
      return [];
    }
  });
  const [announcementCard, setAnnouncementCard] = useState<{ title: string; content: string; type: string } | null>(null);
  const [reportingId, setReportingId] = useState<string>("");
  const [alertBookId, setAlertBookId] = useState<string>("");
  const [alertContact, setAlertContact] = useState("");
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("visit-checklist-v1") ?? "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("review-help-v1", JSON.stringify(helpVotes));
  }, [helpVotes]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("review-help-voted-v1", JSON.stringify(helpVoted));
  }, [helpVoted]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("visit-checklist-v1", JSON.stringify(checklist));
  }, [checklist]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("book-click-scores-v1", JSON.stringify(clickScores));
  }, [clickScores]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("recent-books-v1", JSON.stringify(recentViewed));
  }, [recentViewed]);

  const baseBooths = useMemo(
    () =>
      settings.booths
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((b) => ({
          ...b,
          boothType: typeOfBooth(b.participationType),
        })),
    [settings.booths],
  );

  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch("/api/booths?page=1&pageSize=200", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success || !Array.isArray(json?.data)) return;
        const next: Record<string, { stock: number; active: boolean }> = {};
        for (const b of json.data as Array<Record<string, unknown>>) {
          const meta = b.metadata;
          const author = readMetaText(meta, "authorName") || (typeof b.name === "string" ? b.name : "");
          const title = readMetaText(meta, "bookTitle");
          if (!title) continue;
          next[boothKey(author, title)] = {
            stock: readMetaNum(meta, "bookStock") ?? 0,
            active: b.isActive !== false,
          };
        }
        setStockMap(next);
        setStockSyncAt(new Date().toISOString());
      } catch {}
    };
    sync();
    const t = window.setInterval(sync, 20000);
    return () => window.clearInterval(t);
  }, []);

  const booths = useMemo<BoothItem[]>(
    () =>
      baseBooths.map((b) => {
        const key = boothKey(b.authorName ?? b.name, b.bookTitle);
        const snap = stockMap[key];
        const stock = snap?.stock ?? b.bookStock ?? 0;
        const active = snap?.active ?? true;
        return { ...b, key, stock, active, sellable: active && stock > 0 };
      }),
    [baseBooths, stockMap],
  );

  const pinned = booths.find((b) => b.order === 1) ?? booths[0];
  const today = booths[todayIndex(booths.length)];

  const suggestionItems = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ text: string; kind: "작가" | "책" }> = [];
    for (const b of booths) {
      const a = (b.authorName ?? b.name).trim();
      const t = b.bookTitle.trim();
      if (a && !seen.has(`a:${a}`)) {
        seen.add(`a:${a}`);
        list.push({ text: a, kind: "작가" });
      }
      if (t && !seen.has(`t:${t}`)) {
        seen.add(`t:${t}`);
        list.push({ text: t, kind: "책" });
      }
    }
    return list;
  }, [booths]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return suggestionItems.filter((i) => i.text.toLowerCase().includes(q)).slice(0, 6);
  }, [query, suggestionItems]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reviews?page=1&pageSize=40", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success || !Array.isArray(json?.data)) return;
        setServerReviews(
          (json.data as ReviewApiItem[]).map((v) => ({
            id: v.id,
            boothId: v.boothId,
            rating: v.rating,
            content: v.content,
            createdAt: v.createdAt,
            status: v.status,
            adminNote: v.adminNote,
          })),
        );
      } catch {}
    };
    load();
  }, []);

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const res = await fetch("/api/publishing-consultations", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success || !Array.isArray(json?.data)) return;
        setConsultHistory(json.data as PublishingConsultation[]);
      } catch {}
    };
    loadConsultations();
  }, []);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success || !Array.isArray(json?.data) || !json.data[0]) return;
        const top = json.data[0] as { title: string; content: string; type: string };
        setAnnouncementCard({ title: top.title, content: top.content, type: top.type });
      } catch {}
    };
    loadAnnouncement();
  }, []);

  const allReviews = useMemo(
    () => [...pendingReviews, ...serverReviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [pendingReviews, serverReviews],
  );

  const reviews = useMemo(() => {
    const arr = [...allReviews];
    if (sort === "rating") return arr.sort((a, b) => b.rating - a.rating || +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "short") return arr.sort((a, b) => a.content.length - b.content.length || +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "trust") return arr.sort((a, b) => (helpVotes[b.id] ?? 0) - (helpVotes[a.id] ?? 0) || b.rating - a.rating);
    return arr;
  }, [allReviews, helpVotes, sort]);

  const reviewCountMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const rv of allReviews) m[rv.boothId] = (m[rv.boothId] ?? 0) + 1;
    return m;
  }, [allReviews]);

  const filteredBooths = useMemo(() => {
    const q = query.trim().toLowerCase();
    return booths.filter((b) => {
      if (filter !== "all" && b.boothType !== filter) return false;
      if (activeMoodTag && !getMoodTags(b).includes(activeMoodTag)) return false;
      if (!q) return true;
      const s = [b.name, b.authorName ?? "", b.bookTitle, b.description, b.bookDescription ?? "", b.quote].join(" ").toLowerCase();
      return s.includes(q);
    });
  }, [activeMoodTag, booths, filter, query]);

  const recommended = useMemo(() => {
    const favorites = booths.filter((b) => interests.favoriteBoothIds.includes(b.id));
    const kwSet = new Set(favorites.flatMap((b) => toKeywords([b.authorName ?? "", b.bookTitle, b.description, b.bookDescription ?? ""].join(" "))));
    for (const tk of toKeywords(query)) kwSet.add(tk);
    return filteredBooths
      .filter((b) => b.active)
      .map((b) => {
        const tokens = toKeywords([b.authorName ?? "", b.bookTitle, b.description, b.bookDescription ?? ""].join(" "));
        const matched = tokens.filter((x) => kwSet.has(x));
        const score =
          Math.min(matched.length, 4) * k +
          Math.min(reviewCountMap[b.id] ?? 0, 5) * r +
          (favorites[0]?.boothType === b.boothType ? c : 0) +
          (presetKeyword && tokens.includes(presetKeyword.toLowerCase()) ? 2 : 0) +
          (b.sellable ? 0 : -8);
        return { ...b, score, reason: matched[0] ? `"${matched[0]}" 키워드 유사` : "추천" };
      })
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .slice(0, 3);
  }, [booths, c, filteredBooths, interests.favoriteBoothIds, k, presetKeyword, query, r, reviewCountMap]);

  const savedBooths = booths.filter((b) => interests.favoriteBoothIds.includes(b.id));
  const checklistBooths = savedBooths.filter((b) => b.active).sort((a, b) => a.stock - b.stock || a.order - b.order);
  const compareBooths = compareIds.map((id) => booths.find((b) => b.id === id)).filter((v): v is BoothItem => Boolean(v));
  const popularTop = useMemo(
    () =>
      booths
        .filter((b) => b.active)
        .map((b) => ({
          ...b,
          popularityScore: (clickScores[b.id] ?? 0) * 3 + (interests.favoriteBoothIds.includes(b.id) ? 4 : 0) + Math.min(reviewCountMap[b.id] ?? 0, 8),
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore || a.order - b.order)
        .slice(0, 3),
    [booths, clickScores, interests.favoriteBoothIds, reviewCountMap],
  );
  const closingSoonBooks = useMemo(() => booths.filter((b) => b.active && b.stock > 0 && b.stock <= 3).slice(0, 3), [booths]);

  const consultationRecommendation = useMemo(() => {
    const genre = consultForm.genre.trim().toLowerCase();
    const recent = consultHistory.slice(0, 30);
    const similarGenreCount = genre ? recent.filter((item) => item.genre.toLowerCase().includes(genre)).length : 0;
    const podCount = recent.filter((item) => item.publishFormat === "POD").length;
    const ebookCount = recent.filter((item) => item.publishFormat === "전자책").length;
    const preferredFormat = podCount > ebookCount ? "POD" : "전자책";

    const steps: string[] = [];
    if (consultForm.hasManuscript === "무") {
      steps.push("원고가 없는 상태라면 목차 5개와 샘플 2문단부터 준비해 상담하면 빠르게 진행됩니다.");
    } else {
      steps.push("원고가 있다면 1~2장 분량과 전체 기획 의도를 함께 제출하면 검토 정확도가 높아집니다.");
    }
    if (genre.includes("시")) {
      steps.push("시집 장르는 초반 10편 선별본과 콘셉트 키워드 3개를 함께 준비하는 것을 추천합니다.");
    } else if (genre.includes("산문") || genre.includes("에세이")) {
      steps.push("산문/에세이는 독자 타깃 1문장 정의와 샘플 챕터 제목 구성이 도움이 됩니다.");
    } else if (genre) {
      steps.push(`입력한 장르(${consultForm.genre})는 현재 상담 데이터에서 ${similarGenreCount}건이 있어 레퍼런스 기반 상담이 가능합니다.`);
    }
    steps.push(`최근 신청 기준으로는 ${preferredFormat} 선호가 높아 해당 포맷 비교 견적을 먼저 받아보는 것을 권장합니다.`);

    return steps.slice(0, 3);
  }, [consultForm.genre, consultForm.hasManuscript, consultHistory]);

  const teamCount = new Set(booths.map((b) => b.authorName?.trim() || b.name.trim())).size;
  const bookCount = booths.length;
  const sellableCount = booths.filter((b) => b.sellable).length;
  const soldOutCount = bookCount - sellableCount;
  const lowStockCount = booths.filter((b) => b.stock > 0 && b.stock <= 3 && b.active).length;
  const curatorComment = useMemo(() => {
    const picked = booths.find((b) => b.order === 1) ?? booths[0];
    if (!picked) return "오늘은 당신의 하루를 다정하게 다독일 한 권을 천천히 골라보세요.";
    return `${picked.bookTitle}는 ${picked.authorName ?? picked.name}의 시선으로 오늘의 감정을 차분히 정리하게 해주는 책이라 추천합니다.`;
  }, [booths]);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setPreset(p.key);
    setPresetKeyword(p.keyword);
    setK(p.k);
    setR(p.r);
    setC(p.c);
  };

  const toggleSave = (id: string, author?: string) => {
    const has = interests.favoriteBoothIds.includes(id);
    const nextIds = has ? interests.favoriteBoothIds.filter((v) => v !== id) : [...interests.favoriteBoothIds, id];
    const a = author?.trim() ?? "";
    const nextAuthors = a
      ? has
        ? interests.favoriteAuthorNames.filter((v) => v !== a)
        : Array.from(new Set([...interests.favoriteAuthorNames, a]))
      : interests.favoriteAuthorNames;
    upsertInterests({ ...interests, favoriteBoothIds: nextIds, favoriteAuthorNames: nextAuthors });
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[1], id];
    });
  };

  const applyMoodPreset = (mood: (typeof MOOD_PRESETS)[number]) => {
    setActiveMoodTag(mood.key);
    setK(mood.k);
    setR(mood.r);
    setC(mood.c);
  };

  const trackBookView = (b: BoothItem) => {
    setClickScores((prev) => ({ ...prev, [b.id]: (prev[b.id] ?? 0) + 1 }));
    const cover = resolveCoverUrl(b);
    setRecentViewed((prev) => {
      const next = [{ id: b.id, title: b.bookTitle, author: b.authorName ?? b.name, cover }, ...prev.filter((x) => x.id !== b.id)];
      return next.slice(0, 5);
    });
  };

  const voteHelpful = (id: string) => {
    if (helpVoted[id]) return;
    setHelpVotes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setHelpVoted((prev) => ({ ...prev, [id]: true }));
  };

  const reportReview = async (id: string) => {
    setReportingId(id);
    try {
      await fetch(`/api/reviews/${id}/report`, { method: "POST" });
    } catch {
      // noop
    } finally {
      setReportingId("");
    }
  };

  const submitBookAlert = async () => {
    const booth = booths.find((b) => b.id === alertBookId);
    const contact = alertContact.trim();
    if (!booth) return setAlertMessage("알림 신청 도서를 선택해주세요.");
    if (!contact) return setAlertMessage("연락처를 입력해주세요.");
    setAlertSubmitting(true);
    setAlertMessage("");
    try {
      const res = await fetch("/api/book-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boothId: booth.id, bookTitle: booth.bookTitle, authorName: booth.authorName ?? booth.name, contact }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setAlertMessage(json?.error ?? "알림 신청 실패");
        return;
      }
      setAlertContact("");
      setAlertBookId("");
      setAlertMessage("입고 알림 신청이 완료되었습니다.");
    } catch {
      setAlertMessage("알림 신청 중 오류가 발생했습니다.");
    } finally {
      setAlertSubmitting(false);
    }
  };

  const saveShortReview = async () => {
    const content = reviewContent.trim();
    const lines = content.split("\n").filter(Boolean).length;
    if (!content || !reviewBoothId) return;
    if (content.length > 70) return setReviewMessage("짧은후기는 70자 이내로 작성해주세요.");
    if (lines > 2) return setReviewMessage("짧은후기는 1~2줄로 작성해주세요.");
    setReviewSubmitting(true);
    setReviewMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boothId: reviewBoothId, content, rating: reviewRating }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) return setReviewMessage(json?.error ?? "후기 등록 실패");
      setPendingReviews((prev) => [{ id: json?.data?.id ?? crypto.randomUUID(), boothId: reviewBoothId, rating: reviewRating, content, createdAt: new Date().toISOString(), pending: true }, ...prev].slice(0, 8));
      setReviewContent("");
      setReviewMessage("후기가 등록되었습니다. 검수 후 공개됩니다.");
    } catch {
      setReviewMessage("후기 등록 중 오류가 발생했습니다.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const submitConsultation = async () => {
    const payload = {
      activityName: consultForm.activityName.trim(),
      hasManuscript: consultForm.hasManuscript,
      genre: consultForm.genre.trim(),
      publishFormat: consultForm.publishFormat,
      contact: consultForm.contact.trim(),
      note: consultForm.note.trim(),
    };
    if (!payload.activityName || !payload.genre || !payload.contact) {
      setConsultMessage("활동명/장르/연락처는 필수 입력입니다.");
      return;
    }
    setConsultSubmitting(true);
    setConsultMessage("");
    try {
      const res = await fetch("/api/publishing-consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setConsultMessage(json?.error ?? "신청 접수에 실패했습니다.");
        return;
      }
      if (json?.data) {
        setConsultHistory((prev) => [json.data as PublishingConsultation, ...prev].slice(0, 200));
      }
      setConsultForm({
        activityName: "",
        hasManuscript: "유",
        genre: "",
        publishFormat: "전자책",
        contact: "",
        note: "",
      });
      setConsultMessage("Yeobaek 출판 상담 신청이 접수되었습니다.");
    } catch {
      setConsultMessage("신청 접수 중 오류가 발생했습니다.");
    } finally {
      setConsultSubmitting(false);
    }
  };

  return (
    <main className="app-shell grid gap-3 sm:gap-4">
      <section className="section-card rounded-[1.4rem] p-2 sm:p-2.5">
        <div className={`grid gap-1 text-xs ${hideHomeTab ? "grid-cols-5" : "grid-cols-6"}`}>
          {(hideHomeTab
            ? [
                { href: "/books", key: "books" as TabKey, label: "책", icon: "📚", count: `${bookCount}` },
                { href: "/discover", key: "discover" as TabKey, label: "탐색", icon: "⌕", count: `${bookCount}` },
                { href: "/saved", key: "saved" as TabKey, label: "찜", icon: "★", count: `${savedBooths.length}` },
                { href: "/reviews", key: "reviews" as TabKey, label: "후기", icon: "✎", count: `${allReviews.length}` },
                { href: "/consult", key: "consult" as TabKey, label: "상담", icon: "◎", count: `${consultHistory.length}` },
              ]
            : [
                { href: "/", key: "home" as TabKey, label: "홈", icon: "⌂", count: `${teamCount}` },
                { href: "/books", key: "books" as TabKey, label: "책", icon: "📚", count: `${bookCount}` },
                { href: "/discover", key: "discover" as TabKey, label: "탐색", icon: "⌕", count: `${bookCount}` },
                { href: "/saved", key: "saved" as TabKey, label: "찜", icon: "★", count: `${savedBooths.length}` },
                { href: "/reviews", key: "reviews" as TabKey, label: "후기", icon: "✎", count: `${allReviews.length}` },
                { href: "/consult", key: "consult" as TabKey, label: "상담", icon: "◎", count: `${consultHistory.length}` },
              ]
          ).map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={`rounded-[0.9rem] px-1.5 py-2 text-center ${activeTab === tab.key ? "bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(191,102,68,0.22)]" : "bg-white/82 text-[var(--foreground-soft)]"}`}
            >
              <div className="flex items-center justify-center gap-1">
                <span aria-hidden>{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              <div className={`mt-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-[rgba(123,151,117,0.14)] text-[var(--leaf-deep)]"}`}>
                {tab.count}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {activeTab === "home" ? (
      <>
      <section className="section-card soft-pattern rounded-[1.6rem] p-4 sm:rounded-[1.75rem] sm:p-5">
        <p className="section-eyebrow">Book Curation Booth</p>
        <h1 className="section-title mt-2">율량마르쉐#8 독서 책 큐레이션 작가 부스</h1>
        <p className="section-description mt-2">홈은 운영 정보와 오늘 추천만 간단히 보여주고, 세부 기능은 각 탭에서 이용할 수 있습니다.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3">
            <p className="text-[11px] text-[var(--foreground-soft)]">참여</p>
            <p className="text-sm font-semibold">{teamCount}팀 / {bookCount}권</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3">
            <p className="text-[11px] text-[var(--foreground-soft)]">판매중</p>
            <p className="text-sm font-semibold">{sellableCount}권</p>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3">
            <p className="text-[11px] text-[var(--foreground-soft)]">품절 임박</p>
            <p className="text-sm font-semibold">{lowStockCount}권</p>
          </div>
        </div>
      </section>

      <section id="visit-info" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.55rem] sm:p-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1">운영시간 {settings.operationHours}</span>
          <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1">{settings.eventPlace}</span>
          <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1">품절 {soldOutCount}권</span>
          {stockSyncAt ? <span className="rounded-full border border-[var(--line)] bg-white/75 px-3 py-1">재고 갱신 {new Date(stockSyncAt).toLocaleTimeString("ko-KR")}</span> : null}
        </div>
      </section>
      {announcementCard ? (
        <section className="section-card rounded-[1.4rem] p-3">
          <p className="text-xs font-semibold text-[var(--accent-strong)]">운영자 공지 카드</p>
          <p className="mt-1 text-sm font-semibold">{announcementCard.title}</p>
          <p className="mt-1 text-xs text-[var(--foreground-soft)]">{shorten(announcementCard.content, 120)}</p>
        </section>
      ) : null}
      <section className="grid gap-3 sm:grid-cols-2">
        <article className="section-card rounded-[1.4rem] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">실시간 인기 도서 TOP3</h3>
            <span className="text-[11px] text-[var(--foreground-soft)]">클릭+찜+후기 점수</span>
          </div>
          <div className="mt-2 grid gap-2">
            {popularTop.map((b, i) => (
              <div key={`home-pop-${b.id}`} className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/82 px-3 py-2">
                <p className="text-xs"><span className="font-semibold">{i + 1}. {b.bookTitle}</span> <span className="text-[var(--foreground-soft)]">· {b.authorName ?? b.name}</span></p>
                <span className="text-[11px] text-[var(--foreground-soft)]">{b.popularityScore}점</span>
              </div>
            ))}
          </div>
        </article>
        <article className="section-card rounded-[1.4rem] p-3">
          <h3 className="text-sm font-semibold">오늘 마감 임박 도서</h3>
          <div className="mt-2 grid gap-2">
            {closingSoonBooks.length === 0 ? <p className="text-xs text-[var(--foreground-soft)]">현재 임박 도서가 없습니다.</p> : closingSoonBooks.map((b) => (
              <div key={`home-close-${b.id}`} className="rounded-xl border border-[rgba(191,102,68,0.45)] bg-[rgba(222,133,101,0.16)] p-2.5">
                <p className="text-xs font-semibold">{b.bookTitle}</p>
                <p className="text-[11px] text-[var(--foreground-soft)]">남은 수량 {b.stock}권</p>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="section-card rounded-[1.4rem] p-3">
        <h3 className="text-sm font-semibold">최근 본 도서</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {recentViewed.length === 0 ? <p className="text-xs text-[var(--foreground-soft)]">아직 본 도서가 없습니다. 탐색 탭에서 책을 열어보세요.</p> : recentViewed.map((item) => (
            <Link key={`recent-${item.id}`} href={`/discover`} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white/82 p-2">
              <div className="relative h-12 w-9 overflow-hidden rounded-md border border-[var(--line)]">
                <Image src={item.cover} alt={`${item.title} 표지`} fill className="object-cover" sizes="60px" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{item.title}</p>
                <p className="truncate text-[11px] text-[var(--foreground-soft)]">{item.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      </>
      ) : null}

      {activeTab === "discover" ? (
      <>
      <section className="section-card sticky top-2 z-20 rounded-[1.4rem] p-3">
        <p className="text-xs font-semibold text-[var(--accent-strong)]">오늘의 큐레이터 코멘트</p>
        <p className="mt-1 text-sm">{announcementCard?.content ? shorten(announcementCard.content, 110) : curatorComment}</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2">
        {pinned ? (
          <article className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
            <p className="text-xs font-semibold text-[var(--accent-strong)]">운영자 추천 핀</p>
            <p className="mt-1 text-sm font-semibold sm:text-base">{pinned.bookTitle}</p>
            <p className="text-xs text-[var(--foreground-soft)]">{pinned.authorName ?? pinned.name}</p>
            <p className="mt-2 text-xs text-[var(--foreground-soft)]">{shorten(pinned.favoriteQuote ?? pinned.quote, 52)}</p>
          </article>
        ) : null}
        {today ? (
          <article className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold sm:text-base">오늘의 추천 1권</h2>
              <button type="button" onClick={() => shareCard(today).catch(() => setReviewMessage("공유 카드 생성 실패"))} className="rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-xs text-[var(--foreground-soft)]">공유 카드</button>
            </div>
            <p className="mt-2 text-sm font-semibold sm:text-base">{today.bookTitle}</p>
            <p className="text-xs text-[var(--foreground-soft)]">{today.authorName ?? today.name} · {today.bookPrice ?? "현장 문의"}</p>
            <p className="mt-2 text-xs text-[var(--foreground-soft)]">{shorten(today.bookDescription ?? today.description, 72)}</p>
          </article>
        ) : null}
      </section>

      <section id="search" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
        <div className="grid gap-4 sm:grid-cols-[1.3fr,1fr]">
          <div>
            <h2 className="text-base font-semibold">통합 검색</h2>
            <div className="relative mt-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="작가명/책제목/키워드" className="festival-input" />
              {suggestions.length > 0 ? (
                <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-10 rounded-xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
                  {suggestions.map((s) => (
                    <button key={`${s.kind}-${s.text}`} type="button" onClick={() => setQuery(s.text)} className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-[rgba(222,133,101,0.08)]">
                      <span>{s.text}</span><span className="text-[var(--foreground-soft)]">{s.kind}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setQuery(chip)}
                  className="rounded-full border border-[var(--line)] bg-white/85 px-2.5 py-1 text-[11px] text-[var(--foreground-soft)] hover:bg-[rgba(222,133,101,0.12)]"
                >
                  #{chip}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <button type="button" onClick={() => setFilter("all")} className={`rounded-full border px-3 py-1.5 ${filter === "all" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>전체</button>
              <button type="button" onClick={() => setFilter("author")} className={`rounded-full border px-3 py-1.5 ${filter === "author" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>작가 부스</button>
              <button type="button" onClick={() => setFilter("curation")} className={`rounded-full border px-3 py-1.5 ${filter === "curation" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>독서 큐레이션 부스</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {MOOD_PRESETS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => applyMoodPreset(m)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] ${activeMoodTag === m.key ? "border-[var(--accent)] bg-[var(--accent)]/18 text-[var(--accent-strong)]" : "border-[var(--line)] bg-white/82 text-[var(--foreground-soft)]"}`}
                >
                  {m.label}
                </button>
              ))}
              {activeMoodTag ? (
                <button type="button" onClick={() => setActiveMoodTag("")} className="rounded-full border border-[var(--line)] bg-white/82 px-2.5 py-1 text-[11px] text-[var(--foreground-soft)]">
                  태그 초기화
                </button>
              ) : null}
            </div>
          </div>
          <div>
            <h2 className="text-base font-semibold">추천 가중치</h2>
            <div className="mt-2 rounded-xl border border-[var(--line)] bg-white/82 p-2.5">
              <p className="text-xs font-semibold text-[var(--foreground-soft)]">1분 미니 설문: 지금 필요한 감정은?</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {MOOD_PRESETS.map((m) => (
                  <button key={`survey-${m.key}`} type="button" onClick={() => applyMoodPreset(m)} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px] text-[var(--foreground-soft)]">
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {PRESETS.map((p) => (
                <button key={p.key} type="button" onClick={() => applyPreset(p)} className={`rounded-full border px-3 py-1.5 ${preset === p.key ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]" : "border-[var(--line)] bg-white/75 text-[var(--foreground-soft)]"}`}>{p.label}</button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 rounded-xl border border-[var(--line)] bg-white/75 p-3 text-xs">
              <label className="grid gap-1"><div className="flex items-center justify-between"><span>키워드</span><span>{k}</span></div><input type="range" min={0} max={10} value={k} onChange={(e) => setK(Number(e.target.value))} /></label>
              <label className="grid gap-1"><div className="flex items-center justify-between"><span>후기</span><span>{r}</span></div><input type="range" min={0} max={10} value={r} onChange={(e) => setR(Number(e.target.value))} /></label>
              <label className="grid gap-1"><div className="flex items-center justify-between"><span>유형</span><span>{c}</span></div><input type="range" min={0} max={10} value={c} onChange={(e) => setC(Number(e.target.value))} /></label>
            </div>
          </div>
        </div>
      </section>

      <section id="recommend" className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        {recommended.map((b, idx) => (
          <article
            key={`rec-${b.id}`}
            className="section-card stagger-fade-in rounded-[1.3rem] p-2.5 sm:rounded-[1.4rem] sm:p-3"
            style={{ animationDelay: `${80 + idx * 70}ms` }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background-soft)] sm:aspect-[3/4]">
              <Image src={resolveCoverUrl(b)} alt={`${b.bookTitle} 표지`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 30vw" />
            </div>
            <div className="mt-2">
              <span className="rounded-full border border-[rgba(123,151,117,0.28)] bg-[rgba(123,151,117,0.14)] px-2 py-1 text-[11px] text-[var(--leaf-deep)]">{getGenreBadge(b)}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold">{b.bookTitle}</p>
            <p className="text-xs text-[var(--foreground-soft)]">{b.authorName ?? b.name}</p>
            <p className="mt-1 text-xs text-[var(--foreground-soft)]">{b.reason}</p>
          </article>
        ))}
      </section>
      <section className="section-card rounded-[1.4rem] p-3">
        <h2 className="text-sm font-semibold">실시간 인기 도서 위젯</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {popularTop.map((b, i) => (
            <article key={`popular-${b.id}`} className="rounded-xl border border-[var(--line)] bg-white/82 p-3">
              <p className="text-[11px] text-[var(--foreground-soft)]">TOP {i + 1}</p>
              <p className="mt-1 text-sm font-semibold">{b.bookTitle}</p>
              <p className="text-xs text-[var(--foreground-soft)]">{b.authorName ?? b.name}</p>
              <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">점수 {b.popularityScore}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="booth-list" className="grid gap-2.5 sm:gap-3">
        {filteredBooths.map((b, idx) => {
          const saved = interests.favoriteBoothIds.includes(b.id);
          const lowStock = b.stock > 0 && b.stock <= 3 && b.active;
          const compared = compareIds.includes(b.id);
          const expanded = expandedBookId === b.id;
          return (
            <article
              key={b.id}
              className={`section-card stagger-fade-in rounded-[1.4rem] p-2.5 sm:rounded-[1.6rem] sm:p-3 ${!b.active ? "opacity-60" : ""}`}
              style={{ animationDelay: `${60 + idx * 65}ms` }}
            >
              <div className="grid grid-cols-[88px,1fr] gap-2.5 sm:grid-cols-[104px,1fr] sm:gap-3">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background-soft)]">
                  <Image src={resolveCoverUrl(b)} alt={`${b.bookTitle} 표지`} fill className="object-cover" sizes="120px" />
                </div>
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-[var(--foreground-soft)]">{b.boothType === "author" ? "작가 부스" : "독서 큐레이션 부스"}</p>
                      <h3 className="mt-1 line-clamp-2 text-sm font-semibold sm:text-base">{b.bookTitle}</h3>
                      <p className="text-xs text-[var(--foreground-soft)]">{b.authorName ?? b.name} · {b.bookPrice ?? "현장 문의"}</p>
                      <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">{aiCurationLine(b)}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button type="button" disabled={!b.active} onClick={() => toggleSave(b.id, b.authorName)} className={`rounded-full border px-2.5 py-1 text-[11px] ${saved ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/80"} disabled:opacity-50`}>{saved ? "찜됨" : "찜하기"}</button>
                      <button type="button" onClick={() => toggleCompare(b.id)} className={`rounded-full border px-2.5 py-1 text-[11px] ${compared ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/80"}`}>{compared ? "비교 선택됨" : "비교 선택"}</button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[rgba(123,151,117,0.28)] bg-[rgba(123,151,117,0.12)] px-2 py-1 text-[11px] text-[var(--leaf-deep)]">{getGenreBadge(b)}</span>
                    {getMoodTags(b).map((tag) => (
                      <span key={`${b.id}-${tag}`} className="rounded-full border border-[var(--line)] bg-white/88 px-2 py-1 text-[11px] text-[var(--foreground-soft)]">#{tag}</span>
                    ))}
                    <span className="rounded-full border border-[var(--line)] bg-white/88 px-2 py-1 text-[11px] text-[var(--foreground-soft)]">매칭 {moodMatchScore(b, activeMoodTag)}%</span>
                    {b.sellable ? (
                      <span className="rounded-full border border-[rgba(123,151,117,0.26)] bg-[rgba(123,151,117,0.14)] px-2 py-1 text-[11px] text-[var(--leaf-deep)]">판매중 ({b.stock}권)</span>
                    ) : (
                      <span className="rounded-full border border-[rgba(110,110,110,0.28)] bg-[rgba(128,128,128,0.14)] px-2 py-1 text-[11px] text-[rgba(78,78,78,0.95)]">품절</span>
                    )}
                    {lowStock ? <span className="rounded-full border border-[rgba(191,102,68,0.5)] bg-[rgba(222,133,101,0.24)] px-2 py-1 text-[11px] font-semibold text-[var(--accent-strong)]">품절 임박</span> : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-[var(--foreground-soft)]">{shorten(b.bookDescription ?? b.description, 90)}</p>
                  {!b.sellable ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input value={alertBookId === b.id ? alertContact : ""} onChange={(e) => { setAlertBookId(b.id); setAlertContact(e.target.value); }} placeholder="연락처" className="festival-input !w-auto !rounded-full !px-3 !py-1.5 !text-[11px]" />
                      <button type="button" onClick={submitBookAlert} disabled={alertSubmitting} className="rounded-full border border-[var(--accent)] bg-[var(--accent)]/16 px-2.5 py-1 text-[11px] text-[var(--accent-strong)]">
                        {alertSubmitting && alertBookId === b.id ? "신청중..." : "입고 알림 받기"}
                      </button>
                    </div>
                  ) : null}
                  {alertMessage && alertBookId === b.id ? <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">{alertMessage}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => { trackBookView(b); setExpandedBookId((prev) => (prev === b.id ? null : b.id)); }} className="rounded-full border border-[var(--line)] bg-white/85 px-3 py-1 text-[11px] text-[var(--foreground-soft)]">
                      {expanded ? "상세 접기" : "상세 보기"}
                    </button>
                    <Link href={`/book/${b.id}`} className="rounded-full border border-[var(--line)] bg-white/85 px-3 py-1 text-[11px] text-[var(--foreground-soft)]">상세 링크</Link>
                    <button type="button" onClick={() => shareBookLink(b).catch(() => setReviewMessage("링크 공유 실패"))} className="rounded-full border border-[var(--line)] bg-white/85 px-3 py-1 text-[11px] text-[var(--foreground-soft)]">링크 공유</button>
                  </div>
                </div>
              </div>
              {expanded ? (
                <div className="mt-3 grid gap-2 text-sm">
                  {(b.snsLink || b.link) ? (
                    <div className="rounded-xl border border-[var(--line)] bg-white/88 p-3">
                      <p className="text-xs font-semibold text-[var(--foreground-soft)]">작가 SNS 바로가기</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {b.snsLink ? <a className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--foreground-soft)]" href={b.snsLink} target="_blank" rel="noreferrer">Instagram/SNS</a> : null}
                        {b.link ? <a className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--foreground-soft)]" href={b.link} target="_blank" rel="noreferrer">관련 링크</a> : null}
                      </div>
                    </div>
                  ) : null}
                  <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3"><p className="text-xs font-semibold text-[var(--foreground-soft)]">작가 소개</p><p className="body-copy mt-1 whitespace-pre-line">{b.description}</p></div>
                  <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3"><p className="text-xs font-semibold text-[var(--foreground-soft)]">책 소개</p><p className="body-copy mt-1 whitespace-pre-line">{b.bookDescription ?? b.description}</p></div>
                  <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3"><p className="text-xs font-semibold text-[var(--foreground-soft)]">한 줄 소개</p><p className="quote-text mt-1">“{b.favoriteQuote ?? b.quote}”</p></div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <details id="compare" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold sm:text-base">책 비교 보기</summary>
        {compareBooths.length < 2 ? <p className="mt-2 text-sm text-[var(--foreground-soft)]">비교할 책 2권을 선택해주세요.</p> : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {compareBooths.map((b) => (
              <div key={`cmp-${b.id}`} className="rounded-xl border border-[var(--line)] bg-white/80 p-3 text-sm">
                <p className="font-semibold">{b.bookTitle}</p>
                <p className="mt-1 text-xs text-[var(--foreground-soft)]">{b.bookPrice ?? "현장 문의"}</p>
                <p className="mt-2 text-xs text-[var(--foreground-soft)]">한 줄</p>
                <p className="quote-text mt-1">“{b.favoriteQuote ?? b.quote}”</p>
                <p className="mt-2 text-xs text-[var(--foreground-soft)]">분위기</p>
                <p className="mt-1">{b.participationType.includes("시") ? "시적인 분위기" : b.participationType.includes("산문") ? "담백한 산문 분위기" : "감정 기록 분위기"}</p>
              </div>
            ))}
          </div>
        )}
      </details>
      </>
      ) : null}

      {activeTab === "saved" ? (
      <section id="saved" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
        <h2 className="text-base font-semibold">찜 + 나중에 보기</h2>
        {savedBooths.length === 0 ? <p className="mt-2 text-sm text-[var(--foreground-soft)]">아직 저장한 책/작가가 없습니다.</p> : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {savedBooths.map((b) => (
              <div key={`saved-${b.id}`} className="rounded-xl border border-[var(--line)] bg-white/80 p-3">
                <p className="text-sm font-semibold">{b.bookTitle}</p>
                <p className="text-xs text-[var(--foreground-soft)]">{b.authorName ?? b.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChecklist((prev) => ({ ...prev, [b.id]: !prev[b.id] }))}
                    className={`rounded-full border px-2.5 py-1 text-[11px] ${checklist[b.id] ? "border-[rgba(123,151,117,0.35)] bg-[rgba(123,151,117,0.16)] text-[var(--leaf-deep)]" : "border-[var(--line)] bg-white text-[var(--foreground-soft)]"}`}
                  >
                    {checklist[b.id] ? "현장 확인 완료" : "현장 확인"}
                  </button>
                  <Link href={`/book/${b.id}`} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[11px] text-[var(--foreground-soft)]">상세</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      ) : null}

      {activeTab === "saved" ? (
      <details id="checklist" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold sm:text-base">방문 전 체크리스트</summary>
        {checklistBooths.length === 0 ? <p className="mt-2 text-sm text-[var(--foreground-soft)]">찜한 책이 있으면 자동 생성됩니다.</p> : (
          <div className="mt-3 grid gap-2">
            {checklistBooths.map((b) => (
              <label key={`chk-${b.id}`} className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white/80 p-3 text-sm">
                <input type="checkbox" checked={Boolean(checklist[b.id])} onChange={() => setChecklist((prev) => ({ ...prev, [b.id]: !prev[b.id] }))} />
                <span className={checklist[b.id] ? "line-through text-[var(--foreground-soft)]" : ""}>{b.bookTitle} ({b.stock}권)</span>
              </label>
            ))}
          </div>
        )}
      </details>
      ) : null}

      {activeTab === "consult" ? (
      <details id="yeobaek-consult" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4" open>
        <summary className="cursor-pointer list-none text-sm font-semibold sm:text-base">Yeobaek 출판 상담 및 신청하기</summary>
        <div className="mt-3 grid gap-2">
          <input
            value={consultForm.activityName}
            onChange={(e) => setConsultForm((prev) => ({ ...prev, activityName: e.target.value }))}
            placeholder="활동명"
            className="festival-input"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={consultForm.hasManuscript}
              onChange={(e) => setConsultForm((prev) => ({ ...prev, hasManuscript: e.target.value as "유" | "무" }))}
              className="festival-input"
            >
              <option value="유">원고 유</option>
              <option value="무">원고 무</option>
            </select>
            <input
              value={consultForm.genre}
              onChange={(e) => setConsultForm((prev) => ({ ...prev, genre: e.target.value }))}
              placeholder="장르"
              className="festival-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={consultForm.publishFormat}
              onChange={(e) => setConsultForm((prev) => ({ ...prev, publishFormat: e.target.value as "전자책" | "POD" }))}
              className="festival-input"
            >
              <option value="전자책">전자책</option>
              <option value="POD">POD</option>
            </select>
            <input
              value={consultForm.contact}
              onChange={(e) => setConsultForm((prev) => ({ ...prev, contact: e.target.value }))}
              placeholder="연락처"
              className="festival-input"
            />
          </div>
          <textarea
            value={consultForm.note}
            onChange={(e) => setConsultForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="추가 메모(선택)"
            className="festival-input festival-textarea"
          />
          <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3">
            <p className="text-xs font-semibold text-[var(--foreground-soft)]">출판 상담 추천</p>
            <div className="mt-2 grid gap-1">
              {consultationRecommendation.map((tip) => (
                <p key={tip} className="text-xs text-[var(--foreground-soft)]">• {tip}</p>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={submitConsultation}
            disabled={consultSubmitting}
            className="festival-button festival-button--paper disabled:opacity-60"
          >
            {consultSubmitting ? "접수 중..." : "출판 상담 신청하기"}
          </button>
          {consultMessage ? <p className="text-xs text-[var(--foreground-soft)]">{consultMessage}</p> : null}
        </div>
      </details>
      ) : null}

      {activeTab === "reviews" ? (
      <details id="reviews" className="section-card rounded-[1.4rem] p-3 sm:rounded-[1.6rem] sm:p-4" open>
        <summary className="cursor-pointer list-none text-sm font-semibold sm:text-base">짧은 후기</summary>
        <div className="mt-3 grid gap-2">
          <select value={reviewBoothId} onChange={(e) => setReviewBoothId(e.target.value)} className="festival-input">
            {booths.filter((b) => b.active).map((b) => <option key={`rv-${b.id}`} value={b.id}>{b.bookTitle} - {b.authorName ?? b.name}</option>)}
          </select>
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={`star-${s}`} type="button" onClick={() => setReviewRating(s)} className={`rounded-lg border px-2 py-1 text-sm ${reviewRating >= s ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/80"}`}>★</button>)}</div>
          <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} maxLength={70} placeholder="한두 줄로 감상을 남겨주세요." className="festival-input festival-textarea" />
          <button type="button" onClick={saveShortReview} disabled={reviewSubmitting} className="festival-button festival-button--paper disabled:opacity-60">{reviewSubmitting ? "등록 중..." : "짧은후기 등록"}</button>
          {reviewMessage ? <p className="text-xs text-[var(--foreground-soft)]">{reviewMessage}</p> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <button type="button" onClick={() => setSort("latest")} className={`rounded-full border px-3 py-1.5 ${sort === "latest" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>최신순</button>
          <button type="button" onClick={() => setSort("rating")} className={`rounded-full border px-3 py-1.5 ${sort === "rating" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>별점순</button>
          <button type="button" onClick={() => setSort("short")} className={`rounded-full border px-3 py-1.5 ${sort === "short" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>짧은문장순</button>
          <button type="button" onClick={() => setSort("trust")} className={`rounded-full border px-3 py-1.5 ${sort === "trust" ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--line)] bg-white/75"}`}>신뢰도순</button>
        </div>
        <div className="mt-3 grid gap-2">
          {reviews.slice(0, 8).map((rv) => {
            const booth = booths.find((b) => b.id === rv.boothId);
            const isAdminPick = (rv.adminNote ?? "").toLowerCase().includes("pick") || (rv.adminNote ?? "").includes("추천");
            return (
              <div key={rv.id} className="rounded-xl border border-[var(--line)] bg-white/80 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[var(--foreground-soft)]">{booth?.bookTitle ?? "도서"}</p>
                  <div className="flex items-center gap-1.5">
                    {isAdminPick ? <span className="rounded-full border border-[rgba(191,102,68,0.45)] bg-[rgba(222,133,101,0.2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-strong)]">관리자 픽</span> : null}
                    <p className="text-xs text-[var(--accent-strong)]">{"★".repeat(rv.rating)}</p>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-sm">{rv.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button type="button" disabled={Boolean(helpVoted[rv.id])} onClick={() => voteHelpful(rv.id)} className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-[11px] text-[var(--foreground-soft)] disabled:opacity-60">도움돼요 {helpVotes[rv.id] ?? 0}</button>
                    <button type="button" disabled={reportingId === rv.id} onClick={() => reportReview(rv.id)} className="rounded-full border border-[var(--line)] bg-white px-2 py-1 text-[11px] text-[var(--foreground-soft)] disabled:opacity-60">
                      {reportingId === rv.id ? "신고중..." : "신고"}
                    </button>
                  </div>
                  {rv.pending ? <p className="text-[11px] text-[var(--foreground-soft)]">검수 대기중</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </details>
      ) : null}

      <nav className="fixed bottom-3 left-1/2 z-30 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-full border border-[var(--line)] bg-[rgba(255,251,244,0.96)] p-1.5 shadow-[var(--shadow-soft)] sm:hidden">
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          <Link
            href="/discover"
            className={`rounded-full px-3 py-2 ${activeTab === "discover" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground-soft)]"}`}
          >
            검색
          </Link>
          <Link
            href="/saved"
            className={`rounded-full px-3 py-2 ${activeTab === "saved" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground-soft)]"}`}
          >
            찜
          </Link>
          <Link
            href="/reviews"
            className={`rounded-full px-3 py-2 ${activeTab === "reviews" ? "bg-[var(--accent)] text-white" : "text-[var(--foreground-soft)]"}`}
          >
            후기
          </Link>
        </div>
      </nav>
    </main>
  );
}
