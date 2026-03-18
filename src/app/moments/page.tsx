"use client";

import { useEffect, useState } from "react";
import { PaperLabel } from "@/components/CollageOrnaments";
import { MomentCard } from "@/components/MomentCard";
import { MomentForm } from "@/components/MomentForm";
import { createMoment, fetchEventSettings, fetchMoments } from "@/lib/api";
import { DEFAULT_EVENT_SETTINGS } from "@/lib/constants";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { EventSettings, MomentEntry } from "@/lib/types";

export default function MomentsPage() {
  const { session, rename } = useFestivalSession();
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const [moments, setMoments] = useState<MomentEntry[]>([]);

  useEffect(() => {
    fetchEventSettings().then(setSettings).catch(() => setSettings(DEFAULT_EVENT_SETTINGS));
    fetchMoments().then(setMoments).catch(() => undefined);
  }, []);

  return (
    <main className="app-shell grid gap-4">
      <section className="section-card paper-stack soft-pattern rounded-[1.75rem] p-5">
        <div className="flex flex-wrap gap-2">
          <PaperLabel text="Moment Archive" tone="leaf" />
          <PaperLabel text="Photo or Text" tone="petal" />
        </div>
        <h1 className="section-title mt-4">공원에서 생긴 순간</h1>
        <p className="body-copy mt-3 max-w-[28ch] text-sm text-[var(--foreground-soft)]">
          사진이 없어도 괜찮습니다. 텍스트만으로도 오늘의 장면을 남길 수 있고, 해시태그가 축제 전체 아카이브를 만듭니다.
        </p>
      </section>
      <MomentForm
        session={session}
        settings={settings}
        onSubmit={async (formData) => {
          const nickname = String(formData.get("nickname") ?? "");
          if (nickname) rename(nickname);
          const created = await createMoment(formData);
          setMoments((current) => [created, ...current]);
        }}
      />
      <section className="grid gap-3">
        {moments.filter((moment) => moment.isPublic && !moment.hidden && moment.approved !== false).map((moment) => (
          <MomentCard key={moment.id} moment={moment} />
        ))}
      </section>
    </main>
  );
}
