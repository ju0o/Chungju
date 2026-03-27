'use client';

import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';

const STORAGE_KEY = 'festival-guestbook-likes';

function getLikedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveLikedIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

function getLikeCount(entryId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const counts = JSON.parse(localStorage.getItem('festival-like-counts') || '{}');
    return counts[entryId] || 0;
  } catch {
    return 0;
  }
}

export function GuestbookLikeButton({ entryId }: { entryId: string }) {
  const [liked, setLiked] = useState(() => getLikedIds().has(entryId));
  const [count, setCount] = useState(() => getLikeCount(entryId));

  const toggle = useCallback(() => {
    const ids = getLikedIds();
    const counts = JSON.parse(localStorage.getItem('festival-like-counts') || '{}');

    if (ids.has(entryId)) {
      ids.delete(entryId);
      counts[entryId] = Math.max((counts[entryId] || 0) - 1, 0);
      setLiked(false);
      setCount(counts[entryId]);
    } else {
      ids.add(entryId);
      counts[entryId] = (counts[entryId] || 0) + 1;
      setLiked(true);
      setCount(counts[entryId]);
    }

    saveLikedIds(ids);
    localStorage.setItem('festival-like-counts', JSON.stringify(counts));
  }, [entryId]);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] transition-colors hover:bg-red-50"
    >
      <Heart size={13} className={liked ? 'fill-red-400 text-red-400' : 'text-[var(--foreground-soft)]'} />
      {count > 0 && <span className={liked ? 'text-red-400 font-semibold' : 'text-[var(--foreground-soft)]'}>{count}</span>}
    </button>
  );
}
