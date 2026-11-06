import type { CapacitorConfig } from '@capacitor/cli';

// Android APK wrapper. `dist/index.html` (built by `npm run build`) is a single
// self-contained file, so the app works fully offline inside the APK.
const config: CapacitorConfig = {
  appId: 'com.rosvn.barbiekens',
  appName: 'Barbie & the Kens',
  webDir: 'dist',
  backgroundColor: '#0a0510',
  android: {
    backgroundColor: '#0a0510',
    allowMixedContent: false,
  },
};

export default config;
