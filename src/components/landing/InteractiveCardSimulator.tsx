"use client";

import Link from "next/link";
import { useState, useMemo, type FC } from "react";
import {
  FoxIllustration,
  OwlIllustration,
  HedgehogIllustration,
  ButterflyIllustration,
  BeetleIllustration,
} from "./CardIllustrations";
import { RARITY_META, TAXON_META, type RarityTier, type TaxonCategory } from "@/lib/game-data";
import {
  IconSparkles,
  IconDice,
  IconFlip,
  IconBulb,
  IconCamera,
  TaxonIcon,
} from "@/components/icons/AppIcons";

type DemoCard = {
  tier: RarityTier;
  taxon: TaxonCategory;
  name: string;
  type: string;
  serial: number;
  statA: number;
  statB: number;
  statC: number;
  abilities: string[];
  lore: string;
};

const SAMPLE_TEMPLATES: Record<RarityTier, DemoCard> = {
  tier1: {
    tier: "tier1",
    taxon: "Mammal",
    name: "Baron Snuffle Bramble",
    type: "Scruffy Snacker",
    serial: 18420,
    statA: 38,
    statB: 44,
    statC: 40,
    abilities: ["Snack Radar", "Static Floof"],
    lore: "Forages peacefully beneath compost heaps and thorn bushes. Will roll into an impenetrable spiky ball if startled by dry leaves.",
  },
  tier2: {
    tier: "tier2",
    taxon: "Insect",
    name: "Dame Flutter Breeze",
    type: "Iridescent Glider",
    serial: 9140,
    statA: 48,
    statB: 62,
    statC: 55,
    abilities: ["Wing Blur", "Pollen Cloud"],
    lore: "Rides thermal garden drafts between nectar blossoms. Flashes ultraviolet patterns invisible to predators.",
  },
  tier3: {
    tier: "tier3",
    taxon: "Bird",
    name: "Professor Nightfall Talon",
    type: "Silent Glider",
    serial: 4210,
    statA: 64,
    statB: 71,
    statC: 78,
    abilities: ["Thermal Ride", "Mimic Call", "Field Notes"],
    lore: "Perches on barn rafters waiting for moonrise. Asymmetric ears locate field mice under deep grass thatch in total darkness.",
  },
  tier4: {
    tier: "tier4",
    taxon: "Insect",
    name: "Marshal Ironclad Mandible",
    type: "Armoured Titan",
    serial: 1042,
    statA: 78,
    statB: 80,
    statC: 89,
    abilities: ["Chitin Guard", "Night Lantern", "Pollen Cloud"],
    lore: "Clashes over decayed oak heartwood on warm summer twilights. Pincers deliver crushing clamp pressure.",
  },
  tier5: {
    tier: "tier5",
    taxon: "Mammal",
    name: "Sir Bramble Thunder",
    type: "Chonky Sovereign",
    serial: 42,
    statA: 88,
    statB: 94,
    statC: 98,
    abilities: ["Static Floof", "Snack Radar", "Toe Bean Stomp", "Lucky Sighting"],
    lore: "The legendary amber ghost of twilight meadows. Vanishes in a rustle of ferns before camera shutters can click.",
  },
};

