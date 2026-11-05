# 📖 AnimaFind Feature & Usage Guide

This guide documents the primary gameplay features, user flows, and technical entry points in **AnimaFind (Critter Codex)**.

---

## 🗺️ Application Map & Navigation

AnimaFind features a mobile-first bottom tab bar and contextual header navigation:

| Screen / Route | Icon Symbol | Description |
| :--- | :---: | :--- |
| **Field Scan (`/`)** | `IconCamera` | Main viewfinder, on-device AI lock-on, tin-can toss, and card reveal |
| **Field Journal Album (`/album`)** | `IconAlbum` | Collected cards deck with real-time text search and multi-class filters |
| **Community Map (`/map`)** | `IconMap` | Real-world OpenStreetMap interactive map with 250m proximity claiming |
| **Field Crew (`/friends`)** | `IconFriends` | Naturalist social comparison, friend requests, and activity feed |
| **Naturalist Profile (`/profile`)** | `IconUser` | Level, XP bar, streaks, rarest finds, avatars, and cosmetic badges |
| **Wildlife Codex (`/codex`)** | `IconBook` | 35-species European wildlife biodiversity encyclopedia |
| **Critter Duels PvP (`/pvp`)** | `IconSword` | Class advantage matrix (Mammal → Insect → Amphibian → Bird → Reptile) and roadmap voting |
| **Supply Shop (`/shop`)** | `IconCan` | Energy refill packs, rewarded ads for cans, cosmetics, and Field Club Premium |
| **Settings (`/settings`)** | `IconGear` | GDPR consents, location toggles, JSON data export, and account deletion |
| **SaaS Showcase (`/landing`)** | `IconSparkles` | Public marketing tour, interactive 3D card studio simulator, and FAQ |

---

## 🐾 1. Field Scan & Computer Vision Pipeline (`/`)

The primary encounter loop lets naturalists safely discover and log animals in their local environment:

### Viewfinder Controls
- **Camera Viewfinder:** Streams live video via WebRTC `navigator.mediaDevices.getUserMedia`.
- **Torch Button:** Toggles the device flashlight on supported mobile hardware.
- **Specimen Simulator (`IconDice`):** Generates synthetic specimens for testing without needing a physical animal.
- **Lock-On Meter:** Analyzes center frames at 160 ms intervals. When biological feature confidence exceeds 50% across 3 consecutive sample frames, the HUD displays "TARGET LOCKED".

### Anti-Cheat Protections
1. **Parallax Motion Scoring:** Compares consecutive frame luminance deltas against previous frame buffers. Stationary 2D paper printouts fail the minimum parallax motion threshold.
2. **Moiré Pattern Detection:** Detects high-frequency pixel interference grids typical of digital monitors and smartphone displays.
3. **64-bit Perceptual Hash (pHash):** Computes a 16-hex character perceptual hash of the frame to reject duplicate submissions.

---

## 🥫 2. Physics-Based Tin-Can Toss Minigame

Once a creature is locked and confirmed:
1. Tap **Spend 1 can → toss**.
2. A drifting cardboard target box moves smoothly across the screen.
3. **Flick the Can:** Drag the tin can upward with a quick swipe. The physics engine applies parabolic trajectory, gravity ($0.0016$), and air resistance ($0.995^{dt}$).
4. **Landing:** Landing in the green zone verifies the sighting and triggers the procedural card minting sequence.
5. Players have **3 attempts per can** before the can is exhausted.

---

## 🃏 3. Procedural Card Minting & 3D Interactive Cards

Every successful capture mints a unique collectible trading card:
- **5 Rarity Tiers:**
  - `tier1`: **Hedgerow** (Common, green glow, rank 1)
  - `tier2`: **Meadow** (Uncommon, blue glow, rank 2)
  - `tier3`: **Twilight** (Rare, purple glow, rank 3)
  - `tier4`: **Emberwood** (Epic, orange glow, rank 4)
  - `tier5`: **Aurora** (Legendary, golden animated glow, rank 5)
