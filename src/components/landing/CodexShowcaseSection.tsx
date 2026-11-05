"use client";

import { useState } from "react";
import Link from "next/link";
import { SPECIES, TAXA, TAXON_META, type TaxonCategory } from "@/lib/game-data";

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
            <span>📖</span>
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
              className={`rounded-full border px-3 py-1.5 text-xs font-black transition-all ${
                selectedTaxon === "All"
                  ? "border-ink bg-ink text-paper shadow-xs"
                  : "border-ink/20 bg-white/70 hover:bg-white text-ink"
              }`}
            >
              All (35)
            </button>
            {TAXA.map((t) => {
              const meta = TAXON_META[t];
              const isActive = selectedTaxon === t;
              const count = SPECIES.filter((s) => s.taxon === t).length;
              return (
                <button
                  key={t}
                  onClick={() => setSelectedTaxon(t)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-black transition-all ${
                    isActive
                      ? "border-ink bg-ink text-paper shadow-xs"
                      : "border-ink/20 bg-white/70 hover:bg-white text-ink"
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{t}</span>
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search e.g. Hedgehog, Falcon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-2 border-ink/20 bg-white/90 px-4 py-1.5 text-xs font-bold text-ink placeholder:text-inksoft/60 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Taxon Advantage Dynamic Banner */}
        {selectedTaxon !== "All" && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-ink/15 bg-white/80 p-3 text-xs font-bold text-ink">
            <span>{TAXON_META[selectedTaxon].emoji} {selectedTaxon}</span>
            <span className="text-inksoft">— &quot;{TAXON_META[selectedTaxon].blurb}&quot;</span>
            <span className="rounded-md bg-accent/10 px-2 py-0.5 text-accent font-black">
              Advantage: vs {TAXON_META[selectedTaxon].advantage}
            </span>
            <span className="text-inksoft">
              Primary Trait: {TAXON_META[selectedTaxon].statCLabel}
            </span>
          </div>
        )}

        {/* Species Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((sp) => {
            const taxonMeta = TAXON_META[sp.taxon];
            return (
              <div
                key={sp.label}
                className="doodle p-3 flex flex-col justify-between transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{taxonMeta.emoji}</span>
                    {sp.sensitive && (
                      <span
                        className="rounded-full bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-[8px] font-black text-rose-700"
                        title="Protected Species (GPS fuzzed to 5km)"
                      >
                        🛡️ Protected
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-xs font-black text-ink leading-tight">{sp.label}</h3>
                  <p className="text-[10px] text-inksoft mt-0.5">{sp.taxon}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-ink/10 flex items-center justify-between text-[9px] font-bold text-inksoft">
                  <span>Rarity</span>
                  <span className="text-accent">
                    {"★".repeat(sp.commonness)}
                    {"☆".repeat(5 - sp.commonness)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm font-bold text-inksoft">
            No species matched your search query. Try &quot;Fox&quot;, &quot;Owl&quot;, or &quot;Frog&quot;.
          </div>
        )}

        {/* Deep link CTA */}
        <div className="mt-10 text-center">
          <Link href="/codex" className="btn btn-leaf px-6 py-2.5 text-xs font-black">
            📖 Open Full Interactive In-App Codex →
          </Link>
        </div>
      </div>
    </section>
  );
}
