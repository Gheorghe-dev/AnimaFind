import {
  COSMETICS,
  levelForXp,
  RARITY_META,
  SPECIES,
  TAXA,
  TAXON_META,
  TIER_ORDER,
  type RarityTier,
  type TaxonCategory,
} from "./game-data";
import { generateCard, speciesInfo } from "./card-gen";
import { fuzzCoords, haversineMeters, PROXIMITY_METERS } from "./geo";
import { STORE_CATALOG } from "./store-catalog";
import type { CanState, CardRow, MapPin, Me } from "./types";
import { getSpecimenDataUri } from "./specimen-art";

const SAVE_KEY = "animafind_local_save_v1";

/** Suggested naturalists offered in the friends tab. Shared by the list and the add action. */
const SUGGESTED_NATURALISTS = [
  { id: "sug-1", username: "BrambleFox", avatarSeed: "fox", level: 3 },
  { id: "sug-2", username: "CopperLichen", avatarSeed: "lizard", level: 5 },
  { id: "sug-3", username: "QuietSketchbook", avatarSeed: "owl", level: 2 },
];

export type StoredSighting = {
  id: string;
  userId: string;
  timestamp: string;
  photoUrl: string;
  thumbnailUrl: string;
  phash: string | null;
  detectedTaxonCategory: TaxonCategory;
  detectedSpeciesLabel: string | null;
  geoLat: number | null;
  geoLng: number | null;
  isSensitiveSpecies: boolean;
  verificationStatus: "verified" | "pending";
  linkedFromSightingId: string | null;
  isPublic: boolean;
};

export type StoredFriend = {
  id: string;
  username: string;
  avatarSeed: string;
  level: number;
  totalCards: number;
  speciesDiversity: number;
  totalSightings: number;
  byTier: Record<string, number>;
  rarest: { id: string; name: string; tier: RarityTier } | null;
  linkId: string;
  status: "accepted" | "incoming" | "outgoing";
};

export type StoredNotification = {
  id: number;
  title: string;
  body: string;
  kind: "info" | "rare" | "friend";
  createdAt: string;
  readAt: string | null;
};

