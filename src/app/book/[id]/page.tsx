import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookShareActions } from "@/components/BookShareActions";
import { inferBookGenre, resolveBookCover } from "@/lib/book-utils";
import { getSiteSettings } from "@/lib/site-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const settings = await getSiteSettings();
  const booth = settings.booths.find((item) => item.id === id);
  if (!booth) return { title: "도서를 찾을 수 없습니다." };
  const cover = resolveBookCover(booth.bookTitle, booth.imageUrl);
  return {
    title: `${booth.bookTitle} | 율량마르쉐#8`,
    description: booth.bookDescription ?? booth.description,
    openGraph: {
      title: `${booth.bookTitle} | 율량마르쉐#8`,
      description: booth.bookDescription ?? booth.description,
      images: [cover],
    },
  };
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = await getSiteSettings();
  const orderedBooks = settings.booths
    .filter((item) => item.bookTitle?.trim())
    .slice()
    .sort((a, b) => a.order - b.order);
  const currentIndex = orderedBooks.findIndex((item) => item.id === id);
  const booth = currentIndex >= 0 ? orderedBooks[currentIndex] : undefined;
  if (!booth) notFound();
  const prevBook = currentIndex > 0 ? orderedBooks[currentIndex - 1] : null;
  const nextBook = currentIndex < orderedBooks.length - 1 ? orderedBooks[currentIndex + 1] : null;
  const cover = resolveBookCover(booth.bookTitle, booth.imageUrl);
  const genre = inferBookGenre(booth);
  const snsValue = (booth.snsLink ?? "").trim();
  const snsHref = snsValue
    ? snsValue.startsWith("http")
      ? snsValue
      : `https://instagram.com/${snsValue.replace(/^@/, "")}`
    : "";

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card rounded-[1.6rem] p-4 sm:p-5">
        <div className="flex items-center gap-3 text-xs text-[var(--foreground-soft)]">
          <Link href="/books">{"<"} 책 목록</Link>
          <Link href="/discover">탐색</Link>
        </div>
        <div className="mt-2 rounded-[1.2rem] border border-[rgba(123,151,117,0.2)] bg-[linear-gradient(120deg,rgba(123,151,117,0.12),rgba(222,133,101,0.12))] p-3.5">
          <h1 className="section-title">{booth.bookTitle}</h1>
          <p className="text-sm text-[var(--foreground-soft)]">{booth.authorName ?? booth.name}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className="rounded-full bg-white/80 px-2 py-0.5">{booth.bookPrice ?? "현장 문의"}</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5">{booth.bookStock ?? 0}권</span>
            <span className="rounded-full bg-white/80 px-2 py-0.5">{genre}</span>
          </div>
        </div>
      </section>

      <section className="section-card rounded-[1.6rem] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[190px,1fr]">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--background-soft)] shadow-[0_10px_26px_rgba(70,58,46,0.1)]">
            <Image src={cover} alt={`${booth.bookTitle} 표지`} fill className="object-cover" sizes="240px" priority />
          </div>
          <div className="grid gap-2.5">
            <div className="rounded-xl border border-[var(--line)] bg-white/85 p-3">
              <p className="text-xs text-[var(--foreground-soft)]">책 소개</p>
              <p className="mt-1 text-sm">{booth.bookDescription ?? booth.description}</p>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white/85 p-3">
              <p className="text-xs text-[var(--foreground-soft)]">책 한 줄 소개</p>
              <p className="mt-1 text-sm">{booth.favoriteQuote ?? booth.quote}</p>
            </div>
            {booth.authorMessage ? (
              <div className="rounded-xl border border-[var(--line)] bg-white/85 p-3">
                <p className="text-xs text-[var(--foreground-soft)]">독자에게 전하는 메시지</p>
                <p className="mt-1 whitespace-pre-line text-sm">{booth.authorMessage}</p>
              </div>
            ) : null}
            {snsHref ? (
              <a href={snsHref} target="_blank" rel="noreferrer" className="text-sm text-[var(--accent-strong)]">
                작가 SNS 바로가기
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-card rounded-[1.6rem] p-4 sm:p-5">
        <p className="text-xs font-semibold text-[var(--accent-strong)]">공유 링크</p>
        <div className="mt-2">
          <BookShareActions path={`/book/${booth.id}`} title={booth.bookTitle} author={booth.authorName ?? booth.name} />
        </div>
        <p className="mt-2 text-[11px] text-[var(--foreground-soft)]">문의: 인스타그램 @ju0o___</p>
      </section>

      <section className="section-card rounded-[1.6rem] p-4 sm:p-5">
        <p className="text-xs font-semibold text-[var(--accent-strong)]">다른 도서 이동</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {prevBook ? (
            <Link href={`/book/${prevBook.id}`} className="rounded-xl border border-[var(--line)] bg-white/85 p-3">
              <p className="text-[11px] text-[var(--foreground-soft)]">이전 책</p>
              <p className="mt-1 text-sm font-semibold line-clamp-2">{prevBook.bookTitle}</p>
            </Link>
          ) : (
            <div className="rounded-xl border border-[var(--line)] bg-white/60 p-3 opacity-60">
              <p className="text-[11px] text-[var(--foreground-soft)]">이전 책</p>
              <p className="mt-1 text-sm">첫 도서입니다</p>
            </div>
          )}
          {nextBook ? (
            <Link href={`/book/${nextBook.id}`} className="rounded-xl border border-[var(--line)] bg-white/85 p-3 text-right">
              <p className="text-[11px] text-[var(--foreground-soft)]">다음 책</p>
              <p className="mt-1 text-sm font-semibold line-clamp-2">{nextBook.bookTitle}</p>
            </Link>
          ) : (
            <div className="rounded-xl border border-[var(--line)] bg-white/60 p-3 text-right opacity-60">
              <p className="text-[11px] text-[var(--foreground-soft)]">다음 책</p>
              <p className="mt-1 text-sm">마지막 도서입니다</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
