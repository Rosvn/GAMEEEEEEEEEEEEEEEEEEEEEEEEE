# Barbie & the 29 Kens – Pixel Dating Sim

One codebase, three ways to play:

| Target | How |
|---|---|
| **Website (PC)** | Keyboard (WASD/arrows, SPACE, Q/E/R, J, K, N, P, M), mouse, or a **gamepad**. Wide screens get side panels with controls, today's quests and arcade status. ⛶ = fullscreen. |
| **Website (mobile)** | Touch joystick + A button, landscape and portrait layouts, left-hand mode. "Add to Home Screen" installs it as a fullscreen offline PWA. |
| **Android APK** | Wrapped with [Capacitor](https://capacitorjs.com). Fully offline. Android back button = pause, auto-save when backgrounded, vibration feedback. |

## What's new in this version

* 🧁 **Sweet Catch** (Café arcade cabinet) – catch falling treats, combo multipliers, 3 plays a day.
* 🃏 **Memory Match** (Library cabinet) – 8 pairs, 1–3 star rewards, 2 plays a day.
* 📖 **5 new story "Interludes"** (days 2, 9, 12, 15, 18) with branching consequences – 13 chapters total.
* 📋 New daily quests + 🏆 trophies for the arcades.
* ⚙️ **Settings**: music & effects volume, mute, vibration, screen shake (Home ▸ SETUP, or Pause ▸ SETTINGS).
* 🎮 **Gamepad support** (stick/D-pad move · A talk · B back · X dress · Y journal · LB catalog · RB night · Start pause).
* 🖥️ **Desktop side panels** (controls, quests, stats).
* 📦 Real PNG app icons (192/512/maskable/Apple touch), better offline cache, **automatic APK build** (GitHub Actions).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/index.html (+ manifest, icons, sw.js)
```

## Host as a website

Upload everything in `dist/` to any static host (Netlify, Vercel, GitHub Pages, itch.io…).
It must be served over **https** for the "install app" prompt and offline cache to work.

## Get the Android APK

### Option A – no Android Studio needed (GitHub Actions)
1. Put this project at the **root** of your GitHub repo (so `package.json` is at the top level) and push to `main`.
2. Open the repo ▸ **Actions ▸ Build Android APK** (it runs on every push, or press *Run workflow*).
3. When it finishes, download **barbie-kens-apk ▸ app-debug.apk** from *Artifacts* and install it on your phone
   (allow "install unknown apps").

### Option B – locally with Android Studio
Requirements: Node 20+, [Android Studio](https://developer.android.com/studio) (SDK + JDK 21).

```bash
npm run build
npx cap add android        # first time only – creates the android/ folder
npx @capacitor/assets generate --android --iconBackgroundColor '#1c0f2a'   # app icon from assets/icon-only.png
npx cap sync android       # copies dist/ into the Android project (run after every build)
npx cap open android       # opens Android Studio
```
Then **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)** (or *Generate Signed Bundle* for the Play Store).

Optional tweaks: immersive fullscreen (`android:windowFullscreen` in `styles.xml`), orientation lock
(`android:screenOrientation` in `AndroidManifest.xml`), package id/name in `capacitor.config.ts` **before** `cap add android`.

## Project layout

```
src/game/     engine, world, rooms, sprites, audio, story, items, prefs …
src/ui/       React overlays, touch controls, mini-games, settings, desktop panels
src/platform.ts   PWA service worker, fullscreen, Android back-button / lifecycle
public/       manifest, sw.js, icons          assets/   1024px source icon for the APK
.github/workflows/android-apk.yml   automatic APK build
```