- **Procedural Names:** Generated using combinatorial titles, adjectives, and nouns (e.g. *Baron Grumpy Donut*, *Captain Dawnlit Crumb*).
- **Combat Stats:** Generates `Snack` (1–99), `Charm` (1–99), and a taxonomic class stat (`Grit` for Mammals, `Speed` for Birds, `Swarm` for Insects, `Camouflage` for Reptiles, `Moisture` for Amphibians).
- **3D Card Flip:** Tap any card to flip between front art/stats and back collector details/abilities.

---

## 📔 4. Field Journal Album (`/album`)

- **Live Keyword Search:** Type in the search bar to instantly find cards by name, species label, or class.
- **Taxonomic & Series Filter Chips:** Filter cards by class (`Mammal`, `Bird`, `Insect`, `Reptile`, `Amphibian`, `Other`) and rarity series (`Hedgerow` to `Aurora`).
- **One-Click Reset:** If no cards match the selected combination, tap **Reset all filters**.
- **Card Inspector (`/card?id=...`):** View full details, export, share deep links, or safely release cards back to the wild with confirmation.

---

## 🗺️ 5. Fuzzed Community Map (`/map`)

- **Interactive OpenStreetMap Canvas:** Powered by Leaflet with fluid pan, pinch-to-zoom, and custom zoom buttons.
- **Proximity Ring:** Displays a 250 m interaction radius around the naturalist's approximate position using an animated pulse marker.
- **Community Sighting Pins:** View past community sightings represented by custom taxonomic SVG icons (`<TaxonIcon />`).
- **Anti-Poaching Privacy Fuzzing:** Coordinates for everyday species are fuzzed by ~150 m. Coordinates for sensitive, rare, or protected species are fuzzed by ~5 km or kept hidden.
- **Recenter Control:** Tap the **Recenter** button in the header to re-acquire GPS coordinates.
- **Category Filter Bar:** Filter visible sightings by taxonomic class (All, Mammal, Bird, Insect, Reptile, Amphibian).
- **Proximity Claiming Modal:** Tap any pin within the 250 m circle to inspect details and link the sighting into your Field Journal.

---

## 👥 6. Field Crew & Comparisons (`/friends`)

- **Compare Albums:** Tap **Compare** on any friend to inspect head-to-head level, card count, species diversity, total sightings, and rarity breakdowns.
- **Add Naturalists:** Enter a field username to send friend requests, or tap quick suggestions.
- **Activity Feed:** Track rare finds and community notifications.

---

## 🥫 7. Economy & Supply Shop (`/shop`)

- **Tin Cans (Energy):**
  - Free tier: Maximum 5 cans, recharges 1 can every 25 minutes.
  - Field Club Premium: Maximum 8 cans, recharges 1 can every 10 minutes, banner ads disabled.
- **Rewarded Ads:** Watch a simulated clip to earn +1 instant can.
- **In-App Purchases:** Supported via RevenueCat mock interfaces for seamless production integration.

---

## 🧭 8. Naturalist Profile & Cosmetics (`/profile`)

- **Stats & Streaks:** Track level progression, daily scanning streaks, and total species diversity.
- **Rarest Find Badge:** Highlights your rarest discovered critter with tier border coloring.
- **Avatar Selector:** Choose from animal icons (Fox, Squirrel, Bird, Frog, Bee, Lizard, Snail, Owl).

---

## ⚔️ 9. Critter Duels & PvP Roadmap (`/pvp`)

- **Matchup Advantages:**
  - Mammal beats Insect
  - Insect beats Amphibian
  - Amphibian beats Bird
  - Bird beats Reptile
  - Reptile beats Mammal
- **Community Feature Voting:** Cast votes on future mechanics (1v1 duels, co-op raids, weekly neighbourhood leagues, draft mode).
- **Cosmetics:** Unlock and equip avatar items (Explorer Hat, Leaf Crown, Round Specs, Gold Monocle) in your Profile.
