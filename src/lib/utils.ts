import { BAD_WORDS } from "@/lib/constants";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function createGuestId() {
  return `guest-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function containsBadWords(input: string) {
  const normalized = input.toLowerCase();
  return BAD_WORDS.some((word) => normalized.includes(word.toLowerCase()));
}
