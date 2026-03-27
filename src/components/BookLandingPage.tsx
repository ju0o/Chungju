"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EventSettings } from "@/lib/types";

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

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/[^0-9a-z가-힣]/g, "");
}

function resolveCover(title: string, imageUrl?: string) {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl;
  return COVER_FALLBACK_BY_TITLE[normalizeTitle(title)] ?? "/books/book-1.svg";
}

export function BookLandingPage({ settings }: { settings: EventSettings }) {
  const items = useMemo(
    () =>
      settings.booths
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((booth) => ({
          id: booth.id,
          title: booth.bookTitle,
          author: booth.authorName ?? booth.name,
          price: booth.bookPrice ?? "현장 문의",
          cover: resolveCover(booth.bookTitle, booth.imageUrl),
        })),
    [settings.booths],
  );
  const featuredIndex = useMemo(() => {
    const targetId = settings.featuredBookBoothId;
    if (!targetId) return 0;
    const index = items.findIndex((item) => item.id === targetId);
    return index >= 0 ? index : 0;
  }, [items, settings.featuredBookBoothId]);

  const [index, setIndex] = useState(featuredIndex);
  const [announcement, setAnnouncement] = useState<{ title: string; content: string } | null>(null);
  const [recentViewed] = useState<Array<{ id: string; title: string; author: string; cover: string }>>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("recent-books-v1") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!items.length) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcements", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success || !Array.isArray(json?.data) || !json.data[0]) return;
        setAnnouncement({ title: json.data[0].title, content: json.data[0].content });
      } catch {}
    };
    loadAnnouncement();
  }, []);

  const current = items[index];
  const curatorComment =
    current ? `${current.title}는 오늘의 마음을 차분히 정리하고 싶은 분께 특히 추천하는 한 권입니다.` : "오늘의 감정에 맞는 책을 천천히 골라보세요.";

  return (
    <main className="app-shell grid gap-4 sm:gap-5">
      <section className="section-card rounded-[1.6rem] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-eyebrow">Yeobaek Publishing</p>
            <h1 className="section-title mt-1">Yeobaek에서 내 책 출판하기</h1>
          </div>
          <Link href="/consult" className="festival-button festival-button--paper !w-auto px-4">
            출판 상담 신청
          </Link>
        </div>
      </section>

      <section className="section-card sticky top-2 z-20 rounded-[1.4rem] p-3">
        <p className="text-xs font-semibold text-[var(--accent-strong)]">오늘의 큐레이터 코멘트</p>
        <p className="mt-1 text-sm">{announcement?.content ? announcement.content : curatorComment}</p>
      </section>

      <section className="section-card soft-pattern overflow-hidden rounded-[1.7rem] p-4 sm:p-6">
        <p className="section-eyebrow">Book Hero Slider</p>
        <h2 className="section-title mt-2">율량마르쉐#8 참여 도서</h2>
        {current ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,1.2fr] sm:items-center">
            <Link href={`/book/${current.id}`} className="relative mx-auto aspect-[3/4] w-full max-w-[260px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--background-soft)] shadow-[var(--shadow-soft)] transition-transform duration-200 hover:scale-[1.01]">
              <Image src={current.cover} alt={`${current.title} 표지`} fill className="object-cover" sizes="(max-width: 640px) 70vw, 320px" priority />
            </Link>
            <div className="rounded-2xl border border-[var(--line)] bg-white/82 p-4">
              <p className="text-xs text-[var(--foreground-soft)]">{index + 1} / {items.length}</p>
              <Link href={`/book/${current.id}`} className="mt-1 block text-lg font-semibold hover:text-[var(--accent-strong)]">
                {current.title}
              </Link>
              <p className="mt-1 text-sm text-[var(--foreground-soft)]">{current.author}</p>
              <p className="mt-2 text-sm">{current.price}</p>
              <Link href={`/book/${current.id}`} className="mt-3 inline-flex rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--foreground-soft)]">
                상세 보러가기
              </Link>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-[var(--accent)]" : "bg-[rgba(94,86,72,0.3)]"}`}
                    aria-label={`${item.title} 보기`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {announcement ? (
        <section className="section-card rounded-[1.4rem] p-3">
          <p className="text-xs font-semibold text-[var(--accent-strong)]">운영자 공지 카드</p>
          <p className="mt-1 text-sm font-semibold">{announcement.title}</p>
          <p className="mt-1 text-xs text-[var(--foreground-soft)]">{announcement.content}</p>
        </section>
      ) : null}

      <section className="section-card rounded-[1.4rem] p-3">
        <h3 className="text-sm font-semibold">최근 본 도서</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {recentViewed.length === 0 ? (
            <p className="text-xs text-[var(--foreground-soft)]">아직 본 도서가 없습니다. 탐색 메뉴에서 책을 열어보세요.</p>
          ) : (
            recentViewed.map((item) => (
              <Link key={item.id} href={`/book/${item.id}`} className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white/82 p-2">
                <div className="relative h-12 w-9 overflow-hidden rounded-md border border-[var(--line)]">
                  <Image src={item.cover} alt={`${item.title} 표지`} fill className="object-cover" sizes="60px" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{item.title}</p>
                  <p className="truncate text-[11px] text-[var(--foreground-soft)]">{item.author}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="section-card rounded-[1.4rem] p-2.5">
        <div className="grid grid-cols-5 gap-1.5 text-xs">
          <Link href="/books" className="rounded-[0.9rem] bg-white/82 px-2 py-2 text-center text-[var(--foreground-soft)]">📚 책</Link>
          <Link href="/discover" className="rounded-[0.9rem] bg-white/82 px-2 py-2 text-center text-[var(--foreground-soft)]">⌕ 탐색</Link>
          <Link href="/saved" className="rounded-[0.9rem] bg-white/82 px-2 py-2 text-center text-[var(--foreground-soft)]">★ 찜</Link>
          <Link href="/reviews" className="rounded-[0.9rem] bg-white/82 px-2 py-2 text-center text-[var(--foreground-soft)]">✎ 후기</Link>
          <Link href="/consult" className="rounded-[0.9rem] bg-white/82 px-2 py-2 text-center text-[var(--foreground-soft)]">◎ 상담</Link>
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--foreground-soft)]">문의: 인스타그램 @ju0o___</p>
      </section>
    </main>
  );
}
