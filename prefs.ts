/** Player preferences – persisted on the device (works in browser, PWA and the APK). */
export interface Prefs {
  music: number;    // 0..1
  sfx: number;      // 0..1
  haptics: boolean; // vibration on phones
  shake: boolean;   // screen shake
}

const KEY = 'bk_prefs_v1';
const DEFAULTS: Prefs = { music: 1, sfx: 1, haptics: true, shake: true };

let cur: Prefs = { ...DEFAULTS };
try {
  const raw = localStorage.getItem(KEY);
  if (raw) cur = { ...DEFAULTS, ...JSON.parse(raw) };
} catch { /* ignore */ }

const listeners = new Set<() => void>();

export const prefs = {
  get: () => cur,
  set(p: Partial<Prefs>) {
    cur = { ...cur, ...p };
    try { localStorage.setItem(KEY, JSON.stringify(cur)); } catch { /* ignore */ }
    listeners.forEach((l) => l());
  },
  subscribe(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; },
};

/** Vibrate (Android WebView / mobile browsers). No-op if unsupported or disabled. */
export function buzz(pattern: number | number[]) {
  if (!cur.haptics) return;
  try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern); } catch { /* ignore */ }
}
