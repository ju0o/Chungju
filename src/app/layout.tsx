import type { Metadata, Viewport } from "next";
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
  title: "율량마르쉐#8 독서 책 큐레이션 작가 부스",
  description: "율량마르쉐#8 단일 독서 책 큐레이션 작가 부스를 위한 안내 페이지입니다.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "율량마르쉐#8",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#de8565",
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
