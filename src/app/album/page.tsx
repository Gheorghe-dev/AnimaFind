"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CardTile } from "@/components/CardViews";
import { RARITY_META, TAXA, TAXON_META, TIER_ORDER } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import type { CardRow } from "@/lib/types";

export default function AlbumPage() {
  const [cards, setCards] = useState<CardRow[] | null>(null);
  const [taxon, setTaxon] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

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

  const types = useMemo(() => Array.from(new Set((cards ?? []).map((c) => c.typeLabel))).sort(), [cards]);

  const filtered = useMemo(
    () =>
      (cards ?? []).filter((c) => {
        const matchesTaxon = taxon === "all" || c.taxonCategory === taxon;
        const matchesTier = tier === "all" || c.rarityTier === tier;
        const matchesType = type === "all" || c.typeLabel === type;
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          c.generatedName.toLowerCase().includes(q) ||
          Boolean(c.speciesLabel && c.speciesLabel.toLowerCase().includes(q)) ||
          c.taxonCategory.toLowerCase().includes(q);
        return matchesTaxon && matchesTier && matchesType && matchesSearch;
      }),
    [cards, taxon, tier, type, search],
  );

  const hasActiveFilters = taxon !== "all" || tier !== "all" || type !== "all" || Boolean(search.trim());

  function resetFilters() {
    setTaxon("all");
    setTier("all");
    setType("all");
    setSearch("");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-black">Field journal</h1>
        <Link href="/codex" className="text-[11px] font-black underline">
          Encyclopedia →
        </Link>
      </div>

      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by card or species name…"
          aria-label="Search cards"
          className="doodle-soft w-full bg-white/70 px-3 py-2 pl-8 text-xs focus:outline-hidden"
        />
        <span className="absolute left-2.5 top-2 text-xs text-inksoft pointer-events-none">🔍</span>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-2 text-xs font-black text-inksoft hover:text-ink"
            aria-label="Clear search input"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-2">
        <Chips
          value={taxon}
          onChange={setTaxon}
          options={[
            { id: "all", label: "All classes" },
            ...TAXA.map((t) => ({ id: t, label: `${TAXON_META[t].emoji} ${t}` })),
          ]}
        />
        <Chips
          value={tier}
          onChange={setTier}
          options={[
            { id: "all", label: "All series" },
            ...TIER_ORDER.map((t) => ({ id: t, label: RARITY_META[t].name })),
          ]}
        />
        {types.length > 1 && (
          <Chips
            value={type}
            onChange={setType}
            options={[{ id: "all", label: "All types" }, ...types.map((t) => ({ id: t, label: t }))]}
          />
        )}
      </div>

      {cards === null && <p className="text-center text-sm font-bold text-inksoft">Turning pages…</p>}

      {cards !== null && cards.length === 0 && (
        <div className="doodle tape mt-6 p-6 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-2 font-black">Nothing pressed between these pages yet.</p>
          <p className="mt-1 text-xs text-inksoft">
            Go outside, find a pigeon with attitude, and scan it.
          </p>
          <Link href="/" className="btn btn-accent mt-4 inline-block">
            Start scanning
          </Link>
        </div>
      )}

      {cards !== null && cards.length > 0 && filtered.length === 0 && (
        <div className="doodle tape mt-6 p-6 text-center">
          <p className="text-4xl">🍃</p>
          <p className="mt-2 font-black">No cards match your current filters.</p>
          <p className="mt-1 text-xs text-inksoft">
            Try adjusting your search query, taxon class, or rarity series.
          </p>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="btn btn-accent mt-4 inline-block">
              Reset all filters
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 min-[370px]:grid-cols-3 gap-2">
        {filtered.map((c) => (
          <CardTile key={c.id} card={c} />
        ))}
      </div>

      {cards && cards.length > 0 && (
        <p className="pt-2 text-center text-[11px] font-bold text-inksoft">
          {filtered.length} of {cards.length} cards shown
        </p>
      )}
    </div>
  );
}

function Chips({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <div className="scrollhide flex gap-1.5 overflow-x-auto pb-1">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`whitespace-nowrap rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
            value === o.id ? "bg-ink text-paper shadow-xs" : "bg-white/70 hover:bg-white text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
