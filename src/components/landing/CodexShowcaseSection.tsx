"use client";

import { useState } from "react";
import Link from "next/link";
import { SPECIES, TAXA, type TaxonCategory } from "@/lib/game-data";
import {
  IconCodex,
  IconShield,
  IconStar,
  TaxonIcon,
} from "@/components/icons/AppIcons";

export default function CodexShowcaseSection() {
  const [selectedTaxon, setSelectedTaxon] = useState<TaxonCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = SPECIES.filter((sp) => {
    const matchesTaxon = selectedTaxon === "All" || sp.taxon === selectedTaxon;
    const matchesSearch = sp.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTaxon && matchesSearch;
  });

  return (
    <section id="codex" className="relative py-16 sm:py-24 bg-paper2/50 border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconCodex size={14} className="text-leaf" />
            <span>European Wildlife Encyclopedia</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Track 35 Curated European Species
          </h2>
          <p className="text-sm font-semibold text-inksoft sm:text-base">
            From the urban Grey Squirrel to the elusive Kingfisher and Fire Salamander. Every entry features
            rock-paper-scissors taxon combat dynamics, conservation status, and habitat notes.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Taxon Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedTaxon("All")}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                selectedTaxon === "All"
                  ? "bg-ink text-white shadow-xs"
                  : "bg-white/80 text-ink hover:bg-white border border-ink/15"
              }`}
            >
              All (35)
            </button>
            {TAXA.map((t) => {
              const count = SPECIES.filter((s) => s.taxon === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTaxon(t)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
                    selectedTaxon === t
                      ? "bg-ink text-white shadow-xs"
                      : "bg-white/80 text-ink hover:bg-white border border-ink/15"
                  }`}
                >
                  <TaxonIcon taxon={t} size={12} />
                  <span>{t} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search species name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-ink/20 bg-white/80 px-3.5 py-1.5 text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Species Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {filtered.map((sp) => (
            <div
              key={sp.label}
              className="doodle p-3 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-leaf/10 text-leaf">
                    <TaxonIcon taxon={sp.taxon} size={18} />
                  </span>
                  {sp.sensitive && (
                    <span
                      className="rounded-full bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-[8px] font-black text-rose-700 inline-flex items-center gap-0.5"
                      title="Protected Species (GPS fuzzed to 5km)"
                    >
                      <IconShield size={9} />
                      <span>Protected</span>
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-xs font-black text-ink leading-tight">{sp.label}</h3>
                <p className="text-[10px] text-inksoft mt-0.5">{sp.taxon}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-ink/10 flex items-center justify-between text-[9px] font-bold text-inksoft">
                <span>Rarity</span>
                <span className="inline-flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar
                      key={i}
                      size={9}
                      className={i < sp.commonness ? "fill-amber-400 text-amber-500" : "text-ink/20"}
                    />
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm font-bold text-inksoft">
            No species matched your search query. Try &quot;Fox&quot;, &quot;Owl&quot;, or &quot;Frog&quot;.
          </div>
        )}

        {/* Deep link CTA */}
        <div className="mt-10 text-center">
          <Link href="/codex" className="btn btn-leaf px-6 py-2.5 text-xs font-black inline-flex items-center gap-1.5">
            <IconCodex size={14} />
            <span>Open Full Interactive In-App Codex →</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