export default function InteractiveCardSimulator() {
  const [selectedTier, setSelectedTier] = useState<RarityTier>("tier5");
  const [flipped, setFlipped] = useState(false);
  const [rollCount, setRollCount] = useState(0);

  const card = useMemo(() => {
    const base = SAMPLE_TEMPLATES[selectedTier];
    if (rollCount === 0) return base;

    const titles = ["Sir", "Dame", "Baron", "Professor", "Captain", "Duchess", "Chief", "Marshal"];
    const adjectives = ["Grumpy", "Velvet", "Rowdy", "Wobbly", "Regal", "Snoozy", "Bramble", "Gilded"];
    const nouns = ["Turnip", "Thunder", "Biscuit", "Pillow", "Muffin", "Bandit", "Sprout", "Echo"];

    const rTitle = titles[(rollCount * 3) % titles.length];
    const rAdj = adjectives[(rollCount * 5) % adjectives.length];
    const rNoun = nouns[(rollCount * 7) % nouns.length];

    const bonus = RARITY_META[selectedTier].statBonus;
    return {
      ...base,
      name: `${rTitle} ${rAdj} ${rNoun}`,
      serial: Math.floor(base.serial + (rollCount * 17) % 500),
      statA: Math.min(99, 30 + bonus + ((rollCount * 11) % 25)),
      statB: Math.min(99, 30 + bonus + ((rollCount * 13) % 25)),
      statC: Math.min(99, 30 + bonus + ((rollCount * 17) % 25)),
    };
  }, [selectedTier, rollCount]);

  const meta = RARITY_META[selectedTier];
  const taxonMeta = TAXON_META[card.taxon];

  const IllustrationComponent: FC<{ className?: string }> = useMemo(() => {
    switch (selectedTier) {
      case "tier1":
        return HedgehogIllustration;
      case "tier2":
        return ButterflyIllustration;
      case "tier3":
        return OwlIllustration;
      case "tier4":
        return BeetleIllustration;
      case "tier5":
      default:
        return FoxIllustration;
    }
  }, [selectedTier]);

  return (
    <section id="simulator" className="relative py-16 sm:py-24 bg-paper2/40 border-y border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconSparkles size={14} className="text-accent" />
            <span>Interactive Minting &amp; Rarity Engine</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Experience the Procedural Card Studio
          </h2>
          <p className="text-sm font-semibold text-inksoft sm:text-base">
            Every animal sighting mints a mathematically unique collector trading card.
            Switch rarity tiers, inspect dynamic stats, roll new specimen traits, and tap to flip!
          </p>
        </div>

        {/* Tier Selector Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {(["tier1", "tier2", "tier3", "tier4", "tier5"] as RarityTier[]).map((tierKey) => {
            const tMeta = RARITY_META[tierKey];
            const isActive = selectedTier === tierKey;
            return (
              <button
                key={tierKey}
                onClick={() => {
                  setSelectedTier(tierKey);
                  setFlipped(false);
                }}
                className={`flex items-center gap-2 rounded-2xl border-2 px-3.5 py-2 text-xs font-black transition-all ${
                  isActive
                    ? "border-ink bg-white shadow-md scale-105"
                    : "border-ink/20 bg-white/60 hover:bg-white text-inksoft"
                }`}
                style={isActive ? { boxShadow: `0 0 16px ${tMeta.glow}` } : {}}
              >
                <span
                  className="h-3 w-3 rounded-full border border-ink"
                  style={{ backgroundColor: tMeta.color }}
                />
                <span className="text-ink">{tMeta.name}</span>
                <span className="rounded-md bg-ink/5 px-1.5 py-0.5 text-[9px] text-inksoft">
                  {tMeta.weight}% wild drop
                </span>
              </button>
            );
          })}
        </div>

        {/* Studio Grid */}
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Card Presentation Stage */}
          <div className="flex flex-col items-center justify-center lg:col-span-6">
            <div className="w-full max-w-[340px]">
              <div className="[perspective:1200px]">
                <div
                  onClick={() => setFlipped((f) => !f)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
                  }}
                  className={`card-flip relative block h-[470px] w-full cursor-pointer select-none transition-all duration-500 hover:scale-[1.02] ${
                    flipped ? "flipped" : ""
                  }`}
                  aria-label={`Interactive ${meta.name} card`}
                >
                  {/* FRONT */}
                  <div
                    className={`card-face doodle absolute inset-0 flex flex-col justify-between p-3.5 ${
                      selectedTier === "tier5" ? "golden" : ""
                    }`}
                    style={{
                      background: "#fffdf6",
                      boxShadow: `4px 4px 0 #2c2823, 0 0 28px ${meta.glow}`,
                    }}
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between pb-2">
                        <span
                          className="inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-[10px] font-black text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {selectedTier === "tier5" && <IconSparkles size={11} className="inline" />} {meta.name} Tier
                        </span>
                        <span className="text-[11px] font-black tracking-wider text-inksoft">
                          #{String(card.serial).padStart(5, "0")}
                        </span>
                      </div>

                      {/* Artwork */}
                      <div className="relative h-60 w-full overflow-hidden rounded-xl border-2 border-ink bg-stone-900 shadow-inner">
                        <IllustrationComponent className="h-full w-full object-cover" />
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                          <TaxonIcon taxon={card.taxon} size={11} />
                          <span>{card.taxon} · {card.type}</span>
                        </span>
                      </div>

                      {/* Name */}
                      <div className="pt-2">
                        <h3 className="truncate text-xl font-black text-ink">{card.name}</h3>
                        <p className="text-xs font-bold text-inksoft">
                          Rarity Rank {meta.rank}/5 · +{meta.xp} XP bonus
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t-2 border-dashed border-ink/20 pt-2 space-y-1">
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="rounded-xl border border-ink/20 bg-amber-50/70 p-1">
                          <span className="block text-[8px] font-bold uppercase text-inksoft">Snack</span>
                          <span className="text-sm font-black text-ink">{card.statA}</span>
                        </div>
                        <div className="rounded-xl border border-ink/20 bg-rose-50/70 p-1">
                          <span className="block text-[8px] font-bold uppercase text-inksoft">Charm</span>
                          <span className="text-sm font-black text-ink">{card.statB}</span>
                        </div>
                        <div className="rounded-xl border border-ink/20 bg-emerald-50/70 p-1">
                          <span className="block text-[8px] font-bold uppercase text-inksoft">
                            {taxonMeta.statCLabel}
                          </span>
                          <span className="text-sm font-black text-ink">{card.statC}</span>
                        </div>
                      </div>
                      <p className="text-center text-[10px] font-bold text-accent">
                        Tap to flip for Lore &amp; Abilities ↺
                      </p>
                    </div>
                  </div>

                  {/* BACK */}
                  <div
                    className="card-face card-back doodle absolute inset-0 flex flex-col justify-between p-4 text-left"
                    style={{
                      background: "#fffdf6",
                      boxShadow: `4px 4px 0 #2c2823, 0 0 28px ${meta.glow}`,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
                        <span className="text-xs font-black uppercase text-ink">{meta.name} Series</span>
                        <span className="text-xs font-black" style={{ color: meta.color }}>
                          Drop Weight: {meta.weight}%
                        </span>
                      </div>

                      <h4 className="mt-2 text-lg font-black text-ink">{card.name}</h4>
                      <p className="mt-1 text-xs text-inksoft leading-relaxed">&quot;{card.lore}&quot;</p>

                      <div className="mt-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">
                          Card Abilities
                        </p>
                        <div className="mt-1.5 space-y-1.5">
                          {card.abilities.map((ability) => (
                            <div
                              key={ability}
                              className="doodle-soft bg-white/80 px-2.5 py-1 text-xs font-bold text-ink flex items-center gap-1.5"
                            >
                              <span className="text-accent">✦</span>
                              <span>{ability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-ink/20 bg-paper p-2 text-[10px] font-bold text-inksoft">
                      <div className="flex justify-between">
                        <span>Class: {card.taxon}</span>
                        <span>Bonus: +{meta.statBonus} Base</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Advantage: vs {taxonMeta.advantage}</span>
                        <span>Serial: #{card.serial}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls & Deep-Dive Information */}
          <div className="space-y-6 lg:col-span-6">
            <div className="glass-panel rounded-3xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-inksoft">
                    Rarity Breakdown
                  </span>
                  <h3 className="text-2xl font-black text-ink">{meta.name} Series</h3>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-black text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  Rank {meta.rank} / 5
                </span>
              </div>

              {/* Progress bars of stats */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Snack Power</span>
                    <span className="font-black text-ink">{card.statA} / 100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${card.statA}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Wild Charm</span>
                    <span className="font-black text-ink">{card.statB} / 100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${card.statB}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Taxon Trait ({taxonMeta.statCLabel})</span>
                    <span className="font-black text-ink">{card.statC} / 100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${card.statC}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setRollCount((c) => c + 1)}
                  className="btn btn-accent flex-1 py-3 text-xs font-black inline-flex items-center justify-center gap-1.5"
                >
                  <IconDice size={15} />
                  <span>Procedurally Reroll Specimen</span>
                </button>
                <button
                  onClick={() => setFlipped((f) => !f)}
                  className="btn flex-1 py-3 text-xs font-bold inline-flex items-center justify-center gap-1.5"
                >
                  <IconFlip size={15} />
                  <span>Flip Card Face</span>
                </button>
              </div>

              <div className="rounded-2xl border border-ink/15 bg-white/80 p-3 text-xs text-inksoft leading-relaxed flex items-start gap-2">
                <IconBulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-ink">How Minting Works:</strong> When your live sighting passes parallax and
                  screen checks and your tin-can toss lands, our deterministic PRNG seeds stats and abilities
                  from the exact GPS precision and taxon characteristics!
                </div>
              </div>
            </div>

            <div className="text-center sm:text-left">
              <Link
                href="/"
                className="btn btn-leaf inline-flex items-center gap-2 px-6 py-3 text-sm font-black"
              >
                <IconCamera size={16} />
                <span>Scan Live Animal to Mint This in Reality →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
