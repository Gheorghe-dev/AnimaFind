import {
  ABILITIES,
  NAME_BANK,
  RARITY_META,
  SPECIES,
  TAXON_META,
  TIER_ORDER,
  TYPE_LABELS,
  UNIVERSAL_ABILITIES,
  type RarityTier,
  type TaxonCategory,
} from "./game-data";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function speciesInfo(label?: string | null) {
  if (!label) return undefined;
  return SPECIES.find((s) => s.label.toLowerCase() === label.toLowerCase());
}

/**
 * Rarity roll: weighted RNG, biased upward by how rarely the species is seen
 * in everyday life (commonness 1..5).
 */
export function rollRarity(commonness = 2): RarityTier {
  const bias = Math.max(0, commonness - 1); // 0..4
  const weights = TIER_ORDER.map((tier) => {
    const meta = RARITY_META[tier];
    const shift = 1 + bias * 0.55 * (meta.rank - 1);
    return Math.max(0.2, meta.weight * (meta.rank >= 3 ? shift : 1 / (1 + bias * 0.25)));
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < TIER_ORDER.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return TIER_ORDER[i];
  }
  return "tier1";
}

export function generateName(taxon: TaxonCategory): string {
  const bank = NAME_BANK[taxon] ?? NAME_BANK.Other;
  return `${pick(bank.titles)} ${pick(bank.adjectives)} ${pick(bank.nouns)}`;
}

export function generateAbilities(taxon: TaxonCategory, tier: RarityTier): string[] {
  const pool = [...(ABILITIES[taxon] ?? ABILITIES.Other)];
  const count = RARITY_META[tier].rank >= 4 ? 3 : RARITY_META[tier].rank >= 2 ? 2 : 1;
  const chosen: string[] = [];
  while (chosen.length < count && pool.length) {
    chosen.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  if (RARITY_META[tier].rank === 5) chosen.push(pick(UNIVERSAL_ABILITIES));
  return chosen;
}

export type GeneratedCard = {
  generatedName: string;
  taxonCategory: TaxonCategory;
  rarityTier: RarityTier;
  statA: number;
  statB: number;
  statC: number;
  statCLabel: string;
  typeLabel: string;
  abilities: string[];
  xpAwarded: number;
  coinsAwarded: number;
};

export function generateCard(taxon: TaxonCategory, speciesLabel?: string | null): GeneratedCard {
  const info = speciesInfo(speciesLabel);
  const tier = rollRarity(info?.commonness ?? 2);
  const meta = RARITY_META[tier];
  const base = meta.statBonus;
  return {
    generatedName: generateName(taxon),
    taxonCategory: taxon,
    rarityTier: tier,
    statA: Math.min(99, rand(12, 46) + base + rand(-4, 6)),
    statB: Math.min(99, rand(12, 46) + base + rand(-4, 6)),
    statC: Math.min(99, rand(10, 42) + base + rand(-6, 8)),
    statCLabel: TAXON_META[taxon].statCLabel,
    typeLabel: pick(TYPE_LABELS[taxon] ?? TYPE_LABELS.Other),
    abilities: generateAbilities(taxon, tier),
    xpAwarded: meta.xp + rand(0, 10),
    coinsAwarded: meta.coins + rand(0, 5),
  };
}
