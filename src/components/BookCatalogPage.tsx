"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { inferBookGenre, resolveBookCover } from "@/lib/book-utils";
import { EventSettings } from "@/lib/types";

const ORDERED_GENRES = ["시집", "산문집", "에세이"] as const;
type GenreFilter = "전체" | (typeof ORDERED_GENRES)[number];
type TimeSlot = "오전" | "오후";

function includesAny(source: string, words: string[]) {
  return words.some((word) => source.includes(word));
}

export function BookCatalogPage({ settings }: { settings: EventSettings }) {
  const books = settings.booths
    .filter((booth) => booth.bookTitle?.trim())
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((booth) => ({
      id: booth.id,
      title: booth.bookTitle,
      price: booth.bookPrice ?? "현장 문의",
      genre: inferBookGenre(booth),
      cover: resolveBookCover(booth.bookTitle, booth.imageUrl),
      stock: booth.bookStock ?? 0,
      source: `${booth.bookTitle} ${booth.bookDescription ?? ""} ${booth.quote} ${booth.favoriteQuote ?? ""}`.toLowerCase(),
    }));
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>("전체");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "오전" : "오후";
  });
  const [query, setQuery] = useState("");
  const [showAssist, setShowAssist] = useState(false);

  const timePicks = useMemo(() => {
    return books
      .slice()
      .sort((a, b) => {
        const score = (book: (typeof books)[number]) => {
          const isFeatured = book.id === settings.featuredBookBoothId;
          if (timeSlot === "오전") {
            let s = 0;
            if (book.genre === "에세이") s += 38;
            if (book.genre === "산문집") s += 24;
            if (book.genre === "시집") s += 12;
            if (includesAny(book.source, ["하루", "루틴", "위로", "회복", "시작"])) s += 22;
            if (book.stock >= 5) s += 12;
            if (isFeatured) s += 14;
            return s;
          }
          let s = 0;
          if (book.genre === "시집") s += 38;
          if (book.genre === "산문집") s += 26;
          if (book.genre === "에세이") s += 14;
          if (includesAny(book.source, ["감정", "사랑", "그리움", "별", "밤", "성찰"])) s += 24;
          if (book.stock > 0 && book.stock <= 3) s += 10;
          if (isFeatured) s += 10;
          return s;
        };
        const scoreDiff = score(b) - score(a);
        if (scoreDiff !== 0) return scoreDiff;
        return a.title.localeCompare(b.title, "ko");
      })
      .slice(0, 3);
  }, [books, settings.featuredBookBoothId, timeSlot]);

  const filteredBooks = (selectedGenre === "전체" ? books : books.filter((book) => book.genre === selectedGenre)).filter((book) =>
    query.trim() ? book.title.toLowerCase().includes(query.trim().toLowerCase()) : true,
  );
  const byGenre = ORDERED_GENRES.map((genre) => ({
    genre,
    items: filteredBooks.filter((book) => book.genre === genre),
  })).filter((section) => section.items.length > 0);
  const featured = books.find((book) => book.id === settings.featuredBookBoothId) ?? books[0];
  const lowStock = settings.booths
    .filter((booth) => booth.bookTitle?.trim())
    .filter((booth) => (booth.bookStock ?? 0) > 0 && (booth.bookStock ?? 0) <= 3)
    .sort((a, b) => (a.bookStock ?? 0) - (b.bookStock ?? 0))
    .slice(0, 3)
    .map((booth) => ({
      id: booth.id,
      title: booth.bookTitle,
      stock: booth.bookStock ?? 0,
    }));
  const starterPicks = books.filter((book) => book.genre === "에세이").slice(0, 3);

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card rounded-[1.6rem] p-4 sm:p-5">
        <div className="rounded-[1.2rem] border border-[rgba(123,151,117,0.22)] bg-[linear-gradient(130deg,rgba(123,151,117,0.16),rgba(222,133,101,0.16))] p-4">
          <p className="section-eyebrow">Books</p>
          <h1 className="section-title mt-2">책</h1>
          <p className="section-description mt-2">현재 등록된 도서를 장르별로 진열했습니다. 책 카드를 클릭하면 상세페이지로 이동합니다.</p>
          <p className="mt-2 text-xs text-[var(--foreground-soft)]">문의: 인스타그램 @ju0o___</p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full border border-[var(--line)] bg-white/85 px-2.5 py-1">총 {books.length}권</span>
            <span className="rounded-full border border-[var(--line)] bg-white/85 px-2.5 py-1">현재 보기 {filteredBooks.length}권</span>
            {byGenre.map((section) => (
              <a key={`jump-${section.genre}`} href={`#genre-${section.genre}`} className="rounded-full border border-[var(--line)] bg-white/85 px-2.5 py-1">
                {section.genre} {section.items.length}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card sticky top-2 z-20 rounded-[1.1rem] p-3 sm:p-4">
        <h2 className="text-sm font-semibold">빠르게 찾기</h2>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="책 제목 검색 (예: 나,비 / 별을끄다)"
          className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["전체", ...ORDERED_GENRES] as GenreFilter[]).map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-full border px-3 py-1 text-xs ${selectedGenre === genre ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent-strong)]" : "border-[var(--line)] bg-white/85 text-[var(--foreground-soft)]"}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="section-card rounded-[1.4rem] p-3 sm:p-4">
          <p className="text-xs font-semibold text-[var(--accent-strong)]">오늘의 추천 도서</p>
          <Link href={`/book/${featured.id}`} className="mt-2 grid grid-cols-[72px,1fr] gap-3 rounded-xl border border-[var(--line)] bg-white/85 p-2.5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--background-soft)]">
              <Image src={featured.cover} alt={`${featured.title} 표지`} fill className="object-cover" sizes="90px" />
            </div>
            <div className="grid gap-1">
              <p className="text-sm font-semibold">{featured.title}</p>
              <p className="text-xs text-[var(--foreground-soft)]">{featured.price}</p>
              <p className="text-[11px] text-[var(--foreground-soft)]">운영자 대시보드에서 즉시 변경되는 추천 도서입니다.</p>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="section-card rounded-[1.4rem] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">현장 이용 추천</h2>
          <button type="button" onClick={() => setShowAssist((prev) => !prev)} className="rounded-full border border-[var(--line)] bg-white/85 px-3 py-1 text-xs text-[var(--foreground-soft)]">
            {showAssist ? "접기" : "보기"}
          </button>
        </div>
        {showAssist ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--line)] bg-white/85 p-2.5">
              <p className="text-xs font-semibold">입문 추천</p>
              <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">
                {starterPicks.length ? starterPicks.map((item) => item.title).join(" · ") : "현장 도서 확인 중"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white/85 p-2.5">
              <p className="text-xs font-semibold">품절 임박</p>
              <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">
                {lowStock.length ? lowStock.map((item) => `${item.title}(${item.stock})`).join(" · ") : "현재 여유 재고"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white/85 p-2.5">
              <p className="text-xs font-semibold">부스 문의</p>
              <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">인스타그램 @ju0o___ 로 재고/위탁 문의</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="section-card rounded-[1.4rem] p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">시간대별 추천</h2>
          <div className="flex gap-1">
            {(["오전", "오후"] as TimeSlot[]).map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`rounded-full border px-2.5 py-1 text-xs ${timeSlot === slot ? "border-[var(--leaf)] bg-[var(--leaf)]/15 text-[var(--leaf-deep)]" : "border-[var(--line)] bg-white/85 text-[var(--foreground-soft)]"}`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">
          {timeSlot === "오전"
            ? "오전 기준: 에세이/산문 우선, 하루 시작·위로 키워드, 재고 여유 도서 가중"
            : "오후 기준: 시집/산문 우선, 감정·성찰 키워드, 품절 임박 도서 가중"}
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {timePicks.map((book) => (
            <Link key={`time-${timeSlot}-${book.id}`} href={`/book/${book.id}`} className="rounded-xl border border-[var(--line)] bg-white/85 p-2.5">
              <p className="text-xs font-semibold">{book.title}</p>
              <p className="mt-1 text-[11px] text-[var(--foreground-soft)]">{book.genre} · {book.price}</p>
            </Link>
          ))}
        </div>
      </section>

      {byGenre.map((section) => (
        <section key={section.genre} id={`genre-${section.genre}`} className="section-card rounded-[1.4rem] p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{section.genre}</h2>
            <span className="text-xs text-[var(--foreground-soft)]">{section.items.length}권</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {section.items.map((book) => (
              <article key={book.id} className="rounded-2xl border border-[var(--line)] bg-white/82 p-2.5 shadow-[0_10px_24px_rgba(70,58,46,0.08)]">
                <Link href={`/book/${book.id}`} className="group grid gap-2 rounded-xl">
                  <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background-soft)] transition-transform duration-200 group-hover:scale-[1.01]">
                    <Image src={book.cover} alt={`${book.title} 표지`} fill className="object-cover" sizes="140px" />
                  </div>
                  <div className="grid gap-1 px-0.5">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight">{book.title}</p>
                    <p className="text-xs text-[var(--foreground-soft)]">{book.price}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      {filteredBooks.length === 0 ? (
        <section className="section-card rounded-[1.4rem] p-4">
          <p className="text-sm text-[var(--foreground-soft)]">조건에 맞는 도서가 없습니다. 검색어 또는 장르를 바꿔보세요.</p>
        </section>
      ) : null}
    </main>
  );
}