export type LocalSaveData = {
  user: {
    id: string;
    username: string;
    email: string | null;
    avatarSeed: string;
    level: number;
    xp: number;
    coins: number;
    streakCount: number;
    lastActiveDate: string | null;
    cosmetics: { hat?: string; glasses?: string; frame?: string };
    ownedCosmetics: string[];
    isPremiumActive: boolean;
    gdprConsentAt: string | null;
    locationConsent: boolean;
    ageConfirmed: boolean;
    createdAt: string;
  };
  cans: {
    current: number;
    max: number;
    lastRechargeAt: string;
    rechargeRateMinutes: number;
  };
  cards: CardRow[];
  sightings: StoredSighting[];
  friends: StoredFriend[];
  notifications: StoredNotification[];
  pvpVotes: Record<string, boolean>;
  serialCounters: Record<string, number>;
  activeRound: {
    id: string;
    attemptsLeft: number;
    status: "active" | "spent" | "completed";
    createdAt: string;
  } | null;
  scanTimestamps: number[];
};

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getInitialData(): LocalSaveData {
  const userId = generateId();
  const now = new Date().toISOString();

  // Initial starter community sightings (so the local map is instantly alive)
  const starterSightings: StoredSighting[] = [
    {
      id: "sight-demo-1",
      userId: "demo-mossy",
      timestamp: new Date(Date.now() - 3600_000 * 4).toISOString(),
      photoUrl: getSpecimenDataUri("Mammal", "Red Fox", "tier3"),
      thumbnailUrl: getSpecimenDataUri("Mammal", "Red Fox", "tier3"),
      phash: "demo-fox-001",
      detectedTaxonCategory: "Mammal",
      detectedSpeciesLabel: "Red Fox",
      geoLat: 44.4278,
      geoLng: 26.1035,
      isSensitiveSpecies: false,
      verificationStatus: "verified",
      linkedFromSightingId: null,
      isPublic: true,
    },
    {
      id: "sight-demo-2",
      userId: "demo-pigeon",
      timestamp: new Date(Date.now() - 3600_000 * 2).toISOString(),
      photoUrl: getSpecimenDataUri("Bird", "House Sparrow", "tier1"),
      thumbnailUrl: getSpecimenDataUri("Bird", "House Sparrow", "tier1"),
      phash: "demo-pigeon-002",
      detectedTaxonCategory: "Bird",
      detectedSpeciesLabel: "House Sparrow",
      geoLat: 44.4255,
      geoLng: 26.1012,
      isSensitiveSpecies: false,
      verificationStatus: "verified",
      linkedFromSightingId: null,
      isPublic: true,
    },
    {
      id: "sight-demo-3",
      userId: "demo-fern",
      timestamp: new Date(Date.now() - 3600_000 * 7).toISOString(),
      photoUrl: getSpecimenDataUri("Insect", "Garden Bumblebee", "tier2"),
      thumbnailUrl: getSpecimenDataUri("Insect", "Garden Bumblebee", "tier2"),
      phash: "demo-bee-003",
      detectedTaxonCategory: "Insect",
      detectedSpeciesLabel: "Garden Bumblebee",
      geoLat: 44.4290,
      geoLng: 26.1040,
      isSensitiveSpecies: false,
      verificationStatus: "verified",
      linkedFromSightingId: null,
      isPublic: true,
    },
  ];

  return {
    user: {
      id: userId,
      username: "FieldScout" + Math.floor(Math.random() * 900 + 100),
      email: null,
      avatarSeed: "fox",
      level: 1,
      xp: 0,
      coins: 60,
      streakCount: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      cosmetics: {},
      ownedCosmetics: [],
      isPremiumActive: false,
      gdprConsentAt: null,
      locationConsent: false,
      ageConfirmed: false,
      createdAt: now,
    },
    cans: {
      current: 4,
      max: 5,
      lastRechargeAt: now,
      rechargeRateMinutes: 25,
    },
    cards: [],
    sightings: starterSightings,
    friends: [
      {
        id: "demo-mossy",
        username: "MossyRambler",
        avatarSeed: "hedgehog",
        level: 4,
        totalCards: 18,
        speciesDiversity: 12,
        totalSightings: 24,
        byTier: { tier1: 10, tier2: 5, tier3: 2, tier4: 1, tier5: 0 },
        rarest: { id: "demo-c1", name: "Baron Grumpy Donut", tier: "tier4" },
        linkId: "link-1",
        status: "accepted",
      },
      {
        id: "demo-pigeon",
        username: "PigeonPost",
        avatarSeed: "bird",
        level: 3,
        totalCards: 9,
        speciesDiversity: 7,
        totalSightings: 14,
        byTier: { tier1: 6, tier2: 2, tier3: 1, tier4: 0, tier5: 0 },
        rarest: { id: "demo-c2", name: "Captain Dawnlit Crumb", tier: "tier3" },
        linkId: "link-2",
        status: "accepted",
      },
      {
        id: "demo-fern",
        username: "FernAndFlask",
        avatarSeed: "frog",
        level: 6,
        totalCards: 32,
        speciesDiversity: 21,
        totalSightings: 45,
        byTier: { tier1: 15, tier2: 9, tier3: 5, tier4: 2, tier5: 1 },
        rarest: { id: "demo-c3", name: "Oracle Obsidian Whisper", tier: "tier5" },
        linkId: "link-3",
        status: "incoming",
      },
    ],
    notifications: [
      {
        id: 1,
        title: "Welcome Naturalist!",
        body: "Your local field journal is ready. Find critters, land tosses and build your deck.",
        kind: "info",
        createdAt: now,
        readAt: null,
      },
      {
        id: 2,
        title: "MossyRambler found something rare!",
        body: "Baron Grumpy Donut — Emberwood Mammal.",
        kind: "rare",
        createdAt: new Date(Date.now() - 3600_000 * 3).toISOString(),
        readAt: null,
      },
    ],
    pvpVotes: {},
    serialCounters: { tier1: 14, tier2: 7, tier3: 3, tier4: 1, tier5: 1 },
    activeRound: null,
    scanTimestamps: [],
  };
}

