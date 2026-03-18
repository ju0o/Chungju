import type { Metadata } from "next";
import { Gowun_Batang, IBM_Plex_Sans_KR } from "next/font/google";
import { FloatingFestivalNav } from "@/components/FloatingFestivalNav";
import { PageViewTracker } from "@/components/PageViewTracker";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import "./globals.css";

const headingFont = Gowun_Batang({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const bodyFont = IBM_Plex_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "#8 율량마르쉐 애착꽃시장",
  description: "살아있던 적이 없는 꽃을 팝니다, 그런데 이제 영원히 시들지 않는. 청주 애착꽃시장 기록 웹앱.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <SessionBootstrap />
        <PageViewTracker />
        <div className="relative mx-auto min-h-screen max-w-md bg-[var(--paper)] pb-28 shadow-[0_0_0_1px_rgba(70,58,46,0.06)] md:max-w-lg">
          {children}
          <FloatingFestivalNav />
        </div>
      </body>
    </html>
  );
}
