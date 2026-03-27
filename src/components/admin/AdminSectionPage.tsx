"use client";

import { useState } from "react";
import { logoutAdmin, updateEventSettings, updateStampPoints } from "@/lib/api";
import { AdminRole, EventSettings, GeneratedCardSet, GuestbookEntry, MomentEntry, StampPoint } from "@/lib/types";
import { AdminRouteNav } from "@/components/admin/AdminRouteNav";
import { AdminPreviewPanel } from "@/components/admin/AdminPreviewPanel";
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

type SectionKey =
  | "settings"
  | "landing"
  | "programs"
  | "stamps"
  | "qr"
  | "booths"
  | "quotes"
  | "cards"
  | "content"
  | "status"
  | "access"
  | "logs";

export function AdminSectionPage({
  role,
  pathname,
  title,
  section,
  initialSettings,
  initialGuestbooks,
  initialMoments,
  initialStampPoints,
  cards = [],
}: {
  role: AdminRole;
  pathname: string;
  title: string;
  section: SectionKey;
  initialSettings: EventSettings;
  initialGuestbooks: GuestbookEntry[];
  initialMoments: MomentEntry[];
  initialStampPoints: StampPoint[];
  cards?: GeneratedCardSet[];
  summary?: unknown;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [stampPoints, setStampPoints] = useState(initialStampPoints);
  const [guestbooks, setGuestbooks] = useState(initialGuestbooks);
  const [moments, setMoments] = useState(initialMoments);
  const [saveMessage, setSaveMessage] = useState("");

  async function save() {
    const prevFeatured = settings.featuredBookBoothId;
    if (["settings", "landing", "programs", "booths", "quotes", "cards", "status"].includes(section)) {
      const updated = await updateEventSettings(settings);
      setSettings(updated);
      if (section === "settings" && prevFeatured !== updated.featuredBookBoothId) {
        setSaveMessage("추천 도서 즉시 반영됨");
      } else {
        setSaveMessage("저장 완료");
      }
      window.setTimeout(() => setSaveMessage(""), 1800);
    }
    if (section === "stamps") {
      await updateStampPoints(stampPoints);
      setSaveMessage("저장 완료");
      window.setTimeout(() => setSaveMessage(""), 1800);
    }
  }

  return (
    <main className="app-shell grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-4">
        <section className="section-card rounded-[1.75rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-[family-name:var(--font-heading)] text-4xl">{title}</h1>
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
        </section>
        <AdminRouteNav role={role} pathname={pathname} />
        {section === "settings" ? <SettingsTab settings={settings} onChange={setSettings} /> : null}
        {section === "landing" ? <LandingTab settings={settings} onChange={setSettings} /> : null}
        {section === "programs" ? <ProgramsTab items={settings.programs} onChange={(programs) => setSettings({ ...settings, programs })} canEditAll={role !== "field_moderator"} /> : null}
        {section === "stamps" ? <StampPointsTab points={stampPoints} onChange={setStampPoints} settings={settings} onSettingsChange={setSettings} booths={settings.booths} /> : null}
        {section === "qr" ? <QRGeneratorTab points={stampPoints} /> : null}
        {section === "booths" ? <BoothsTab booths={settings.booths} onChange={(booths) => setSettings({ ...settings, booths })} /> : null}
        {section === "quotes" ? <QuotesTab quotes={settings.quotes} onChange={(quotes) => setSettings({ ...settings, quotes })} /> : null}
        {section === "cards" ? <CardsTab cardTemplate={settings.cardTemplate} cards={cards} onChange={(cardTemplate) => setSettings({ ...settings, cardTemplate })} /> : null}
        {section === "content" ? <ContentTab guestbooks={guestbooks} moments={moments} onGuestbooksChange={setGuestbooks} onMomentsChange={setMoments} /> : null}
        {section === "status" ? <StatusTab siteMode={settings.siteMode} onChange={(siteMode) => setSettings({ ...settings, siteMode })} allowedModes={role === "content_manager" ? ["preparing", "live", "ended"] : ["preparing", "live", "ended", "archive"]} /> : null}
        {section === "access" ? <AccessTab /> : null}
        {section === "logs" ? <LogsTab /> : null}
        {saveMessage ? (
          <section className="section-card rounded-[1.25rem] p-3 text-sm text-[var(--leaf-deep)]">
            {saveMessage}
          </section>
        ) : null}
        {!["content", "access", "logs", "qr"].includes(section) ? (
          <button type="button" onClick={save} className="festival-button bg-[var(--accent)] text-white">
            저장하기
          </button>
        ) : null}
      </div>
      <AdminPreviewPanel settings={settings} stampPoints={stampPoints} />
    </main>
  );
}