const IDB_NAME = "animafind_db";
const IDB_STORE = "saves";

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class LocalStoreEngine {
  private memoryData: LocalSaveData | null = null;
  private idbInitDone = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAsyncRestore();
    }
  }

  private async initAsyncRestore() {
    if (this.idbInitDone || typeof window === "undefined" || !window.indexedDB) return;
    this.idbInitDone = true;
    try {
      const db = await openIdb();
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(SAVE_KEY);
      req.onsuccess = () => {
        if (req.result && (!this.memoryData || (this.memoryData.cards.length < req.result.cards?.length))) {
          this.memoryData = req.result as LocalSaveData;
          try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.memoryData));
          } catch {
            // keep in memory
          }
        }
      };
    } catch {
      // ignore
    }
  }

  private load(): LocalSaveData {
    if (this.memoryData) return this.memoryData;
    if (typeof window === "undefined" || !window.localStorage) {
      this.memoryData = getInitialData();
      return this.memoryData;
    }
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        const init = getInitialData();
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(init));
        } catch {
          // ignore
        }
        this.memoryData = init;
        return init;
      }
      this.memoryData = JSON.parse(raw) as LocalSaveData;
      return this.memoryData;
    } catch {
      this.memoryData = getInitialData();
      return this.memoryData;
    }
  }

  private async saveToIndexedDB(data: LocalSaveData) {
    if (typeof window === "undefined" || !window.indexedDB) return;
    try {
      const db = await openIdb();
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(data, SAVE_KEY);
    } catch (err) {
      console.warn("[LocalStoreEngine] IndexedDB backup write failed", err);
    }
  }

  private save(data: LocalSaveData) {
    this.memoryData = data;
    if (typeof window !== "undefined") {
      // Asynchronous limitless backing storage for mobile WebViews
      void this.saveToIndexedDB(data);

      if (window.localStorage) {
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        } catch (err) {
          console.warn("[LocalStoreEngine] localStorage write failed (quota exceeded?), attempting pruned backup", err);
          try {
            // Prune duplicate heavy base64 strings in older sightings (keep thumbnail & card data intact)
            const pruned = { ...data };
            pruned.sightings = pruned.sightings.map((s, idx) => {
              if (idx > 4 && s.photoUrl && s.photoUrl.startsWith("data:image/jpeg")) {
                return { ...s, photoUrl: s.thumbnailUrl };
              }
              return s;
            });
            localStorage.setItem(SAVE_KEY, JSON.stringify(pruned));
          } catch (retryErr) {
            console.warn("[LocalStoreEngine] Pruned localStorage write failed; data safely held in IndexedDB & memory", retryErr);
          }
        }
      }
    }
  }

  public getCansState(data: LocalSaveData): CanState {
    const isPremium = data.user.isPremiumActive;
    const rate = isPremium ? 10 : 25;
    const max = isPremium ? 8 : 5;
    const now = Date.now();
    const last = new Date(data.cans.lastRechargeAt).getTime();
    const elapsedMs = Math.max(0, now - last);
    const rateMs = rate * 60_000;

    let current = data.cans.current;
    let lastRechargeAt = new Date(last);

    if (current < max) {
      const gained = Math.floor(elapsedMs / rateMs);
      if (gained > 0) {
        current = Math.min(max, current + gained);
        lastRechargeAt = new Date(last + gained * rateMs);
      }
    } else {
      lastRechargeAt = new Date(now);
    }

    // The cap and the recharge rate follow the entitlement, so persist them even
    // when no can was gained — otherwise shop maths (max + bonus) uses a stale cap.
    const capChanged = data.cans.max !== max || data.cans.rechargeRateMinutes !== rate;
    if (current !== data.cans.current || capChanged) {
      data.cans.current = current;
      data.cans.max = max;
      data.cans.rechargeRateMinutes = rate;
      data.cans.lastRechargeAt = lastRechargeAt.toISOString();
      this.save(data);
    }

    const secondsUntilNext =
      current >= max ? null : Math.max(1, Math.ceil((rateMs - (now - lastRechargeAt.getTime())) / 1000));

    return {
      current,
      max,
      rechargeRateMinutes: rate,
      secondsUntilNext,
      lastRechargeAt: lastRechargeAt.toISOString(),
    };
  }

  public getMe(): Me {
    const data = this.load();
    const cans = this.getCansState(data);
    const lvl = levelForXp(data.user.xp);
    data.user.level = lvl.level;

    const byTier: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0 };
    let rarest: { id: string; name: string; tier: RarityTier } | null = null;
    const uniqueSpecies = new Set<string>();

    for (const c of data.cards) {
      byTier[c.rarityTier] = (byTier[c.rarityTier] ?? 0) + 1;
      if (c.speciesLabel) uniqueSpecies.add(c.speciesLabel);
      if (!rarest || RARITY_META[c.rarityTier].rank > RARITY_META[rarest.tier].rank) {
        rarest = { id: c.id, name: c.generatedName, tier: c.rarityTier };
      }
    }

    return {
      user: {
        ...data.user,
        ...lvl,
      },
      cans,
      stats: {
        totalCards: data.cards.length,
        speciesDiversity: uniqueSpecies.size,
        totalSightings: data.sightings.filter((s) => s.userId === data.user.id).length,
        byTier,
        rarest,
      },
    };
  }

  public saveConsent(payload: {
    gdprConsent?: boolean;
    ageConfirmed?: boolean;
    locationConsent?: boolean;
    username?: string;
  }): Me {
    const data = this.load();
    if (!payload.gdprConsent || !payload.ageConfirmed) {
      throw new Error("Consent and age confirmation are required.");
    }
    data.user.gdprConsentAt = new Date().toISOString();
    data.user.ageConfirmed = true;
    data.user.locationConsent = Boolean(payload.locationConsent);
    if (payload.username?.trim()) {
      data.user.username = payload.username.trim().slice(0, 24);
    }
    this.save(data);
    return this.getMe();
  }

  public updateProfile(body: {
    username?: string;
    avatarSeed?: string;
    equip?: string | null;
    locationConsent?: boolean;
  }): Me {
    const data = this.load();
    if (body.username?.trim()) {
      data.user.username = body.username.trim().slice(0, 24);
    }
    if (body.avatarSeed) {
      data.user.avatarSeed = body.avatarSeed;
    }
    if (body.locationConsent !== undefined) {
      data.user.locationConsent = Boolean(body.locationConsent);
    }
    if (body.equip !== undefined && body.equip !== null) {
      const cosmetic = COSMETICS[body.equip];
      if (cosmetic && data.user.ownedCosmetics.includes(body.equip)) {
        const slot = cosmetic.slot;
        data.user.cosmetics[slot] = data.user.cosmetics[slot] === body.equip ? undefined : body.equip;
      }
    }
    this.save(data);
    return this.getMe();
  }

  public startRound(): { roundId: string; attemptsLeft: number; cans: CanState } {
    const data = this.load();
    if (!data.user.gdprConsentAt) throw new Error("Consent required.");

    const cans = this.getCansState(data);
    if (cans.current <= 0) {
      throw new Error("No cans left.");
    }

    // spend can
    data.cans.current -= 1;
    if (cans.current === cans.max) {
      data.cans.lastRechargeAt = new Date().toISOString();
    }
    const roundId = generateId();
    data.activeRound = {
      id: roundId,
      attemptsLeft: 3,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    this.save(data);

    return {
      roundId,
      attemptsLeft: 3,
      cans: this.getCansState(data),
    };
  }

  public attemptRound(roundId: string): { attemptsLeft: number; status: string } {
    const data = this.load();
    if (!data.activeRound || data.activeRound.id !== roundId) {
      return { attemptsLeft: 0, status: "spent" };
    }
    data.activeRound.attemptsLeft = Math.max(0, data.activeRound.attemptsLeft - 1);
    data.activeRound.status = data.activeRound.attemptsLeft === 0 ? "spent" : "active";
    this.save(data);
    return {
      attemptsLeft: data.activeRound.attemptsLeft,
      status: data.activeRound.status,
    };
  }

  public submitSighting(payload: {
    roundId: string;
    photo: string;
    phash?: string;
    taxon: TaxonCategory;
    species?: string | null;
    lat?: number | null;
    lng?: number | null;
    motionScore?: number;
    screenScore?: number;
    linkedFromSightingId?: string | null;
  }): { card: CardRow; sighting: { id: string; verificationStatus: string; isSensitiveSpecies: boolean }; me: Me } {
    const data = this.load();
    if (!data.activeRound || data.activeRound.id !== payload.roundId) {
      throw new Error("Invalid or expired round.");
    }
    if (data.activeRound.status === "spent") {
      throw new Error("No tosses left for this can.");
    }

    // A linked community card requires physical proximity to the original pin.
    if (payload.linkedFromSightingId) {
      const source = data.sightings.find((s) => s.id === payload.linkedFromSightingId);
      if (!source) throw new Error("Unknown pin.");
      if (payload.lat == null || payload.lng == null || source.geoLat == null || source.geoLng == null) {
        throw new Error("Location needed to claim a pin.");
      }
      const distance = haversineMeters(payload.lat, payload.lng, source.geoLat, source.geoLng);
      if (distance > PROXIMITY_METERS) {
        throw new Error(
          `You are ${Math.round(distance)} m away — get within ${PROXIMITY_METERS} m of the pin.`,
        );
      }
    }

    const info = speciesInfo(payload.species);
    const sensitive = Boolean(info?.sensitive);
    const sightingId = generateId();

    const newSighting: StoredSighting = {
      id: sightingId,
      userId: data.user.id,
      timestamp: new Date().toISOString(),
      photoUrl: payload.photo,
      thumbnailUrl: payload.photo,
      phash: payload.phash ?? null,
      detectedTaxonCategory: payload.taxon,
      detectedSpeciesLabel: payload.species ?? null,
      geoLat: data.user.locationConsent ? (payload.lat ?? null) : null,
      geoLng: data.user.locationConsent ? (payload.lng ?? null) : null,
      isSensitiveSpecies: sensitive,
      verificationStatus: sensitive ? "pending" : "verified",
      linkedFromSightingId: payload.linkedFromSightingId ?? null,
      isPublic: true,
    };
    data.sightings.unshift(newSighting);

    const generated = generateCard(payload.taxon, payload.species);
    const tier = generated.rarityTier;
    data.serialCounters[tier] = (data.serialCounters[tier] ?? 0) + 1;
    const serial = data.serialCounters[tier];

    const cardId = generateId();
    const newCard: CardRow = {
      id: cardId,
      sightingId,
      ownerUserId: data.user.id,
      generatedName: generated.generatedName,
      serialNumber: serial,
      taxonCategory: generated.taxonCategory,
      speciesLabel: payload.species ?? null,
      rarityTier: tier,
      statA: generated.statA,
      statB: generated.statB,
      statC: generated.statC,
      statCLabel: generated.statCLabel,
      typeLabel: generated.typeLabel,
      abilities: generated.abilities,
      photoUrl: payload.photo,
      xpAwarded: generated.xpAwarded,
      coinsAwarded: generated.coinsAwarded,
      createdAt: new Date().toISOString(),
    };
    data.cards.unshift(newCard);

    // Award XP, coins, streak
    const today = new Date().toISOString().slice(0, 10);
    if (data.user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      data.user.streakCount = data.user.lastActiveDate === yesterday ? data.user.streakCount + 1 : 1;
      data.user.lastActiveDate = today;
    }
    data.user.xp += generated.xpAwarded;
    data.user.coins += generated.coinsAwarded;
    data.activeRound = null;

    // Rare catch broadcast
    if (RARITY_META[tier].rank >= 4) {
      data.notifications.unshift({
        id: Date.now(),
        title: "Rare Find Minted!",
        body: `You logged ${generated.generatedName} (${RARITY_META[tier].name} ${generated.taxonCategory})!`,
        kind: "rare",
        createdAt: new Date().toISOString(),
        readAt: null,
      });
    }

    this.save(data);
    return {
      card: newCard,
      sighting: { id: sightingId, verificationStatus: newSighting.verificationStatus, isSensitiveSpecies: sensitive },
      me: this.getMe(),
    };
  }

  public getCards(): CardRow[] {
    const data = this.load();
    return data.cards;
  }

  public getCard(id: string): { card: CardRow; ownerName: string; sighting: any } | null {
    const data = this.load();
    const card = data.cards.find((c) => c.id === id);
    if (!card) return null;
    const sighting = data.sightings.find((s) => s.id === card.sightingId) ?? {
      id: "unknown",
      timestamp: card.createdAt,
      detectedSpeciesLabel: card.speciesLabel,
      isSensitiveSpecies: false,
      verificationStatus: "verified",
      linkedFromSightingId: null,
      geoLat: null,
    };
    return {
      card,
      ownerName: data.user.username,
      sighting: {
        ...sighting,
        hasLocation: sighting.geoLat != null,
      },
    };
  }

  public deleteCard(id: string): boolean {
    const data = this.load();
    data.cards = data.cards.filter((c) => c.id !== id);
    this.save(data);
    return true;
  }

  public getEncyclopedia() {
    const data = this.load();
    const found = new Set(data.cards.map((c) => c.speciesLabel).filter(Boolean) as string[]);
    const categories = TAXA.map((taxon) => {
      const list = SPECIES.filter((s) => s.taxon === taxon);
      return {
        taxon,
        total: list.length,
        found: list.filter((s) => found.has(s.label)).length,
        species: list.map((s) => ({
          label: s.label,
          commonness: s.commonness,
          sensitive: Boolean(s.sensitive),
          found: found.has(s.label),
        })),
      };
    });
    return { categories };
  }

  public getMapPins(lat?: number | null, lng?: number | null): { pins: MapPin[]; proximityMeters: number } {
    const data = this.load();
    const hasViewer = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);
    const viewerLat = hasViewer ? (lat as number) : 44.4268;
    const viewerLng = hasViewer ? (lng as number) : 26.1025;

    // Seed procedural local sightings near viewer if fewer than 5 exist near coordinates.
    // Guard: only count sightings that are NOT already seeded demo entries so we never
    // accumulate duplicates across repeated calls to getMapPins().
    const nearbyDemoCount = data.sightings.filter(
      (s) =>
        s.id.startsWith("local-sighting-") &&
        s.geoLat != null &&
        s.geoLng != null &&
        Math.abs(s.geoLat - viewerLat) < 0.05 &&
        Math.abs(s.geoLng - viewerLng) < 0.05,
    ).length;

    if (nearbyDemoCount < 5) {
      const needed = 5 - nearbyDemoCount;
      const demoUsers = ["MossyRambler", "PigeonPost", "FernAndFlask"];
      for (let i = 0; i < needed; i++) {
        const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
        const photo = getSpecimenDataUri(species.taxon, species.label, "tier2");
        data.sightings.push({
          id: "local-sighting-" + Math.random().toString(36).slice(2, 9),
          userId: demoUsers[i % demoUsers.length],
          timestamp: new Date(Date.now() - Math.random() * 86400_000).toISOString(),
          photoUrl: photo,
          thumbnailUrl: photo,
          phash: "pdemo-" + Math.random().toString(36).slice(2, 8),
          detectedTaxonCategory: species.taxon,
          detectedSpeciesLabel: species.label,
          geoLat: viewerLat + (Math.random() - 0.5) * 0.02,
          geoLng: viewerLng + (Math.random() - 0.5) * 0.02,
          isSensitiveSpecies: Boolean(species.sensitive),
          verificationStatus: "verified",
          linkedFromSightingId: null,
          isPublic: true,
        });
      }
      this.save(data);
    }

    const claimed = new Set(
      data.sightings
        .filter((s) => s.userId === data.user.id && s.linkedFromSightingId)
        .map((s) => s.linkedFromSightingId as string),
    );

    const pins: MapPin[] = data.sightings
      .filter((s) => s.isPublic && s.geoLat != null && s.geoLng != null)
      .map((s) => {
        const fuzzed = fuzzCoords(s.geoLat!, s.geoLng!, s.isSensitiveSpecies, s.id);
        const dist = hasViewer ? haversineMeters(viewerLat, viewerLng, s.geoLat!, s.geoLng!) : null;
        const isOwn = s.userId === data.user.id;
        const claimable = dist != null && dist <= PROXIMITY_METERS && !isOwn && !claimed.has(s.id);

        return {
          sightingId: s.id,
          approxLat: fuzzed.lat,
          approxLng: fuzzed.lng,
          precision: s.isSensitiveSpecies ? "5 km area" : "150 m area",
          thumbnailUrl: s.thumbnailUrl,
          taxon: s.detectedTaxonCategory,
          species: s.isSensitiveSpecies ? "Protected species (hidden)" : s.detectedSpeciesLabel,
          isSensitiveSpecies: s.isSensitiveSpecies,
          byUsername: s.userId === data.user.id ? data.user.username : s.userId,
          cardName: s.detectedSpeciesLabel ? `${s.detectedSpeciesLabel} Discovery` : null,
          tier: null,
          timestamp: s.timestamp,
          distanceMeters: dist == null ? null : Math.round(dist),
          isClaimableByViewer: claimable,
          alreadyClaimed: claimed.has(s.id),
          isOwn,
        };
      });

    return { pins, proximityMeters: PROXIMITY_METERS };
  }

  public getFriends() {
    const data = this.load();
    const meStats = this.getMe();
    const friends = data.friends.filter((f) => f.status === "accepted");
    const incoming = data.friends.filter((f) => f.status === "incoming");
    const outgoing = data.friends.filter((f) => f.status === "outgoing");

    const suggestions = SUGGESTED_NATURALISTS.filter(
      (s) => !data.friends.some((f) => f.username.toLowerCase() === s.username.toLowerCase()),
    );

    return {
      me: {
        id: data.user.id,
        username: data.user.username,
        avatarSeed: data.user.avatarSeed,
        level: meStats.user.level,
        ...meStats.stats,
      },
      friends,
      incoming,
      outgoing,
      suggestions,
    };
  }

  public friendAction(body: { action: string; userId?: string; username?: string; linkId?: string }) {
    const data = this.load();
    if (body.action === "add") {
      // A suggestion is referenced by id, a typed name by username — resolve both.
      const suggestion = body.userId
        ? SUGGESTED_NATURALISTS.find((s) => s.id === body.userId)
        : undefined;
      const name = body.username?.trim() || suggestion?.username || "";
      if (!name) throw new Error("Enter a naturalist name first.");

      if (data.friends.some((f) => f.username.toLowerCase() === name.toLowerCase())) {
        throw new Error(`${name} is already in your crew.`);
      }

      data.friends.push({
        id: "friend-" + Math.random().toString(36).slice(2, 8),
        username: name,
        avatarSeed: suggestion?.avatarSeed ?? "user",
        level: suggestion?.level ?? Math.floor(Math.random() * 5 + 1),
        totalCards: Math.floor(Math.random() * 15 + 5),
        speciesDiversity: Math.floor(Math.random() * 10 + 3),
        totalSightings: Math.floor(Math.random() * 20 + 8),
        byTier: { tier1: 6, tier2: 3, tier3: 1, tier4: 0, tier5: 0 },
        rarest: { id: "fr-1", name: "Sir Velvet Biscuit", tier: "tier3" },
        linkId: generateId(),
        status: "accepted",
      });
      this.save(data);
      return { ok: true };
    }
    if (body.action === "accept" && body.linkId) {
      const fr = data.friends.find((f) => f.linkId === body.linkId);
      if (fr) fr.status = "accepted";
      this.save(data);
      return { ok: true };
    }
    if (body.action === "remove" && body.linkId) {
      data.friends = data.friends.filter((f) => f.linkId !== body.linkId);
      this.save(data);
      return { ok: true };
    }
    return { ok: true };
  }

  public getNotifications() {
    const data = this.load();
    return { notifications: data.notifications };
  }

  public markNotificationsRead() {
    const data = this.load();
    const now = new Date().toISOString();
    data.notifications.forEach((n) => (n.readAt = now));
    this.save(data);
    return { ok: true };
  }

  public getPvp() {
    const data = this.load();
    const baseOptions = [
      { id: "duel", label: "1v1 turn-based duels (3 cards each)", base: 42 },
      { id: "raid", label: "Co-op raids against a giant boss critter", base: 78 },
      { id: "league", label: "Weekly neighbourhood league + leaderboard", base: 31 },
      { id: "draft", label: "Draft mode: build a deck from friends' albums", base: 19 },
    ];
    return {
      options: baseOptions.map((o) => ({
        id: o.id,
        label: o.label,
        votes: o.base + (data.pvpVotes[o.id] ? 1 : 0),
        voted: Boolean(data.pvpVotes[o.id]),
      })),
    };
  }

  public votePvp(option: string) {
    const data = this.load();
    data.pvpVotes[option] = !data.pvpVotes[option];
    this.save(data);
    return { ok: true };
  }

  public getShop() {
    const me = this.getMe();
    return {
      items: STORE_CATALOG,
      me,
    };
  }

  public buyShopItem(itemId: string) {
    const data = this.load();
    const item = STORE_CATALOG.find((i) => i.id === itemId);
    if (!item) throw new Error("Unknown item.");

    if (item.kind === "subscription") {
      data.user.isPremiumActive = !data.user.isPremiumActive;
      this.save(data);
      return { me: this.getMe(), message: data.user.isPremiumActive ? "premium-on" : "premium-off" };
    }

    if (data.user.coins < item.price) {
      throw new Error("Not enough coins.");
    }

    // Sync first so the cap reflects the current entitlement before we add bonus cans.
    const state = this.getCansState(data);

    const payload = item.payload as { cans?: number; cosmetic?: string };
    if (payload.cosmetic) {
      if (data.user.ownedCosmetics.includes(payload.cosmetic)) {
        throw new Error("Already owned.");
      }
      data.user.ownedCosmetics.push(payload.cosmetic);
    }

    data.user.coins -= item.price;
    if (payload.cans) {
      data.cans.current = Math.min(state.max + payload.cans, data.cans.current + payload.cans);
    }
    this.save(data);
    return { me: this.getMe(), message: "purchased" };
  }

  public watchAdReward() {
    const data = this.load();
    // Sync first so accrued cans and the current cap are honoured.
    const state = this.getCansState(data);
    if (state.current >= state.max + 2) {
      throw new Error("Your can stash is already overflowing.");
    }
    data.cans.current = Math.min(state.max + 3, data.cans.current + 1);
    this.save(data);
    return { me: this.getMe() };
  }

  public exportAccount() {
    const data = this.load();
    return {
      exportedAt: new Date().toISOString(),
      user: data.user,
      cardsCount: data.cards.length,
      cards: data.cards,
      sightings: data.sightings,
    };
  }

  public deleteAccount() {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(SAVE_KEY);
    }
    this.memoryData = getInitialData();
    // Also clear IndexedDB so that initAsyncRestore() cannot restore stale data
    // after the account has been deleted.
    if (typeof window !== "undefined" && window.indexedDB) {
      void openIdb()
        .then((db) => {
          const tx = db.transaction(IDB_STORE, "readwrite");
          tx.objectStore(IDB_STORE).delete(SAVE_KEY);
        })
        .catch(() => {
          // Best-effort: storage is already gone from localStorage; ignore IDB failures.
        });
    }
    return { ok: true };
  }
}

export const localStore = new LocalStoreEngine();
