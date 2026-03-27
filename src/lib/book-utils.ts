import { BoothProfile } from "@/lib/types";

export type BookGenre = "독립출판물" | "시집" | "산문집" | "에세이";

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
  "나비": "/books/나비.jpg",
  "별을끄다": "/books/별을끄다.jpg",
};

export function normalizeBookTitle(title: string) {
  return title.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

export function resolveBookCover(title: string, imageUrl?: string) {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return COVER_FALLBACK_BY_TITLE[normalizeBookTitle(title)] ?? "/books/book-1.svg";
}

export function inferBookGenre(booth: BoothProfile): BookGenre {
  const normalizedTitle = normalizeBookTitle(booth.bookTitle ?? "");
  if (normalizedTitle === "나비" || normalizedTitle === "별을끄다") return "독립출판물";
  if (normalizedTitle === "어제와다른내가되어") return "시집";
  if (normalizedTitle === "필터교체가필요합니다") return "산문집";
  if (normalizedTitle) return "에세이";
  const source = `${booth.subtitle} ${booth.participationType} ${booth.bookDescription ?? ""}`.toLowerCase();
  if (source.includes("시")) return "시집";
  if (source.includes("산문")) return "산문집";
  return "에세이";
}
