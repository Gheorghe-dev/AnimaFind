export type TaxonCategory =
  | "Mammal"
  | "Bird"
  | "Insect"
  | "Reptile"
  | "Amphibian"
  | "Other";

export type RarityTier = "tier1" | "tier2" | "tier3" | "tier4" | "tier5";

export const TAXA: TaxonCategory[] = [
  "Mammal",
  "Bird",
  "Insect",
  "Reptile",
  "Amphibian",
  "Other",
];

export const TAXON_META: Record<
  TaxonCategory,
  { emoji: string; blurb: string; statCLabel: string; advantage: TaxonCategory }
> = {
  Mammal: { emoji: "🦊", blurb: "Fur, paws and warm blood.", statCLabel: "Grit", advantage: "Insect" },
  Bird: { emoji: "🐦", blurb: "Feathered, loud, always leaving.", statCLabel: "Speed", advantage: "Reptile" },
  Insect: { emoji: "🐝", blurb: "Six legs of pure chaos.", statCLabel: "Swarm", advantage: "Amphibian" },
  Reptile: { emoji: "🦎", blurb: "Sun-powered and scaly.", statCLabel: "Camouflage", advantage: "Mammal" },
  Amphibian: { emoji: "🐸", blurb: "Damp, squishy, excellent.", statCLabel: "Moisture", advantage: "Bird" },
  Other: { emoji: "🐌", blurb: "Wonderfully hard to classify.", statCLabel: "Mystery", advantage: "Other" },
};

export const RARITY_META: Record<
  RarityTier,
  {
    name: string;
    weight: number;
    color: string;
    glow: string;
    statBonus: number;
    xp: number;
    coins: number;
    rank: number;
  }
> = {
  tier1: { name: "Hedgerow", weight: 50, color: "#7f9c6a", glow: "rgba(127,156,106,.55)", statBonus: 0, xp: 20, coins: 6, rank: 1 },
  tier2: { name: "Meadow", weight: 27, color: "#4a9ec4", glow: "rgba(74,158,196,.55)", statBonus: 8, xp: 35, coins: 12, rank: 2 },
  tier3: { name: "Twilight", weight: 14, color: "#8c6bd6", glow: "rgba(140,107,214,.6)", statBonus: 16, xp: 60, coins: 22, rank: 3 },
  tier4: { name: "Emberwood", weight: 7, color: "#e2703a", glow: "rgba(226,112,58,.65)", statBonus: 26, xp: 110, coins: 45, rank: 4 },
  tier5: { name: "Aurora", weight: 2, color: "#e8b53c", glow: "rgba(232,181,60,.8)", statBonus: 38, xp: 240, coins: 120, rank: 5 },
};

export const TIER_ORDER: RarityTier[] = ["tier1", "tier2", "tier3", "tier4", "tier5"];

export const TYPE_LABELS: Record<TaxonCategory, string[]> = {
  Mammal: ["Chonky", "Sleek", "Fluffy", "Scruffy", "Velveteen"],
  Bird: ["Feathered", "Puffed", "Crested", "Darting", "Glossy"],
  Insect: ["Iridescent", "Bristly", "Papery", "Armoured", "Buzzing"],
  Reptile: ["Scaly", "Sunbaked", "Banded", "Leathery", "Glinting"],
  Amphibian: ["Dewy", "Speckled", "Slick", "Mossy", "Bulgy"],
  Other: ["Curious", "Spiral", "Squishy", "Odd", "Shelled"],
};

export const ABILITIES: Record<TaxonCategory, string[]> = {
  Mammal: ["Nap Aura", "Snack Radar", "Zoomies", "Toe Bean Stomp", "Static Floof"],
  Bird: ["Dawn Chorus", "Dive Bomb", "Crumb Snatch", "Thermal Ride", "Mimic Call"],
  Insect: ["Pollen Cloud", "Hive Signal", "Chitin Guard", "Night Lantern", "Wing Blur"],
  Reptile: ["Basking Heat", "Tail Drop", "Stone Stillness", "Colour Shift", "Slow Blink"],
  Amphibian: ["Sticky Tongue", "Rain Song", "Skin Breath", "Pond Leap", "Toxin Sheen"],
  Other: ["Slime Trail", "Shell Hide", "Tide Sense", "Odd Angle", "Slow Wonder"],
};

export const UNIVERSAL_ABILITIES = ["Field Notes", "Lucky Sighting", "Backyard Legend"];

const TITLES_COMMON = ["Sir", "Dame", "Baron", "Captain", "Professor", "Duchess", "Marshal", "Bishop", "Lady", "Chief"];

