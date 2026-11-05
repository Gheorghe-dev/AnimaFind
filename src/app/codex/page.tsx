"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { TAXON_META, SPECIES, type TaxonCategory } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import { SpecimenArtwork } from "@/lib/specimen-art";
import { playClickSound, playAnimalCallSound, triggerHaptic } from "@/lib/audio";

type SpeciesItem = {
  label: string;
  commonness: number;
  sensitive: boolean;
  found: boolean;
};

type Category = {
  taxon: TaxonCategory;
  total: number;
  found: number;
  species: SpeciesItem[];
};

export default function CodexPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [selectedTaxon, setSelectedTaxon] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [playingAudio, setPlayingAudio] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<{
    label: string;
    latin: string;
    order: string;
    habitat: string;
    traits: string;
    encounters: number;
    sensitive: boolean;
    taxon: TaxonCategory;
  }>({
    label: "Common Raven",
    latin: "Corvus corax (Linnaeus, 1758)",
    order: "Aves · Corvidae",
    habitat: "Temperate conifer forests & coastal cliffs",
    traits: "Heavy chisel bill, diamond wedge-shaped tail, resonant croaking 'prruk-prruk' call.",
    encounters: 4,
    sensitive: false,
    taxon: "Bird",
  });

  useEffect(() => {
    let active = true;
    void gameApi
      .getEncyclopedia()
      .then((d) => {
        if (active) setCategories(d.categories as Category[]);
      })
      .catch((err) => {
        console.error("[CodexPage] Failed to load encyclopedia:", err);
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const total = categories ? categories.reduce((a, c) => a + c.total, 0) : 35;
  const found = categories ? categories.reduce((a, c) => a + c.found, 0) : 14;
  const pct = Math.min(100, Math.round((found / Math.max(1, total)) * 100));

  function handleAudioCall() {
    playClickSound();
    triggerHaptic("medium");
    setPlayingAudio(true);
    playAnimalCallSound(selectedSpecies.label);
    setTimeout(() => {
      setPlayingAudio(false);
    }, 2400);
  }

  function handleSelectSpecies(taxon: TaxonCategory, item: SpeciesItem) {
    playClickSound();
    triggerHaptic("light");

    const latin =
      taxon === "Mammal"
        ? item.label === "Fox"
          ? "Vulpes vulpes"
          : item.label === "Badger"
          ? "Meles meles"
          : `${item.label} sylvaticus`
        : taxon === "Bird"
        ? item.label === "Raven"
          ? "Corvus corax"
          : item.label === "Owl"
          ? "Tyto alba"
          : `${item.label} communis`
        : `${item.label} europaeus`;

    setSelectedSpecies({
      label: item.label,
      latin: `${latin} (Linnaeus)`,
      order: `${taxon} · ${TAXON_META[taxon].blurb}`,
      habitat: item.sensitive ? "Old-growth moss reserves & alpine crags" : "Hedgerows, woodlands & meadows",
      traits: item.sensitive
        ? "Rare diurnal specimen. High camouflage, alert sensor reflexes."
        : "Curious nature, active foraging behavior, leaves distinct paw/wing casts.",
      encounters: item.found ? 3 : 0,
      sensitive: item.sensitive,
      taxon,
    });
  }

  // Filter species list
  const filteredSpecies = useMemo(() => {
    return SPECIES.filter((s) => {
      const matchTaxon = selectedTaxon === "all" || s.taxon.toLowerCase() === selectedTaxon.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchSearch = !q || s.label.toLowerCase().includes(q) || s.taxon.toLowerCase().includes(q);
      return matchTaxon && matchSearch;
    });
  }, [selectedTaxon, search]);

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-space-lg gap-space-md">
      {/* Folio Header & Search Ledger */}
      <div className="flex flex-col gap-space-xs mt-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-2xs">
            <span
              className="material-symbols-outlined text-secondary text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              menu_book
            </span>
            <span className="font-label-md text-label-md text-secondary tracking-widest uppercase">
              Field Compendium · Vol. IV
            </span>
          </div>
          <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-full shadow-sm">
            Updated 2h ago
          </span>
        </div>

        {/* Search in Vintage Scored Groove */}
        <div className="relative flex items-center bg-surface-container-high rounded-xl px-space-sm py-2 shadow-[inset_0_2px_4px_rgba(43,58,44,0.08)]">
          <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Latin genus, vernacular name, habitat..."
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline placeholder:italic focus:outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-on-surface-variant hover:text-primary mr-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          ) : null}
          <button
            type="button"
            className="bg-surface-container px-2 py-1 rounded-lg text-primary text-label-sm font-label-sm shadow-sm active:translate-y-0.5 transition-transform flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">tune</span> Filter
          </button>
        </div>
      </div>

      {/* Overall Codex Completion Gauge Slate */}
      <section className="relative bg-surface-container-low rounded-xl p-space-md shadow-sm overflow-hidden flex flex-col gap-space-sm">
        {/* Faint aesthetic watermarked leaf outline */}
        <svg
          className="absolute -right-6 -bottom-6 w-36 h-36 text-surface-variant opacity-40 pointer-events-none"
          fill="currentColor"
          viewBox="0 0 100 100"
        >
          <path d="M50 0 C70 30 90 50 90 80 C90 95 75 100 50 100 C25 100 10 95 10 80 C10 50 30 30 50 0 Z M50 15 C45 35 48 75 50 95 C52 75 55 35 50 15 Z" />
        </svg>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
              Bio-Survey Ledger
            </span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
              Regional Biodiversity
            </h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-specimen-numeral text-specimen-numeral text-secondary font-bold">
              {pct}%
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">Archived</span>
          </div>
        </div>

        {/* Gauge Metric Meter Bar */}
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="w-full h-3 bg-surface-variant rounded-full overflow-hidden p-0.5 shadow-[inset_0_1px_3px_rgba(43,58,44,0.12)]">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-label-md text-label-md text-primary font-bold">
              {found} of {total} Species Logged
            </span>
            <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-bold">
              {Math.max(0, total - found)} Undiscovered
            </span>
          </div>
        </div>

        {/* Quick stats strip */}
        <div className="grid grid-cols-3 gap-2 pt-1 relative z-10">
          <div className="bg-surface-container rounded-lg p-2 text-center shadow-xs">
            <span className="block font-specimen-numeral text-specimen-numeral text-primary font-bold">14</span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">Apex Sightings</span>
          </div>
          <div className="bg-surface-container rounded-lg p-2 text-center shadow-xs">
            <span className="block font-specimen-numeral text-specimen-numeral text-primary font-bold">7</span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">Rare Calls</span>
          </div>
          <div className="bg-surface-container rounded-lg p-2 text-center shadow-xs">
            <div className="flex items-center justify-center gap-0.5">
              <span className="block font-specimen-numeral text-specimen-numeral text-secondary font-bold">98</span>
              <span className="font-label-sm text-label-sm text-secondary font-bold">%</span>
            </div>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">ID Accuracy</span>
          </div>
        </div>
      </section>

      {/* Taxa Progress 2x2 Bento Cards */}
      <section className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">category</span>
            Taxa Progress
          </h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Tap to filter</span>
        </div>

        <div className="grid grid-cols-2 gap-space-xs">
          {/* Avian / Birds */}
          <button
            type="button"
            onClick={() => setSelectedTaxon((t) => (t === "Bird" ? "all" : "Bird"))}
            className={`bg-surface-container rounded-xl p-space-sm shadow-xs flex flex-col justify-between gap-space-xs text-left transition-transform active:scale-[0.98] ${
              selectedTaxon === "Bird" ? "ring-2 ring-secondary" : ""
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl p-1 bg-surface-container-high rounded-lg shadow-inner">🦅</span>
              <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-bold">
                80%
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-primary text-base font-bold leading-tight">
                Avian / Birds
              </h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant">12 of 15 Discovered</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: "80%" }} />
            </div>
          </button>

          {/* Mammalia */}
          <button
            type="button"
            onClick={() => setSelectedTaxon((t) => (t === "Mammal" ? "all" : "Mammal"))}
            className={`bg-surface-container rounded-xl p-space-sm shadow-xs flex flex-col justify-between gap-space-xs text-left transition-transform active:scale-[0.98] ${
              selectedTaxon === "Mammal" ? "ring-2 ring-secondary" : ""
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl p-1 bg-surface-container-high rounded-lg shadow-inner">🦊</span>
              <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded-full font-bold">
                75%
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-primary text-base font-bold leading-tight">
                Mammalia
              </h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant">9 of 12 Discovered</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: "75%" }} />
            </div>
          </button>

          {/* Insecta & Arachnida */}
          <button
            type="button"
            onClick={() => setSelectedTaxon((t) => (t === "Insect" ? "all" : "Insect"))}
            className={`bg-surface-container rounded-xl p-space-sm shadow-xs flex flex-col justify-between gap-space-xs text-left transition-transform active:scale-[0.98] ${
              selectedTaxon === "Insect" ? "ring-2 ring-secondary" : ""
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl p-1 bg-surface-container-high rounded-lg shadow-inner">🦋</span>
              <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold">
                60%
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-primary text-base font-bold leading-tight">
                Insecta &amp; Arach.
              </h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant">6 of 10 Discovered</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: "60%" }} />
            </div>
          </button>

          {/* Herpetofauna */}
          <button
            type="button"
            onClick={() => setSelectedTaxon((t) => (t === "Reptile" ? "all" : "Reptile"))}
            className={`bg-surface-container rounded-xl p-space-sm shadow-xs flex flex-col justify-between gap-space-xs text-left transition-transform active:scale-[0.98] ${
              selectedTaxon === "Reptile" ? "ring-2 ring-secondary" : ""
            }`}
          >
            <div className="flex items-start justify-between w-full">
              <span className="text-2xl p-1 bg-surface-container-high rounded-lg shadow-inner">🦎</span>
              <span className="font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded-full font-bold">
                38%
              </span>
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md text-primary text-base font-bold leading-tight">
                Herpetofauna
              </h4>
              <span className="font-label-sm text-label-sm text-on-surface-variant">5 of 13 Discovered</span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: "38%" }} />
            </div>
          </button>
        </div>
      </section>

      {/* Featured Specimen Dossier (Parchment Plate Card) */}
      <section className="relative bg-surface-container-low rounded-xl shadow-md p-space-md flex flex-col gap-space-sm overflow-hidden border border-primary/10">
        {/* Top Ledger Tag Ribbon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Plate #042
            </span>
            <span className="bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded">
              Resident Apex
            </span>
          </div>
          <button
            type="button"
            className="text-secondary hover:text-primary transition-colors flex items-center"
            title="Bookmark dossier"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bookmark
            </span>
          </button>
        </div>

        {/* Specimen Visual Framing & Botanical Illustration Window */}
        <div className="relative w-full h-52 rounded-lg overflow-hidden bg-surface-container-high shadow-inner">
          {selectedSpecies.label === "Common Raven" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/stitch/a_striking_common_raven_perche_1647a7a6.png"
              alt="Common Raven"
              className="w-full h-full object-cover"
            />
          ) : (
            <SpecimenArtwork
              taxon={selectedSpecies.taxon}
              species={selectedSpecies.label}
              tier="tier4"
              className="w-full h-full object-cover"
            />
          )}

          {/* Sensitive Protection Status Pill Overlay */}
          <div className="absolute bottom-2 left-2 right-2 bg-surface/90 backdrop-blur-md rounded-lg px-2.5 py-1.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${selectedSpecies.sensitive ? "bg-amber-600" : "bg-secondary"}`} />
              <span className="font-label-sm text-label-sm text-on-surface font-bold">
                {selectedSpecies.sensitive ? "Sensitive (Habitat Protected)" : "Least Concern"}
              </span>
            </div>
            <span className="font-label-sm text-label-sm text-secondary font-bold">
              {selectedSpecies.sensitive ? "Fuzzed to 5 km" : "Safe for Community Pinning"}
            </span>
          </div>
        </div>

        {/* Scientific Taxonomy & Names */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline justify-between">
            <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
              {selectedSpecies.label}
            </h4>
            <span className="font-label-md text-label-md text-secondary">{selectedSpecies.order}</span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant italic">{selectedSpecies.latin}</p>
        </div>

        {/* Diagnostic Traits & Habitats Grid */}
        <div className="grid grid-cols-1 gap-space-xs bg-surface-container rounded-lg p-space-sm shadow-xs">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">forest</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                Habitat Range
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">{selectedSpecies.habitat}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-1 border-t border-outline/10">
            <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">fingerprint</span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                Diagnostic Traits
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">{selectedSpecies.traits}</span>
            </div>
          </div>
        </div>

        {/* Field Sighting History Ledger */}
        <div className="bg-surface-container-high rounded-lg p-space-sm flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-space-xs">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-primary font-bold">
                {selectedSpecies.encounters} Verified Encounters
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Last observed: Cape Lookout Trail
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-specimen-numeral text-specimen-numeral text-primary font-bold">91%</span>
            <span className="font-label-sm text-label-sm text-secondary font-bold">Scan Match</span>
          </div>
        </div>

        {/* Interactive Card Action Buttons */}
        <div className="flex items-center gap-space-xs pt-1">
          <button
            type="button"
            onClick={handleAudioCall}
            className={`flex-1 py-2.5 px-3 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5 transition-all text-on-primary ${
              playingAudio ? "bg-secondary" : "bg-primary hover:bg-primary-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {playingAudio ? "volume_up" : "graphic_eq"}
            </span>
            <span>{playingAudio ? "Playing Call (2.4s)…" : "Listen Audio (2.4s)"}</span>
          </button>
          <Link
            href="/"
            className="bg-surface-container text-primary p-2.5 rounded-xl shadow-xs active:translate-y-0.5 transition-transform flex items-center justify-center hover:bg-surface-container-high"
            title="Scan this creature"
          >
            <span className="material-symbols-outlined text-[20px]">center_focus_weak</span>
          </Link>
          <button
            type="button"
            onClick={() => handleAudioCall()}
            className="bg-surface-container text-primary p-2.5 rounded-xl shadow-xs active:translate-y-0.5 transition-transform flex items-center justify-center hover:bg-surface-container-high"
            title="Field Log Notes"
          >
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
          </button>
        </div>
      </section>

      {/* Specimen Field Observations Gallery Strip */}
      <section className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">photo_library</span>
            Field Log Proofs
          </h3>
          <span className="font-label-sm text-label-sm text-secondary font-bold">4 Snaps</span>
        </div>
        <div className="grid grid-cols-2 gap-space-xs">
          <div className="relative bg-surface-container rounded-xl overflow-hidden shadow-xs h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/stitch/field_notebook_photo_of_raven_82dafcb2.png"
              alt="Feather Cast"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-surface/85 backdrop-blur-xs font-label-sm text-label-sm px-1.5 py-0.5 rounded text-primary">
              Feather Cast
            </span>
          </div>
          <div className="relative bg-surface-container rounded-xl overflow-hidden shadow-xs h-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/stitch/black_raven_in_dynamic_gliding_1fbfef61.png"
              alt="In-Flight Lock"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-surface/85 backdrop-blur-xs font-label-sm text-label-sm px-1.5 py-0.5 rounded text-primary">
              In-Flight Lock
            </span>
          </div>
        </div>
      </section>

      {/* Complete Species Directory */}
      <section className="flex flex-col gap-space-xs mt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline-md text-headline-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary">format_list_bulleted</span>
            Species Index ({filteredSpecies.length})
          </h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Tap entry to inspect</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filteredSpecies.map((sp) => (
            <button
              key={sp.label}
              type="button"
              onClick={() =>
                handleSelectSpecies(sp.taxon, {
                  label: sp.label,
                  commonness: sp.commonness,
                  sensitive: Boolean(sp.sensitive),
                  found: false,
                })
              }
              className={`p-2.5 rounded-xl bg-surface-container flex items-center justify-between shadow-xs hover:bg-surface-container-high transition-colors text-left ${
                selectedSpecies.label === sp.label ? "ring-2 ring-secondary" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high shrink-0">
                  <SpecimenArtwork taxon={sp.taxon} species={sp.label} tier="tier3" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md text-primary font-bold">{sp.label}</span>
                    {sp.sensitive && (
                      <span className="text-[10px] bg-tertiary-fixed text-tertiary px-1 py-0.2 rounded font-bold">
                        Protected
                      </span>
                    )}
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant italic">
                    {sp.taxon} · {TAXON_META[sp.taxon].blurb}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-secondary">
                <span className="font-label-sm text-label-sm font-bold uppercase">Inspect</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Ethical Naturalist Code Banner */}
      <div className="bg-surface-container-high rounded-xl p-space-sm shadow-xs flex items-center gap-3">
        <span className="text-2xl shrink-0">🌿</span>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-primary font-bold">Naturalist Code</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            Keep distance, never bait wildlife, and leave burrows &amp; nesting sites undisturbed.
          </p>
        </div>
      </div>
    </div>
  );
}
