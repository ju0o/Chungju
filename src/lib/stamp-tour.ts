import { TOUR_BADGES } from "@/lib/constants";
import { EventSettings, StampPoint, StampState } from "@/lib/types";

export function getStampUrl(slug: string) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/stamp/${slug}`;
  }
  return `http://localhost:3000/stamp/${slug}`;
}

export function evaluateStampCompletion(points: StampPoint[], stampState: StampState, settings: EventSettings) {
  const published = points.filter((point) => point.isPublished);
  const visited = published.filter((point) => stampState.acquiredStampIds.includes(point.id));
  const locationCount = visited.filter((point) => point.pointType === "location").length;
  const boothCount = visited.filter((point) => point.pointType === "booth").length;
  const rule = settings.stampCompletionRule;
  const meetsCount = visited.length >= Math.min(rule.requiredCount, published.length || rule.requiredCount);
  const meetsLocation = locationCount >= rule.locationRequired;
  const meetsBooth = boothCount >= rule.boothRequired;
  const completed = meetsCount && meetsLocation && meetsBooth;
  const badge = TOUR_BADGES[Math.min(Math.max(visited.length - 1, 0), TOUR_BADGES.length - 1)];

  return {
    completed,
    visited,
    locationCount,
    boothCount,
    badge,
    progressText:
      rule.locationRequired > 0 || rule.boothRequired > 0
        ? `location ${locationCount}/${rule.locationRequired}, booth ${boothCount}/${rule.boothRequired}`
        : `${visited.length}/${rule.requiredCount}`,
  };
}
