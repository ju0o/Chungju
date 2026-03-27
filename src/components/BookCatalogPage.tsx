"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { inferBookGenre, resolveBookCover } from "@/lib/book-utils";
import { EventSettings } from "@/lib/types";

const ORDERED_GENRES = ["독립출판물", "시집", "산문집", "에세이"] as const;
type GenreFilter = "전체" | (typeof ORDERED_GENRES)[number];

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
    }));
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>("전체");
  const [query, setQuery] = useState("");

  const filteredBooks = (selectedGenre === "전체" ? books : books.filter((book) => book.genre === selectedGenre)).filter((book) =>
    query.trim() ? book.title.toLowerCase().includes(query.trim().toLowerCase()) : true,
  );
  const byGenre = ORDERED_GENRES.map((genre) => ({
    genre,
    items: filteredBooks.filter((book) => book.genre === genre),
  })).filter((section) => section.items.length > 0);

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
