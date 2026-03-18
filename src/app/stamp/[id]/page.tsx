"use client";

import { useEffect, useMemo, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { QRStampResultCard } from "@/components/QRStampResultCard";
import { fetchEventSettings, fetchStampPoints } from "@/lib/api";
import { DEFAULT_EVENT_SETTINGS, DEFAULT_STAMP_POINTS } from "@/lib/constants";
import { useFestivalSession } from "@/hooks/useFestivalSession";
import { EventSettings, StampPoint } from "@/lib/types";

export default function StampPage() {
  const params = useParams<{ id: string }>();
  const { session, stampState, upsertStampState } = useFestivalSession();
  const [siteMode, setSiteMode] = useState("live");
  const [points, setPoints] = useState<StampPoint[]>(DEFAULT_STAMP_POINTS);
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_EVENT_SETTINGS);
  const point = useMemo(
    () => points.find((item) => item.slug === params.id),
    [params.id, points],
  );

  useEffect(() => {
    fetchStampPoints().then(setPoints).catch(() => setPoints(DEFAULT_STAMP_POINTS));
    fetchEventSettings().then((data) => {
      setSettings(data);
      setSiteMode(data.siteMode);
    }).catch(() => undefined);
  }, []);

  if (!point) {
    notFound();
  }

  return (
    <main className="app-shell grid gap-4">
      <QRStampResultCard
        point={point}
        stampState={stampState}
        guestId={session?.guestId ?? "guest-anonymous"}
        onAcquire={upsertStampState}
        points={points}
        settings={settings}
        disabled={siteMode === "ended" || siteMode === "archive"}
      />
    </main>
  );
}
