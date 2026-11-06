# 🐾 AnimaFind (Critter Codex)

<div align="center">

**Real-world wildlife exploration meets procedural collectible card gaming.**

[![Latest Release](https://img.shields.io/github/v/release/Gheorghe-dev/AnimaFind?color=orange)](https://github.com/Gheorghe-dev/AnimaFind/releases/latest)
[![Android CI Build](https://github.com/Gheorghe-dev/AnimaFind/actions/workflows/android-build.yml/badge.svg)](https://github.com/Gheorghe-dev/AnimaFind/actions/workflows/android-build.yml)
[![iOS Build](https://github.com/Gheorghe-dev/AnimaFind/actions/workflows/ios-build.yml/badge.svg)](https://github.com/Gheorghe-dev/AnimaFind/actions/workflows/ios-build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Master Docs: PDF](https://img.shields.io/badge/Master%20Docs-PDF%20(14%20Pages)-purple.svg)](./docs/AnimaFind_Full_Documentation.pdf)
[![Capacitor](https://img.shields.io/badge/Capacitor-v8-blue.svg)](https://capacitorjs.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Quickstart](#-quickstart--local-development) • [Mobile Builds & Releases](#-mobile-builds-android--ios) • [Architecture](#-architecture) • [Documentation](#-documentation-links)

</div>

---

## 📖 Overview

**AnimaFind** gamifies nature appreciation and biodiversity exploration. Point your smartphone camera at living animals in your surroundings, pass on-device heuristic vision checks that detect physical depth while rejecting spoofed digital screens, land the intuitive tin-can toss minigame, and mint a procedurally generated collectible card with unique combat stats, abilities, serial numbers, and 5 rarity tiers!

```
  [1. Discover]      Locate a real animal (bird, mammal, insect, reptile, amphibian).
        ↓
  [2. Viewfinder]    Real-time on-device heuristics check confidence, parallax, & screen-glare.
        ↓
  [3. Capture]       Snap a photo and confirm the species shortlist.
        ↓
  [4. Toss Game]     Spend 1 tin can (energy) to flick the can into the drifting target zone.
        ↓
  [5. Mint Card]     Roll rarity tier (1–5), procedural stats, serial number, and abilities.
        ↓
  [6. Collect/Play]  Browse Album, Codex, Community Map, Friend Leaderboards, and Vote on PvP!
```

---

## ✨ Key Features

- **📱 On-Device Computer Vision & Anti-Cheat Pipeline**:
  - Center-weighted $32 \times 32$ luminance feature extraction directly on the client canvas.
  - Multi-class heuristic classification (`Mammal`, `Bird`, `Insect`, `Reptile`, `Amphibian`, `Other`).
  - **Parallax Motion Scoring**: Verifies true 3D scene depth and rejects flat static paper photos.
  - **Moiré Frequency Filtering**: Identifies high-frequency raster artifacts from monitors and phone screens.
  - **64-bit Perceptual Hashing (pHash)**: Rejects duplicate photo submissions.
  - Specimen simulator button (`🎲`) for testing and demonstration without a live camera.

- **🥫 Physics-Based Tin-Can Toss Minigame**:
  - Intuitive flick-and-toss mechanic with normalized delta-time parabolic physics.
  - Moving target zone and progressive feedback across 3 attempts per round.

- **🃏 Procedural Card Minting & Holographic 3D Cards**:
  - **Museum-Grade Specimen Vector Artwork**: Procedural vector illustration generator (`src/lib/specimen-art.tsx`) creates rich, stylized botanical/zoological plates for all 35 European wildlife species across all 5 rarity tiers.
  - **Dynamic 3D Holographic Tilt**: Interactive card inspection with pointer-tracking 3D perspective, dynamic specular lighting, and iridescent foil reflections on rare tiers.
  - **Dual Plate Switcher**: Toggle seamlessly between raw field camera captures and zoological specimen plates.
  - **Tactile Sound & Haptics**: Pure Web Audio API offline synthesizer for card flip audio, target lock, can tossing, and haptic vibration (with header volume toggle).
  - **5 Rarity Tiers:** Hedgerow (Tier 1), Meadow (Tier 2), Twilight (Tier 3), Emberwood (Tier 4), and Aurora (Tier 5 Legendary with golden glow and animated sparkles).
  - Globally incremented serial numbers per rarity tier with combinatorial procedural names and abilities.

- **📖 Biodiversity Encyclopedia (Codex)**:
  - Tracks discovery progress across 35 curated European wildlife species.
  - Progress bars by taxonomic class with rarity ratings and leave-no-trace ethics badges.

- **🗺️ Fuzzed Community Discovery Map**:
  - Real-world interactive mapping powered by **OpenStreetMap** and **Leaflet** (100% free, zero API key or billing account required).
  - Dynamic client-only rendering (`ssr: false`) with animated loading skeleton.
  - Interactive pan, smooth zoom controls, recenter radar button, and floating compass.
  - **Wildlife Protection Fuzzing**: Non-sensitive species fuzzed to ~150 m; sensitive species fuzzed to ~5 km or kept confidential to prevent poaching.
  - **250m Proximity Claiming**: Interactive proximity circle (`L.circle`) with pulsing GPS indicator; claim nearby sightings into your journal.
  - Custom HTML taxon marker pins (`L.divIcon`) with live bounce animations for claimable pins.

- **🎨 Unified Custom Icon System**:
  - Replaced all emojis across the entire app with 60+ custom, professional SVG icons.
  - Consistent design tokens: 24×24 viewbox, 2.0 stroke weight, rounded joints, and `currentColor` theme inheritance.
  - Includes dedicated taxonomic resolvers (`<TaxonIcon />`) and avatar resolvers (`<AvatarIcon />`).

- **👥 Social Crew & PvP Roadmap**:
  - Compare deck diversity, highest rarity finds, and stats with friends.
  - Community roadmap voting on upcoming PvP combat systems.

- **🔋 Dual-Engine Offline Resilience**:
  - 100% playable offline in remote nature reserves without server connectivity using local IndexedDB storage.
  - Optional cloud backend powered by Drizzle ORM and PostgreSQL.

---

## 🛠️ Technology Stack

| Layer | Technologies | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router, Turbopack) & React 19 | Responsive mobile-first UI with static generation (`output: export`) |
| **Mobile Runtime** | Capacitor 8 (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`) | Native hardware acceleration, WKWebView & Android WebView bridges |
| **Interactive Maps** | Leaflet 1.9 + OpenStreetMap | 100% free raster tiles; zero API keys, paid tiers, or credit cards required |
| **Icon System** | Custom SVG Design System (`src/components/icons/AppIcons.tsx`) | 60+ unified SVGs (24×24, stroke 2.0, `currentColor` theme inheritance) |
| **Styling System** | TailwindCSS v4 + Glassmorphism Theme | Frosted glass cards, Plus Jakarta Sans, paper/ink palette |
| **Language** | TypeScript 5.9 | Strict typechecking enabled |
| **Testing** | Node.js Test Runner + `tsx` | Unit and integration test suites for math, geo, vision, storage |
| **Local Storage** | IndexedDB (`animafind_db`) + LocalStorage Fallback | On-device persistent database with storage quota safeguards |
| **Cloud Database (Optional)**| PostgreSQL + Drizzle ORM | Optional relational cloud sync and community leaderboard backend |
| **Android Build** | Gradle 8.13, Android SDK 36, Java JDK 21 | R8 / ProGuard obfuscation rules & release signing support |
| **iOS Build** | Xcode 15+, iOS 15+ target, Swift 5.9 | Swift Package Manager plugin integration |

---

## ⚡ Prerequisites

Before running or building AnimaFind, ensure your development machine has:
- **Node.js**: `>= 20.0.0` (LTS v22 or v24 recommended)
- **npm**: `>= 10.0.0`
- **Java JDK**: `21 LTS` (Required for Android builds)
- **Android Studio**: Ladybug / Otter or newer with Android SDK API 36 (for Android)
- **Xcode**: `15.0+` on macOS (for iOS builds)

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/your-username/AnimaFind.git
cd AnimaFind
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to test the application in your browser.

---

## 🧪 Running Automated Tests

AnimaFind includes a test suite covering game mathematics, vision heuristics, geospatial distance calculation, and offline persistence:

```bash
# Run all unit and integration tests
npm test

# Run TypeScript type validation
npm run typecheck

# Run ESLint code style analysis
npm run lint
```

---

## 🗺️ Interactive Map Service (OpenStreetMap & Leaflet)

AnimaFind features a 100% free, production-grade interactive map powered by **Leaflet 1.9** and **OpenStreetMap (OSM)** raster tiles.

### Why OpenStreetMap + Leaflet?
1. **Zero Billing & Zero API Keys**: Requires no Google Maps, Mapbox, or MapTiler accounts, subscriptions, or credit cards. Works out of the box for any developer or user.
2. **Capacitor Mobile Reliability**: Leaflet uses HTML5 canvas and DOM elements without requiring WebGL context. On iOS WKWebView and Android WebView, heavy WebGL map engines frequently experience context loss on tab switches; Leaflet remains robust and stable.
3. **Lightweight Footprint**: At ~140 KB, Leaflet is a fraction of the bundle size of heavyweight vector-tile engines, ensuring fast cold starts on cellular networks in nature reserves.

### Architecture & Implementation Details
- **Tile Endpoint**: Standard OSM tile server:
  ```
  https://tile.openstreetmap.org/{z}/{x}/{y}.png
  ```
  with mandatory attribution: `&copy; OpenStreetMap contributors`.
- **Next.js SSR Boundary (`ssr: false`)**:
  Leaflet requires browser APIs (`window`, `navigator`, `document`) immediately upon instantiation. To avoid server-side rendering crashes during Next.js builds, the map is loaded dynamically:
  ```tsx
  // src/app/map/page.tsx
  const InteractiveMap = dynamic(
    () => import("@/components/map/InteractiveMap"),
    { ssr: false, loading: () => <MapSkeleton /> }
  );
  ```
- **Explicit Height Requirement**:
  Leaflet computes internal canvas coordinate projections from container dimensions. If the parent container does not declare an explicit CSS height (e.g. `style={{ height: "440px" }}` or `h-[440px]`), the container height defaults to 0px and tiles fail to render. AnimaFind guarantees explicit height across responsive breakpoints.
- **Proximity Radar & Claim Zone**:
  - Renders the naturalist's live location with an animated pulse marker (`user-pulse-marker`).
  - Projects a 250 m circular interaction radius using `L.circle` with custom styling.
  - Sighting pins within 250 m are flagged as `claimable`, activating a bouncing CSS animation and letting naturalists link cards directly to their Field Journal.
- **Error Handling & Resilience**:
  - Listens to `tileerror` events on the tile layer; if offline or blocked by a captive portal, an inline warning banner is displayed while keeping the interactive canvas alive.
  - Wraps initialization in a try/catch boundary with a user-facing retry button and fallback state.
- **Unmount Cleanup**:
  The `useEffect` lifecycle hook strictly executes `mapRef.current.remove()` on component unmount, preventing detached DOM node memory leaks across tab switches.

---

## 🎨 Custom Icon Design System & Guide

Every emoji in the application has been replaced with a unified set of 60+ custom SVG icons located in [`src/components/icons/AppIcons.tsx`](./src/components/icons/AppIcons.tsx).

### Design Tokens & Standards
- **Viewport**: Uniform `viewBox="0 0 24 24"`.
- **Stroke Width**: Consistent `strokeWidth="2"` (or `2.5` for checks/active states).
- **Line Endings**: `strokeLinecap="round"` and `strokeLinejoin="round"`.
- **Theme Color Inheritance**: All icons use `stroke="currentColor"` and `fill="none"` (except for solid accent badges). This allows icons to automatically inherit Tailwind CSS text colors (e.g. `text-brand-moss`, `text-amber-500`, `text-white`).
- **Standard Sizing**: Standard sizes use Tailwind dimension classes: `w-4 h-4`, `w-5 h-5`, `w-6 h-6`, or `w-8 h-8`.

### Dynamic Resolvers
- **`<TaxonIcon taxon={taxon} />`**: Intelligently renders the correct taxonomic icon for `"Mammal"`, `"Bird"`, `"Insect"`, `"Reptile"`, `"Amphibian"`, or `"Other"`.
- **`<AvatarIcon seed={seed} />`**: Safely renders naturalist avatars for both modern avatar keys (`"fox"`, `"owl"`, `"badger"`, `"frog"`, `"beetle"`, etc.) and legacy emoji strings.

### How to Add a New Custom Icon
Follow these 4 steps to add a new icon to the system:

1. **Open** `src/components/icons/AppIcons.tsx`.
2. **Define the new component** adhering to the standard `IconProps` interface:
   ```tsx
   export const IconBinoculars: FC<IconProps> = ({ className = "w-5 h-5", strokeWidth = 2 }) => (
     <svg
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth={strokeWidth}
       strokeLinecap="round"
       strokeLinejoin="round"
       className={className}
     >
       <circle cx="6" cy="14" r="4" />
       <circle cx="18" cy="14" r="4" />
       <path d="M10 14h4" />
       <path d="M8 10l1-5h6l1 5" />
       <path d="M10 5V3h4v2" />
     </svg>
   );
   ```
3. **Export** the icon from `src/components/icons/AppIcons.tsx`.
4. **Import & Use** in any page or component with your desired Tailwind color:
   ```tsx
   import { IconBinoculars } from "@/components/icons/AppIcons";

   <IconBinoculars className="w-5 h-5 text-brand-moss" />
   ```

---

## 📱 Mobile Builds (Android & iOS)

### Building the Static Web Assets for Mobile
```bash
npm run build:mobile
```
This compiles the Next.js static bundle into `./out` and synchronizes native assets into `./android` and `./ios`.

### Android Build Commands
```bash
# Build Debug APK (Local Testing)
npm run android:debug

# Build Release APK (Production)
npm run android:release

# Open project in Android Studio
npm run cap:android
```
Built APK files are located at:
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-unsigned.apk` (or signed `app-release.apk`)

### iOS Build Commands (macOS)
```bash
# Open project in Xcode
npm run cap:ios
```
From Xcode, select your simulator or physical device and press `Cmd + R` to run.

---

## 🏛️ Architecture

For complete system design diagrams, dual-engine data flow, and anti-cheat algorithms, read our [Architecture Guide](./docs/ARCHITECTURE.md).

---

## 📚 Documentation Links

- 📑 **[Master Documentation PDF (`docs/AnimaFind_Full_Documentation.pdf`)](./docs/AnimaFind_Full_Documentation.pdf)** — Comprehensive 14-page publication-grade manual covering complete architecture, computer vision & anti-cheat heuristics, 35-species European codex catalog, procedural card engine, mobile compilation pipelines, and operations runbook.
  - *Regenerate anytime via:* `npm run docs:pdf`
- 🚀 [Installation Tutorial (`docs/INSTALLATION.md`)](./docs/INSTALLATION.md) — Step-by-step setup, verification commands, and native build tutorial.
- 📖 [Feature & Usage Guide (`docs/USAGE.md`)](./docs/USAGE.md) — Complete user guide for the viewfinder, toss minigame, album, codex, and map.
- 🔧 [Troubleshooting Guide (`docs/TROUBLESHOOTING.md`)](./docs/TROUBLESHOOTING.md) — Solutions for camera permissions, Gradle JVM, and build errors.
- 🛠️ [Environment Setup Guide (`docs/SETUP.md`)](./docs/SETUP.md) — Tooling specifications for Android Studio, JDK 21, and Xcode.
- 🏛️ [System Architecture (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md) — Deep dive into the dual-engine architecture, vision pipeline, and security model.
- 📦 [Build & Release Guide (`docs/BUILD_AND_RELEASE.md`)](./docs/BUILD_AND_RELEASE.md) — Android keystore setup, iOS signing, and CI/CD operations.
- 🤝 [Contributing Guidelines (`CONTRIBUTING.md`)](./CONTRIBUTING.md) — Coding conventions, branching strategy, and pull request checklist.
- 📜 [Code of Conduct (`CODE_OF_CONDUCT.md`)](./CODE_OF_CONDUCT.md) — Community standards and harassment policy.
- 📋 [Changelog (`CHANGELOG.md`)](./CHANGELOG.md) — Chronological record of defects fixed, features added, and security enhancements.

---

## 📄 License

This project is licensed under the terms of the [MIT License](./LICENSE).
