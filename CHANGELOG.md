# 📋 Changelog

All notable changes to the **AnimaFind** project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-11-05

### 🚀 Added
- **Automated Testing Suite**: Implemented comprehensive unit and integration test infrastructure using native test runner and `tsx`. Created test suites covering procedural card generation (`tests/card-gen.test.ts`), computer vision & anti-cheat heuristics (`tests/vision.test.ts`), geospatial distance & coordinate fuzzing (`tests/geo.test.ts`), local-first storage and round lifecycle (`tests/local-store.test.ts`), and store economy limits (`tests/economy.test.ts`).
- **Card Search Engine**: Added live keyword search input to the Field Journal Album (`src/app/album/page.tsx`), enabling filtering by card name, species, or taxonomic class.
- **Card Release Confirmation Modal**: Added safe two-step confirmation dialog with destructive warning before releasing collected cards back into the wild (`src/components/CardDetailView.tsx`).
- **In-Place Privacy & Ethics Modal**: Implemented interactive modal in the onboarding flow (`src/components/Onboarding.tsx`) allowing naturalists to review full privacy policies without navigating away or breaking onboarding state.
- **Manual GPS Recenter Control**: Added quick location refresh button to Community Map (`src/app/map/page.tsx`) with feedback for location status and empty state display.
- **Zero-Cans Quick Action Bar**: Added direct navigation shortcuts ("Visit Shop 🥫" and "View Album 📔") to the scanner screen when cans are depleted (`src/app/page.tsx`).
- **Comprehensive GitHub Automation**: Configured GitHub Actions workflows for continuous integration (`.github/workflows/android-build.yml`), iOS simulator build verification (`.github/workflows/ios-build.yml`), and automated tagged semantic releases (`.github/workflows/release.yml`).
- **GitHub Issue & PR Templates**: Created standardized forms for bug reports, feature suggestions, and pull request quality checklists in `.github/`.
- **Root Repository Configuration**: Created root `.gitignore`, `.gitattributes`, `.editorconfig`, `LICENSE` (MIT), and `.env.example`.

### 🔄 Changed
- **Database Connection Resilience**: Updated database pool initialization (`src/db/index.ts`) to gracefully load `.env` variables and prevent module import crashes when running standalone offline tests without an active PostgreSQL instance.
- **Energy Regeneration Synchronization**: Improved countdown timer in `src/components/AppShell.tsx` to automatically trigger state refresh upon hitting zero, ensuring regenerated cans appear immediately in the UI without waiting for background polling cycles.
- **Mobile Build Subprocess Safety**: Sanitized `child_process.spawnSync` invocation in `scripts/build-mobile.cjs` by disabling `shell: true`, resolving Node.js `DEP0190` security warnings.
- **Field Crew Username Validation**: Added validation in `src/app/friends/page.tsx` preventing submission of empty or whitespace usernames, with automatic input clearing upon success.
- **Album Empty State Feedback**: Differentiated between total zero-card empty state ("Go outside and scan") and filter/search zero-match state with a one-click "Reset all filters" button.

### 🐛 Fixed
- **Fixed Onboarding Navigation Deadlock**: Resolved an issue where tapping the privacy policy link during onboarding routed to `/settings#privacy`, which redirected back to step 0 because GDPR consent had not yet been granted.
- **Fixed Silent Destructive Card Deletion**: Corrected unconfirmed card removal in `CardDetailView.tsx` with error handling and user feedback.
- **Fixed PvP Screen Blank State**: Added loading spinners and empty states to `src/app/pvp/page.tsx`.
- **Fixed Proximity Map Pin Missing Empty State**: Added explanatory empty state when no community pins exist in the local vicinity (`src/app/map/page.tsx`).

### 🛡️ Security
- **Production Android ProGuard / R8 Rules**: Configured comprehensive obfuscation rules (`android/app/proguard-rules.pro`) to protect WebView interfaces, Capacitor bridge bindings, and line number metadata for release builds.
- **Environment & Secret Isolation**: Removed exposed credentials from tracking via root `.gitignore`. Documented environment variables in `.env.example`.
- **Release Signing Automation**: Configured `android/app/build.gradle` to securely read release signing credentials from environment variables (`ANDROID_KEYSTORE_PATH`) or Gradle properties without committing private keystores.

### ⚡ Performance
- **IndexedDB Backup Engine**: Integrated non-blocking IndexedDB persistence for mobile WebViews with fallback pruning for storage quota management.
- **Optimized Mobile Asset Sync**: Static site export compiles in ~2 seconds with tree-shaken static assets synced directly to native Android and iOS asset directories.

### 📚 Documentation
- Published `README.md` with complete architecture matrix, setup guides, and feature walkthrough.
- Created `docs/SETUP.md` with exact Node.js, JDK 21, and Android SDK specifications.
- Created `docs/ARCHITECTURE.md` documenting the dual-engine local-first architecture and vision anti-cheat pipeline.
- Created `docs/BUILD_AND_RELEASE.md` covering keystore creation, release signing, and CI/CD operations.
- Added `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
