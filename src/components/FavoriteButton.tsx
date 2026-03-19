'use client';

import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

export function FavoriteButton({ boothId, size = 18 }: { boothId: string; size?: number }) {
  const { toggle, isFavorite } = useFavorites();
  const active = isFavorite(boothId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(boothId);
      }}
      className="shrink-0 rounded-full p-1.5 transition-colors hover:bg-[var(--accent)]/10"
      aria-label={active ? '즐겨찾기 해제' : '즐겨찾기 추가'}
    >
      <Heart
        size={size}
        className={active ? 'fill-red-400 text-red-400' : 'text-[var(--foreground-soft)]'}
      />
    </button>
  );
}
