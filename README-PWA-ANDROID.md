# DevTask — PWA and Android packaging notes

## Current web/PWA setup
- The app keeps `/DevTask/` as its Vite/GitHub Pages base path.
- `public/manifest.webmanifest` defines the English-first install experience.
- `public/icons/` contains generated starter icons. Replace these with approved final brand artwork before store submission.
- `public/sw.js` caches only the app shell/static same-origin assets. Supabase auth, REST, and storage paths are deliberately excluded from caching.
- The service worker is registered only in production builds.

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Add your own Supabase URL and publishable key locally. Never put secrets in this archive or commit `.env.local`.
3. Run `npm ci`, then `npm run build`.

## Android packaging status
`capacitor.config.json` records the selected Android application ID (`com.silentdev9.devtask`), app name, and Vite output directory. Capacitor packages and the Android native project still need to be installed/generated in an environment with package registry and Android SDK access. This archive is not an APK/AAB and must not be submitted to a store as one.

After installing Capacitor packages in a connected development environment, initialize/sync the Android project and test on physical devices. Review the current Myket developer requirements before submission, including signing, privacy policy, screenshots, app metadata, target SDK, and permissions.
