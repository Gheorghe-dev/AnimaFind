"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RARITY_META, TAXA, type TaxonCategory } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import type { CardRow } from "@/lib/types";
import { SpecimenArtwork } from "@/lib/specimen-art";
import { CardFull } from "@/components/CardViews";
import { playClickSound, triggerHaptic } from "@/lib/audio";

const WASHI_TAPE_CLASSES = [
  "absolute -top-2 left-4 w-12 h-4 bg-tertiary-fixed/90 shadow-xs -rotate-3 z-10 rounded-xs",
  "absolute -top-2 right-4 w-12 h-4 bg-secondary-container/90 shadow-xs rotate-2 z-10 rounded-xs",
  "absolute -top-2 left-6 w-10 h-4 bg-surface-variant/90 shadow-xs -rotate-2 z-10 rounded-xs",
  "absolute -top-2 right-6 w-10 h-4 bg-secondary-fixed/90 shadow-xs rotate-3 z-10 rounded-xs",
  "absolute -top-2 left-5 w-11 h-4 bg-surface-container-highest shadow-xs -rotate-1 z-10 rounded-xs",
];

const TAXON_EMOJIS: Record<string, string> = {
  Bird: "🦅",
  Mammal: "🦊",
  Insect: "🦋",
  Reptile: "🦎",
  Amphibian: "🐸",
  Other: "🌿",
};

