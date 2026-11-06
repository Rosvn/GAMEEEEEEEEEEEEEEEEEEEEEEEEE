import { useCallback, useSyncExternalStore } from 'react';

/** Landscape phones: game is centred, controls live on the left/right screen edges. */
export const SIDE_MQ = '(orientation: landscape) and (pointer: coarse) and (max-height: 620px)';

export const isTouch = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

export function useMedia(query: string): boolean {
  const subscribe = useCallback((cb: () => void) => {
    const m = window.matchMedia(query);
    m.addEventListener('change', cb);
    return () => m.removeEventListener('change', cb);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/** Tiny vibration tick for tactile feedback (no-op where unsupported). */
export function haptic(ms = 10) {
  try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms); } catch { /* ignore */ }
}

/* --- left-handed layout preference (persisted) --- */
const KEY = 'barbie-lefty';
const listeners = new Set<() => void>();
let lefty = false;
try { lefty = localStorage.getItem(KEY) === '1'; } catch { /* ignore */ }

export function setLefty(v: boolean) {
  lefty = v;
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useLefty(): boolean {
  return useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => lefty, () => false);
}