export const NAME_BANK: Record<TaxonCategory, { titles: string[]; adjectives: string[]; nouns: string[] }> = {
  Mammal: {
    titles: [...TITLES_COMMON, "Lord", "Mayor"],
    adjectives: ["Defiant", "Grumpy", "Velvet", "Rowdy", "Wobbly", "Regal", "Snoozy", "Bramble"],
    nouns: ["Donut", "Biscuit", "Pillow", "Turnip", "Thunder", "Muffin", "Bandit", "Sprout"],
  },
  Bird: {
    titles: [...TITLES_COMMON, "Herald", "Maestro"],
    adjectives: ["Shrill", "Gilded", "Restless", "Dawnlit", "Windborne", "Chattering", "Sleepless"],
    nouns: ["Whistle", "Kite", "Crumb", "Steeple", "Semaphore", "Gale", "Cornet", "Pipit"],
  },
  Insect: {
    titles: ["Micro-Duke", "Sergeant", "Envoy", "Tiny Baron", "Warden", "Emissary"],
    adjectives: ["Iridescent", "Frantic", "Copper", "Humming", "Lacquered", "Twitchy"],
    nouns: ["Rivet", "Filament", "Speck", "Cog", "Ember", "Thistle", "Lantern"],
  },
  Reptile: {
    titles: ["Elder", "Oracle", "Magistrate", "Warden", "Old", "Sovereign"],
    adjectives: ["Sunbaked", "Patient", "Obsidian", "Flint", "Ancient", "Still"],
    nouns: ["Sundial", "Pebble", "Cinder", "Rampart", "Whisper", "Basalt"],
  },
  Amphibian: {
    titles: ["Maestro", "Bard", "Squire", "Reverend", "Little", "Alderman"],
    adjectives: ["Dewy", "Croaking", "Mossy", "Rainy", "Bubbling", "Emerald"],
    nouns: ["Puddle", "Lilypad", "Gargle", "Bassoon", "Marsh", "Dumpling"],
  },
  Other: {
    titles: ["Curator", "Wanderer", "Anon", "Keeper", "Odd"],
    adjectives: ["Unlisted", "Spiral", "Quiet", "Slow", "Peculiar"],
    nouns: ["Enigma", "Spiral", "Footnote", "Sketch", "Margin"],
  },
};

export type SpeciesEntry = {
  label: string;
  taxon: TaxonCategory;
  commonness: number; // 1 = everywhere, 5 = very rare
  sensitive?: boolean;
};

export const SPECIES: SpeciesEntry[] = [
  { label: "Domestic Cat", taxon: "Mammal", commonness: 1 },
  { label: "Domestic Dog", taxon: "Mammal", commonness: 1 },
  { label: "Grey Squirrel", taxon: "Mammal", commonness: 1 },
  { label: "Red Fox", taxon: "Mammal", commonness: 3 },
  { label: "European Hedgehog", taxon: "Mammal", commonness: 4, sensitive: true },
  { label: "Horse", taxon: "Mammal", commonness: 2 },
  { label: "Sheep", taxon: "Mammal", commonness: 2 },
  { label: "Cow", taxon: "Mammal", commonness: 2 },
  { label: "Roe Deer", taxon: "Mammal", commonness: 4, sensitive: true },
  { label: "Brown Bat", taxon: "Mammal", commonness: 5, sensitive: true },
  { label: "House Sparrow", taxon: "Bird", commonness: 1 },
  { label: "Rock Pigeon", taxon: "Bird", commonness: 1 },
  { label: "Hooded Crow", taxon: "Bird", commonness: 2 },
  { label: "Great Tit", taxon: "Bird", commonness: 2 },
  { label: "Common Blackbird", taxon: "Bird", commonness: 2 },
  { label: "White Stork", taxon: "Bird", commonness: 4, sensitive: true },
  { label: "Common Kestrel", taxon: "Bird", commonness: 4, sensitive: true },
  { label: "Kingfisher", taxon: "Bird", commonness: 5, sensitive: true },
  { label: "Honey Bee", taxon: "Insect", commonness: 1 },
  { label: "Cabbage White Butterfly", taxon: "Insect", commonness: 1 },
  { label: "Seven-spot Ladybird", taxon: "Insect", commonness: 2 },
  { label: "Garden Bumblebee", taxon: "Insect", commonness: 2 },
  { label: "Emperor Dragonfly", taxon: "Insect", commonness: 3 },
  { label: "Stag Beetle", taxon: "Insect", commonness: 5, sensitive: true },
  { label: "Common Wall Lizard", taxon: "Reptile", commonness: 2 },
  { label: "Slow Worm", taxon: "Reptile", commonness: 4, sensitive: true },
  { label: "Grass Snake", taxon: "Reptile", commonness: 4, sensitive: true },
  { label: "European Pond Turtle", taxon: "Reptile", commonness: 5, sensitive: true },
  { label: "Common Frog", taxon: "Amphibian", commonness: 2 },
  { label: "Common Toad", taxon: "Amphibian", commonness: 3 },
  { label: "Fire Salamander", taxon: "Amphibian", commonness: 5, sensitive: true },
  { label: "Garden Snail", taxon: "Other", commonness: 1 },
  { label: "Common Earthworm", taxon: "Other", commonness: 1 },
  { label: "Garden Spider", taxon: "Other", commonness: 2 },
  { label: "Woodlouse", taxon: "Other", commonness: 1 },
];

export const ENCYCLOPEDIA_TOTALS: Record<TaxonCategory, number> = TAXA.reduce(
  (acc, taxon) => {
    acc[taxon] = SPECIES.filter((s) => s.taxon === taxon).length;
    return acc;
  },
  {} as Record<TaxonCategory, number>,
);

export const COSMETICS: Record<string, { name: string; emoji: string; slot: "hat" | "glasses" | "frame" }> = {
  "hat-explorer": { name: "Explorer Hat", emoji: "🎩", slot: "hat" },
  "hat-leaf": { name: "Leaf Crown", emoji: "🍃", slot: "hat" },
  "glasses-round": { name: "Naturalist Specs", emoji: "🤓", slot: "glasses" },
  "frame-gold": { name: "Gold Journal Frame", emoji: "🖼️", slot: "frame" },
};

export function levelForXp(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let remaining = xp;
  let needed = 100;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = Math.round(needed * 1.35);
  }
  return { level, into: remaining, needed };
}
