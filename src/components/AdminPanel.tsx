"use client";

import { useMemo, useState } from "react";
import { logoutAdmin, updateEventSettings, updateStampPoints } from "@/lib/api";
import { ROLE_LABELS, ROLE_TABS } from "@/lib/constants";
import { AdminAuditLog, AdminRole, EventSettings, GuestbookEntry, MomentEntry, StampPoint } from "@/lib/types";
import { AdminTabNav } from "@/components/admin/AdminTabNav";
import { AdminPreviewPanel } from "@/components/admin/AdminPreviewPanel";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { LandingTab } from "@/components/admin/LandingTab";
import { ProgramsTab } from "@/components/admin/ProgramsTab";
import { StampPointsTab } from "@/components/admin/StampPointsTab";
import { BoothsTab } from "@/components/admin/BoothsTab";
import { QuotesTab } from "@/components/admin/QuotesTab";
import { CardsTab } from "@/components/admin/CardsTab";
import { ContentTab } from "@/components/admin/ContentTab";
import { StatusTab } from "@/components/admin/StatusTab";
import { AccessTab } from "@/components/admin/AccessTab";
import { LogsTab } from "@/components/admin/LogsTab";
import { QRGeneratorTab } from "@/components/admin/QRGeneratorTab";

type Props = {
  role: AdminRole;
  initialSettings: EventSettings;
  initialGuestbooks: GuestbookEntry[];
  initialMoments: MomentEntry[];
  initialStampPoints: StampPoint[];
  initialTab?: keyof typeof tabMeta;
  summary: {
    siteMode: string;
    totalPageViews: number;
    uniqueGuestCount: number;
    routeHits: Record<string, number>;
    hourlyHits: Record<string, number>;
    guestbookCount: number;
    momentCount: number;
    stampCompletionCount: number;
    hiddenQueueCount: number;
    programCount: number;
    boothCount: number;
    recentLogs: AdminAuditLog[];
  };
};

const tabMeta = {
  overview: "대시보드 개요",
  settings: "기본 설정",
  landing: "랜딩 관리",
  programs: "프로그램 관리",
  stamps: "스탬프 / 지도",
  qr: "QR Generator",
  booths: "문화 부스 / 작가",
  quotes: "문장 뽑기",
  cards: "카드뉴스 설정",
  content: "콘텐츠 관리",
  status: "사이트 상태",
  access: "접근 관리",
  logs: "운영 로그",
} as const;

export function AdminPanel({
  role,
  initialSettings,
  initialGuestbooks,
  initialMoments,
  initialStampPoints,
  summary,
  initialTab,
}: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] = useState(initialSettings);
  const [stampPoints, setStampPoints] = useState(initialStampPoints);
  const [savedStampPoints, setSavedStampPoints] = useState(initialStampPoints);
  const [guestbooks, setGuestbooks] = useState(initialGuestbooks);
  const [moments, setMoments] = useState(initialMoments);
  const availableTabs = ROLE_TABS[role].map((key) => ({ key, label: tabMeta[key] }));
  const [activeTab, setActiveTab] = useState(initialTab ?? availableTabs[0]?.key ?? "overview");
  const dirty = useMemo(
    () =>
      JSON.stringify(settings) !== JSON.stringify(savedSettings) ||
      JSON.stringify(stampPoints) !== JSON.stringify(savedStampPoints),
    [savedSettings, savedStampPoints, settings, stampPoints],
  );

  async function handlePublish() {
    const saved = await updateEventSettings(settings);
    const savedStamps = await updateStampPoints(stampPoints);
    setSettings(saved);
    setSavedSettings(saved);
    setStampPoints(savedStamps);
    setSavedStampPoints(savedStamps);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-4">
      <section className="section-card rounded-[1.75rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {ROLE_LABELS[role]}
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-heading)] text-4xl">운영자 대시보드</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logoutAdmin();
              window.location.href = "/admin/login";
            }}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs"
          >
            로그아웃
          </button>
        </div>
        <AdminTabNav items={availableTabs} activeTab={activeTab} onSelect={(tab) => setActiveTab(tab as typeof activeTab)} />
        <div className="mt-4 flex gap-2">
          <button type="button" className="rounded-full border border-[var(--line)] px-4 py-2 text-xs">
            임시저장
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs text-white"
          >
            게시하기
          </button>
          <button
            type="button"
            onClick={() => {
              setSettings(savedSettings);
              setStampPoints(savedStampPoints);
            }}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs"
          >
            되돌리기
          </button>
          <div className="ml-auto self-center text-xs text-[var(--muted)]">
            {dirty ? "게시 전 수정사항 있음" : "게시본과 동기화됨"}
          </div>
        </div>
      </section>

      {activeTab === "overview" ? <OverviewTab role={role} summary={summary} /> : null}
      {activeTab === "settings" ? <SettingsTab settings={settings} onChange={setSettings} /> : null}
      {activeTab === "landing" ? <LandingTab settings={settings} onChange={setSettings} /> : null}
      {activeTab === "programs" ? (
        <ProgramsTab
          items={settings.programs}
          onChange={(programs) => setSettings({ ...settings, programs })}
          canEditAll={role !== "field_moderator"}
        />
      ) : null}
      {activeTab === "stamps" ? <StampPointsTab points={stampPoints} onChange={setStampPoints} settings={settings} onSettingsChange={setSettings} booths={settings.booths} /> : null}
      {activeTab === "qr" ? <QRGeneratorTab points={stampPoints} /> : null}
      {activeTab === "booths" ? (
        <BoothsTab booths={settings.booths} onChange={(booths) => setSettings({ ...settings, booths })} />
      ) : null}
      {activeTab === "quotes" ? (
        <QuotesTab quotes={settings.quotes} onChange={(quotes) => setSettings({ ...settings, quotes })} />
      ) : null}
      {activeTab === "cards" ? (
        <CardsTab
          cardTemplate={settings.cardTemplate}
          cards={[]}
          onChange={(cardTemplate) => setSettings({ ...settings, cardTemplate })}
        />
      ) : null}
      {activeTab === "content" ? (
        <ContentTab
          guestbooks={guestbooks}
          moments={moments}
          onGuestbooksChange={setGuestbooks}
          onMomentsChange={setMoments}
        />
      ) : null}
      {activeTab === "status" ? (
        <StatusTab
          siteMode={settings.siteMode}
          onChange={(siteMode) => setSettings({ ...settings, siteMode })}
          allowedModes={role === "content_manager" ? ["preparing", "live", "ended"] : ["preparing", "live", "ended", "archive"]}
        />
      ) : null}
      {activeTab === "access" ? <AccessTab /> : null}
      {activeTab === "logs" ? <LogsTab /> : null}
      </div>
      <AdminPreviewPanel settings={settings} stampPoints={stampPoints} />
    </div>
  );
}
