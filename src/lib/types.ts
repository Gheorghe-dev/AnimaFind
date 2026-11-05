import type { RarityTier, TaxonCategory } from "./game-data";

export type CardRow = {
  id: string;
  sightingId: string;
  ownerUserId: string;
  generatedName: string;
  serialNumber: number;
  taxonCategory: TaxonCategory;
  speciesLabel: string | null;
  rarityTier: RarityTier;
  statA: number;
  statB: number;
  statC: number | null;
  statCLabel: string | null;
  typeLabel: string;
  abilities: string[];
  photoUrl: string;
  xpAwarded: number;
  coinsAwarded: number;
  createdAt: string;
};

export type CanState = {
  current: number;
  max: number;
  rechargeRateMinutes: number;
  secondsUntilNext: number | null;
  lastRechargeAt: string;
};

export type Me = {
  user: {
    id: string;
    username: string;
    avatarSeed: string;
    xp: number;
    coins: number;
    streakCount: number;
    cosmetics: { hat?: string; glasses?: string; frame?: string };
    ownedCosmetics: string[];
    isPremiumActive: boolean;
    gdprConsentAt: string | null;
    locationConsent: boolean;
    ageConfirmed: boolean;
    createdAt: string;
    level: number;
    into: number;
    needed: number;
  };
  cans: CanState;
  stats: {
    totalCards: number;
    speciesDiversity: number;
    totalSightings: number;
    byTier: Record<string, number>;
    rarest: { id: string; name: string; tier: RarityTier } | null;
  };
};

export type MapPin = {
  sightingId: string;
  approxLat: number;
  approxLng: number;
  precision: string;
  thumbnailUrl: string;
  taxon: TaxonCategory;
  species: string | null;
  isSensitiveSpecies: boolean;
  byUsername: string;
  cardName: string | null;
  tier: RarityTier | null;
  timestamp: string;
  distanceMeters: number | null;
  isClaimableByViewer: boolean;
  alreadyClaimed: boolean;
  isOwn: boolean;
};
