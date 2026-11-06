import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import type { Game } from './game/engine';

/** True when running inside the Android / iOS Capacitor shell (the APK). */
export const isNative = Capacitor.isNativePlatform();

/** True when launched from the home screen / installed as a PWA. */
export const isStandalone =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true);

/** Register the offline service worker (website / PWA only – never inside the APK). */
export function registerServiceWorker() {
  if (isNative || !('serviceWorker' in navigator)) return;
  const { protocol, hostname } = window.location;
  const ok = protocol === 'https:' || hostname === 'localhost' || hostname === '127.0.0.1';
  if (!ok) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* offline cache is optional */ });
  });
}

/* ------------------------------------------------------------ fullscreen (PC / web) */
type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

export const canFullscreen =
  typeof document !== 'undefined' &&
  !!(document.documentElement.requestFullscreen || (document.documentElement as FsEl).webkitRequestFullscreen);

export function isFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

export function toggleFullscreen() {
  const d = document as FsDoc;
  const el = document.documentElement as FsEl;
  try {
    if (isFullscreen()) {
      (d.exitFullscreen ?? d.webkitExitFullscreen)?.call(d);
    } else {
      (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
    }
  } catch { /* ignore */ }
}

/* ------------------------------------------------------------ APK lifecycle */
/** Wire Android back button + background/foreground to the game. Returns a cleanup fn. */
export function attachNativeLifecycle(g: Game): () => void {
  if (!isNative) return () => { /* web: nothing to do */ };
  const handles: Array<{ remove: () => void }> = [];
  let dead = false;
  const add = (p: Promise<{ remove: () => void }>) => p.then((h) => { if (dead) h.remove(); else handles.push(h); }).catch(() => { /* ignore */ });

  // Back button: behaves like ESC (close panel / pause); on the title screen it exits the app.
  add(CapApp.addListener('backButton', () => {
    if (g.mode === 'title') { CapApp.exitApp(); return; }
    if (g.mode === 'cutscene' || g.mode === 'night') return;
    g.keyDown('Escape', false);
    g.keyUp('Escape');
  }));
  // Going to the background: pause + save so progress is never lost.
  add(CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) return;
    if (g.mode === 'play') g.togglePause();
    if (g.mode !== 'title') g.save();
  }));

  return () => { dead = true; handles.forEach((h) => h.remove()); };
}
