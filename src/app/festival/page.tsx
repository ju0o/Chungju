import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FestivalPage() {
  const festival = await prisma.festival.findFirst({
    where: { isActive: true },
    include: {
      _count: { select: { booths: true } },
    },
  });

  if (!festival) {
    return (
      <main className="app-shell grid gap-6 p-5">
        <div className="section-card rounded-[1.75rem] p-8 text-center">
          <h1 className="section-title">축제 준비 중</h1>
          <p className="body-copy mt-3 text-[var(--foreground-soft)]">현재 등록된 축제가 없습니다.</p>
        </div>
      </main>
    );
  }

  const notices = (festival.notices as Array<{ title: string; content: string; date: string; isPinned?: boolean }>) || [];
  const faqs = (festival.faqs as Array<{ question: string; answer: string }>) || [];
  const schedule = (festival.schedule as Array<{ time: string; title: string; description: string; location?: string; date?: string }>) || [];

  const isLive = new Date() >= festival.startDate && new Date() <= festival.endDate;

  return (
    <main className="app-shell grid gap-4">
      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-b from-[var(--accent-coral)]/42 to-[var(--accent-petal)]/48 p-6 pb-8">
        {festival.heroImageUrl && (
          <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${festival.heroImageUrl})` }} />
        )}
        <div className="relative z-10">
          <div className="mb-2 inline-block rounded-full border border-[var(--line)] bg-white/80 px-3 py-1 text-xs font-medium text-[var(--foreground)] backdrop-blur-sm">
            {isLive ? '🎉 진행 중' : festival.startDate > new Date() ? '📅 예정' : '📸 종료'}
          </div>
          <h1 className="section-title text-2xl font-bold text-[var(--foreground)]">{festival.name}</h1>
          <p className="body-copy mt-2 text-[var(--foreground-soft)]">{festival.description}</p>
          <div className="mt-4 grid gap-2 text-sm text-[var(--foreground-soft)]">
            <div>📍 {festival.location}</div>
            <div>📅 {new Date(festival.startDate).toLocaleDateString('ko-KR')} ~ {new Date(festival.endDate).toLocaleDateString('ko-KR')}</div>
            <div>🏪 {festival._count.booths}개 부스 참여</div>
          </div>
        </div>
      </section>

      {/* 빠른 링크 */}
      <section className="grid grid-cols-4 gap-3 px-4">
        {[
          { href: '/booths', icon: '🏪', label: '부스 보기' },
          { href: '/reviews', icon: '💬', label: '후기 보기' },
          { href: '/favorites', icon: '❤️', label: '찜한 책' },
          { href: '/about', icon: '📚', label: '페이지 소개' },
          { href: '/notices', icon: '📋', label: '공지' },
          { href: '/my', icon: '👤', label: '마이페이지' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="section-card flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-transform hover:scale-[1.02]">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </section>

      {/* 일정 */}
      {schedule.length > 0 && (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="section-title mb-4">📋 행사 일정</h2>
          <div className="grid gap-3">
            {schedule.map((item, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-[var(--line)] bg-white/70 p-4">
                <div className="flex-shrink-0 text-sm font-bold text-[var(--accent-coral)]">{item.time}</div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-[var(--foreground-soft)]">{item.description}</div>
                  {item.location && <div className="mt-1 text-xs text-[var(--accent-leaf)]">📍 {item.location}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 공지사항 */}
      {notices.length > 0 && (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="section-title mb-4">📢 공지사항</h2>
          <div className="grid gap-3">
            {notices.map((notice, i) => (
              <details key={i} className="rounded-xl border border-[var(--line)] bg-white/70">
                <summary className="cursor-pointer p-4 font-medium">
                  {notice.isPinned && <span className="mr-1 text-[var(--accent-coral)]">📌</span>}
                  {notice.title}
                  <span className="ml-2 text-xs text-[var(--foreground-soft)]">{notice.date}</span>
                </summary>
                <div className="border-t border-[var(--line)] p-4 text-sm text-[var(--foreground-soft)]">
                  {notice.content}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section-card rounded-[1.75rem] p-5">
          <h2 className="section-title mb-4">❓ 자주 묻는 질문</h2>
          <div className="grid gap-2">
            {faqs.map((faq, i) => (
              <details key={i} className="rounded-xl border border-[var(--line)] bg-white/70">
                <summary className="cursor-pointer p-4 font-medium text-sm">Q. {faq.question}</summary>
                <div className="border-t border-[var(--line)] p-4 text-sm text-[var(--foreground-soft)]">
                  A. {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
