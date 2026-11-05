import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  doublePrecision,
  jsonb,
  serial,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull(),
  email: text("email"),
  avatarSeed: text("avatar_seed").notNull().default("fox"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  coins: integer("coins").notNull().default(50),
  streakCount: integer("streak_count").notNull().default(0),
  lastActiveDate: text("last_active_date"),
  cosmetics: jsonb("cosmetics").$type<{ hat?: string; glasses?: string; frame?: string }>().notNull().default({}),
  ownedCosmetics: jsonb("owned_cosmetics").$type<string[]>().notNull().default([]),
  isPremiumActive: boolean("is_premium_active").notNull().default(false),
  gdprConsentAt: timestamp("gdpr_consent_at", { withTimezone: true }),
  locationConsent: boolean("location_consent").notNull().default(false),
  ageConfirmed: boolean("age_confirmed").notNull().default(false),
  deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resourceBalances = pgTable("resource_balances", {
  userId: uuid("user_id").primaryKey(),
  current: integer("current").notNull().default(4),
  max: integer("max").notNull().default(5),
  lastRechargeAt: timestamp("last_recharge_at", { withTimezone: true }).notNull().defaultNow(),
  rechargeRateMinutes: integer("recharge_rate_minutes").notNull().default(25),
});

export const sightings = pgTable(
  "sightings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
    photoUrl: text("photo_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    phash: text("phash"),
    detectedTaxonCategory: text("detected_taxon_category").notNull(),
    detectedSpeciesLabel: text("detected_species_label"),
    geoLat: doublePrecision("geo_lat"),
    geoLng: doublePrecision("geo_lng"),
    isSensitiveSpecies: boolean("is_sensitive_species").notNull().default(false),
    verificationStatus: text("verification_status").notNull().default("pending"),
    linkedFromSightingId: uuid("linked_from_sighting_id"),
    isPublic: boolean("is_public").notNull().default(true),
  },
  (t) => [index("sightings_user_idx").on(t.userId)],
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sightingId: uuid("sighting_id").notNull(),
    ownerUserId: uuid("owner_user_id").notNull(),
    generatedName: text("generated_name").notNull(),
    serialNumber: integer("serial_number").notNull(),
    taxonCategory: text("taxon_category").notNull(),
    speciesLabel: text("species_label"),
    rarityTier: text("rarity_tier").notNull(),
    statA: integer("stat_a").notNull(),
    statB: integer("stat_b").notNull(),
    statC: integer("stat_c"),
    statCLabel: text("stat_c_label"),
    typeLabel: text("type_label").notNull(),
    abilities: jsonb("abilities").$type<string[]>().notNull().default([]),
    photoUrl: text("photo_url").notNull(),
    xpAwarded: integer("xp_awarded").notNull().default(0),
    coinsAwarded: integer("coins_awarded").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("cards_owner_idx").on(t.ownerUserId)],
);

export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  friendId: uuid("friend_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  kind: text("kind").notNull().default("info"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storeItems = pgTable("store_items", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  sku: text("sku").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  emoji: text("emoji").notNull().default("✨"),
});

export const pvpVotes = pgTable("pvp_votes", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  option: text("option").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scanEvents = pgTable("scan_events", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rounds = pgTable("rounds", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  attemptsLeft: integer("attempts_left").notNull().default(3),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serialCounters = pgTable("serial_counters", {
  tier: text("tier").primaryKey(),
  value: integer("value").notNull().default(0),
});