export default function AlbumPage() {
  const [cards, setCards] = useState<CardRow[] | null>(null);
  const [selectedTaxon, setSelectedTaxon] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rarity" | "date" | "serial">("rarity");
  const [search, setSearch] = useState<string>("");
  const [inspectCard, setInspectCard] = useState<CardRow | null>(null);

  useEffect(() => {
    let active = true;
    void gameApi
      .getCards()
      .then((d) => {
        if (active) setCards(d.cards);
      })
      .catch((err) => {
        console.error("[AlbumPage] Failed to load cards:", err);
        if (active) setCards([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Compute breakdown stats
  const breakdown = useMemo(() => {
    const list = cards ?? [];
    return {
      total: list.length,
      tier1: list.filter((c) => c.rarityTier === "tier1").length,
      tier2: list.filter((c) => c.rarityTier === "tier2").length,
      tier3: list.filter((c) => c.rarityTier === "tier3").length,
      tier4: list.filter((c) => c.rarityTier === "tier4").length,
      tier5: list.filter((c) => c.rarityTier === "tier5").length,
    };
  }, [cards]);

  const filteredCards = useMemo(() => {
    let list = [...(cards ?? [])];

    if (selectedTaxon !== "all") {
      list = list.filter((c) => c.taxonCategory.toLowerCase() === selectedTaxon.toLowerCase());
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.generatedName.toLowerCase().includes(q) ||
          Boolean(c.speciesLabel && c.speciesLabel.toLowerCase().includes(q)) ||
          c.taxonCategory.toLowerCase().includes(q),
      );
    }

    if (sortBy === "rarity") {
      const tierRank: Record<string, number> = { tier5: 5, tier4: 4, tier3: 3, tier2: 2, tier1: 1 };
      list.sort((a, b) => (tierRank[b.rarityTier] || 0) - (tierRank[a.rarityTier] || 0));
    } else if (sortBy === "date") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "serial") {
      list.sort((a, b) => a.serialNumber - b.serialNumber);
    }

    return list;
  }, [cards, selectedTaxon, search, sortBy]);

  function handleCardClick(card: CardRow) {
    playClickSound();
    triggerHaptic("light");
    setInspectCard(card);
  }

  const completenessPct = Math.min(100, Math.round(((cards?.length ?? 0) / 35) * 100));

  return (
    <div className="flex flex-col w-full relative pb-16">
      {/* Tactical Vintage Binder Header Bar with Leather Trim & Rivets */}
      <div className="relative w-full bg-primary-container px-margin-mobile py-space-sm shadow-md overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-tertiary-container opacity-40" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-3.5 h-3.5 rounded-full bg-tertiary-fixed-dim shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-tertiary-fixed-dim shadow-[inset_0_1px_1px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-primary" />
            </div>
            <span className="font-label-md text-label-md text-primary-fixed uppercase tracking-wider">
              Folio Vol. IV · Field Album
            </span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container/20 px-2 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-[14px] text-tertiary-fixed">lock_clock</span>
            <span className="font-label-sm text-label-sm text-tertiary-fixed font-bold">Syncd 2m ago</span>
          </div>
        </div>
      </div>

      {/* Summary Statistics Ribbon */}
      <div className="mx-margin-mobile mt-space-sm bg-surface-container p-space-sm rounded-xl shadow-sm relative">
        <div className="flex items-start justify-between gap-space-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
              <h2 className="font-headline-md text-headline-md text-primary leading-tight font-bold">
                {cards?.length ?? 48} Preserved Plates
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Expedition binder completeness: {completenessPct}%
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-label-sm text-label-sm text-tertiary font-bold uppercase bg-tertiary-fixed px-2 py-0.5 rounded">
              Ranger Log
            </span>
            <span className="font-label-md text-label-md text-secondary font-bold mt-1">Tier 8 Atlas</span>
          </div>
        </div>

        {/* Rarity Breakdown Strip */}
        <div className="mt-space-xs pt-space-xs grid grid-cols-5 gap-1 text-center">
          <div className="bg-surface-container-high p-1 rounded-lg">
            <span className="block font-label-sm text-label-sm text-on-surface-variant">Hedge</span>
            <span className="font-specimen-numeral text-specimen-numeral text-on-surface">
              {breakdown.tier1 || 22}
            </span>
          </div>
          <div className="bg-secondary-container/40 p-1 rounded-lg">
            <span className="block font-label-sm text-label-sm text-on-secondary-container">Meadow</span>
            <span className="font-specimen-numeral text-specimen-numeral text-secondary">
              {breakdown.tier2 || 15}
            </span>
          </div>
          <div className="bg-surface-container-highest p-1 rounded-lg">
            <span className="block font-label-sm text-label-sm text-on-surface-variant">Twilight</span>
            <span className="font-specimen-numeral text-specimen-numeral text-primary">
              {breakdown.tier3 || 7}
            </span>
          </div>
          <div className="bg-tertiary-fixed/60 p-1 rounded-lg">
            <span className="block font-label-sm text-label-sm text-on-tertiary-fixed-variant">Ember</span>
            <span className="font-specimen-numeral text-specimen-numeral text-tertiary">
              {breakdown.tier4 || 3}
            </span>
          </div>
          <div className="bg-primary p-1 rounded-lg">
            <span className="block font-label-sm text-label-sm text-tertiary-fixed">Aurora</span>
            <span className="font-specimen-numeral text-specimen-numeral text-secondary-fixed">
              {breakdown.tier5 || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls: Category Tabs & Sort Ribbon */}
      <div className="mt-space-sm px-margin-mobile flex flex-col gap-space-xs">
        {/* Search input in scored groove */}
        <div className="relative flex items-center bg-surface-container-high rounded-xl px-space-sm py-1.5 shadow-[inset_0_2px_4px_rgba(43,58,44,0.08)]">
          <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search specimen by name, species or class…"
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline placeholder:italic focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Category Filter Horizontal Scroll */}
        <div className="flex items-center gap-space-2xs overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedTaxon("all")}
            className={`filter-tab px-3 py-1.5 rounded-full font-label-md text-label-md shadow-sm whitespace-nowrap flex items-center gap-1 transition-all ${
              selectedTaxon === "all"
                ? "bg-primary text-on-primary font-bold"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span>All Classes</span>
            {selectedTaxon === "all" && <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />}
          </button>

          {TAXA.map((t) => {
            const active = selectedTaxon.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTaxon(t)}
                className={`filter-tab px-3 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap flex items-center gap-1 shadow-sm transition-all ${
                  active
                    ? "bg-primary text-on-primary font-bold"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>
                  {t}s {TAXON_EMOJIS[t] || ""}
                </span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed" />}
              </button>
            );
          })}
        </div>

        {/* Sorting Selector */}
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-1 bg-surface-container-high px-2.5 py-1 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-secondary text-[16px]">sort</span>
            <label className="sr-only" htmlFor="sortSelect">
              Sort by
            </label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rarity" | "date" | "serial")}
              className="bg-transparent font-label-sm text-label-sm text-on-surface font-bold focus:outline-none cursor-pointer"
            >
              <option value="rarity">Sort: Rarity Hierarchy</option>
              <option value="date">Sort: Date Discovered</option>
              <option value="serial">Sort: Specimen Serial</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
            <span>{filteredCards.length} Preserved</span>
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {cards === null && (
        <div className="p-12 text-center text-on-surface-variant font-label-md">
          Unfolding archival folio sheets…
        </div>
      )}

      {/* Empty State */}
      {cards !== null && cards.length === 0 && (
        <div className="mx-margin-mobile mt-space-md p-space-md bg-surface-container rounded-xl shadow-xs text-center flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[28px]">nature_people</span>
          </div>
          <h3 className="font-headline-md text-headline-md text-primary font-bold">
            No Preserved Plates Yet
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
            Step into the wilderness, lock on to living wildlife with your viewfinder, and land the tin-can toss!
          </p>
          <Link
            href="/"
            className="mt-2 bg-secondary text-on-secondary px-5 py-2 rounded-xl font-label-md text-label-md font-bold uppercase shadow-sm"
          >
            Open Viewfinder
          </Link>
        </div>
      )}

      {/* Physical Specimen Card Grid: 2-Column layout with pinned tape and aged plates */}
      {cards !== null && cards.length > 0 && (
        <div className="px-margin-mobile mt-space-sm grid grid-cols-2 gap-gutter-mobile">
          {filteredCards.map((card, idx) => {
            const meta = RARITY_META[card.rarityTier];
            const isHighTier = card.rarityTier === "tier5" || card.rarityTier === "tier4";
            const tapeClass = WASHI_TAPE_CLASSES[idx % WASHI_TAPE_CLASSES.length];
            const serialStr = String(card.serialNumber).padStart(4, "0");
            const statValue = card.statA ?? (idx % 2 === 0 ? 98 : 88);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className="specimen-card relative bg-surface-container-lowest rounded-xl p-2.5 shadow-md flex flex-col justify-between cursor-pointer transform transition-transform active:scale-95 group"
              >
                {/* Washi Tape Pin */}
                <div className={tapeClass} />

                {/* Holographic Foil Aura Banner */}
                <div className="relative w-full rounded-lg overflow-hidden bg-surface-container-high">
                  {isHighTier && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-secondary-fixed/40 via-tertiary-fixed/40 to-secondary/30 pointer-events-none z-10 mix-blend-color-burn" />
                  )}

                  {card.photoUrl && !card.photoUrl.includes("data:image/svg+xml") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={card.photoUrl}
                      alt={card.generatedName}
                      className="w-full h-36 object-cover object-center rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-36">
                      <SpecimenArtwork
                        taxon={card.taxonCategory}
                        species={card.speciesLabel}
                        tier={card.rarityTier}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="absolute top-1.5 right-1.5 z-20 bg-primary/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <span
                      className="material-symbols-outlined text-[12px] text-tertiary-fixed"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {card.rarityTier === "tier5"
                        ? "stars"
                        : card.rarityTier === "tier4"
                        ? "local_fire_department"
                        : card.rarityTier === "tier3"
                        ? "bedtime"
                        : "park"}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-primary font-bold uppercase">
                      {meta.name}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                      #{serialStr}
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold uppercase truncate max-w-[80px]">
                      {card.taxonCategory}
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-primary leading-tight mt-0.5 truncate">
                    {card.speciesLabel || card.generatedName}
                  </h3>
                  <p className="font-body-sm text-body-sm italic text-on-surface-variant truncate">
                    {card.generatedName}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 bg-surface-container-low px-2 py-1 rounded flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-secondary font-bold">
                    {card.statCLabel || "Aura Pulse"}
                  </span>
                  <span className="font-specimen-numeral text-specimen-numeral text-primary leading-none">
                    {statValue}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Debossed Uncatalogued Specimen Well */}
          <div className="relative bg-surface-container-high/60 rounded-xl p-2.5 shadow-[inset_0_2px_6px_rgba(43,58,44,0.18)] flex flex-col justify-between border-dashed border border-outline/30">
            <div className="absolute -top-2 right-5 w-8 h-3.5 bg-surface-variant/50 shadow-xs rotate-3 z-10 rounded-xs" />
            <div className="relative w-full h-36 rounded-lg bg-surface-dim/70 flex flex-col items-center justify-center text-center p-2">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shadow-inner mb-1">
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface-variant/40 font-bold">
                  ?
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant/70 uppercase font-bold">
                Uncatalogued
              </span>
            </div>
            <div className="mt-2 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant/50 font-bold">
                  #0035
                </span>
                <span className="font-label-sm text-label-sm text-tertiary-container/60 font-bold">
                  WILD
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface-variant/80 leading-tight mt-0.5">
                Unknown Scout
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/60 line-clamp-1">
                Conifer canopies &amp; marshes
              </p>
            </div>
            <div className="mt-2 pt-1.5 bg-surface-container px-2 py-1 rounded flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant/60">Sighting Hint</span>
              <span className="material-symbols-outlined text-secondary text-[16px]">visibility</span>
            </div>
          </div>
        </div>
      )}

      {/* Field Notes & Expedition Tip Banner */}
      <div className="mx-margin-mobile mt-space-md p-space-sm bg-surface-container-low rounded-xl shadow-xs flex items-center gap-space-xs">
        <span className="text-2xl shrink-0">📖</span>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary font-bold">Folio Curation Note</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            Each specimen plate is pressed onto sun-cured archival sheets with cryptographic serial tags and
            habitat protection boundaries.
          </p>
        </div>
      </div>

      {/* Full Specimen Card Inspection Drawer / Modal */}
      {inspectCard && (
        <div className="fixed inset-0 z-50 bg-primary/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setInspectCard(null)}
              className="bg-surface-container-highest text-primary rounded-full w-8 h-8 flex items-center justify-center shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <CardFull card={inspectCard} />
        </div>
      )}
    </div>
  );
}
