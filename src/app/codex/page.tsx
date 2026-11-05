"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TAXON_META, type TaxonCategory } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import { SpecimenArtwork } from "@/lib/specimen-art";
import { playClickSound, triggerHaptic } from "@/lib/audio";
import {
  IconShield,
  IconCheck,
  IconStar,
  IconCamera,
  IconCross,
  TaxonIcon,
} from "@/components/icons/AppIcons";

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
  const [open, setOpen] = useState<string | null>("Mammal");
  const [activeSpecies, setActiveSpecies] = useState<{ taxon: TaxonCategory; item: SpeciesItem } | null>(null);

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

  if (!categories) {
    return <p className="p-8 text-center font-bold text-inksoft">Dusting off the encyclopedia…</p>;
  }

  const total = categories.reduce((a, c) => a + c.total, 0);
  const found = categories.reduce((a, c) => a + c.found, 0);

  function handleToggle(taxon: string) {
    playClickSound();
    setOpen((prev) => (prev === taxon ? null : taxon));
  }

  function handleInspectSpecies(taxon: TaxonCategory, item: SpeciesItem) {
    playClickSound();
    triggerHaptic("light");
    setActiveSpecies({ taxon, item });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-black text-ink">Encyclopedia</h1>
        <span className="rounded-full bg-leaf/15 border border-leaf/30 px-2.5 py-0.5 text-xs font-black text-leaf">
          {found}/{total} Logged
        </span>
      </div>

      <p className="text-[11px] text-inksoft flex items-center flex-wrap gap-1">
        <span>Curated 35-species European biodiversity catalog. Species marked with</span>
        <IconShield size={12} className="text-amber-700 inline shrink-0" />
        <span>are protected — GPS fuzzing keeps their habitat safe from poachers.</span>
      </p>

      {/* Global Progress Bar */}
      <div className="doodle p-3 space-y-1.5 bg-paper2/50">
        <div className="flex justify-between text-xs font-black text-ink">
          <span>Codex Completion</span>
          <span>{Math.round((found / Math.max(1, total)) * 100)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full border border-ink/40 bg-white">
          <div
            className="h-full bg-leaf transition-all duration-500 rounded-full"
            style={{ width: `${(found / Math.max(1, total)) * 100}%` }}
          />
        </div>
      </div>

      {/* Taxonomic Categories */}
      {categories.map((c) => {
        const isOpen = open === c.taxon;
        const pct = Math.round((c.found / Math.max(1, c.total)) * 100);

        return (
          <div key={c.taxon} className="doodle p-3 transition-shadow hover:shadow-md">
            <button
              className="flex w-full items-center gap-3 p-0.5 text-left group"
              onClick={() => handleToggle(c.taxon)}
              aria-expanded={isOpen}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/90 border border-ink/20 shadow-xs group-hover:scale-105 transition-transform text-leaf">
                <TaxonIcon taxon={c.taxon} size={24} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-black truncate text-ink">{c.taxon}</span>
                <span className="block text-[10px] text-inksoft truncate">
                  {c.found}/{c.total} identified ({pct}%) · {TAXON_META[c.taxon].blurb}
                </span>
              </span>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/30 bg-white/80 text-xs font-black shadow-xs">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full bg-leaf transition-all duration-300 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>

            {isOpen && (
              <ul className="mt-3 space-y-1.5 pt-1 border-t border-ink/10">
                {c.species.map((s) => (
                  <li
                    key={s.label}
                    onClick={() => handleInspectSpecies(c.taxon, s)}
                    className="flex items-center justify-between text-[11px] py-1.5 px-2 rounded-lg cursor-pointer transition-colors hover:bg-black/5"
                  >
                    <span className="inline-flex items-center gap-2">
                      {s.found ? (
                        <span className="grid h-4 w-4 place-items-center rounded-full bg-leaf text-white shadow-2xs">
                          <IconCheck size={10} strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-ink/30" />
                      )}
                      <span className={s.found ? "font-black text-ink" : "text-inksoft font-medium"}>
                        {s.label}
                      </span>
                      {s.sensitive && <IconShield size={12} className="text-amber-700 shrink-0" />}
                    </span>

                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: s.commonness }).map((_, i) => (
                        <IconStar key={i} size={11} className="fill-amber-400 text-amber-500" />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* Species Zoological Plate Inspection Modal */}
      {activeSpecies && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="doodle relative w-full max-w-sm bg-paper p-4 space-y-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveSpecies(null)}
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-ink/30 bg-white/80 text-ink hover:bg-white"
              aria-label="Close modal"
            >
              <IconCross size={14} />
            </button>

            <div className="flex items-center gap-2">
              <TaxonIcon taxon={activeSpecies.taxon} size={20} className="text-leaf" />
              <div>
                <h3 className="text-base font-black text-ink leading-tight">{activeSpecies.item.label}</h3>
                <p className="text-[10px] text-inksoft">
                  {activeSpecies.taxon} · {activeSpecies.item.found ? "Catalogued in Journal" : "Undiscovered"}
                </p>
              </div>
            </div>

            {/* Specimen Artwork Plate */}
            <div className="h-48 w-full overflow-hidden rounded-xl border-2 border-ink bg-stone-900 shadow-inner">
              <SpecimenArtwork
                taxon={activeSpecies.taxon}
                species={activeSpecies.item.label}
                tier={activeSpecies.item.commonness >= 4 ? "tier4" : "tier2"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-1.5 text-xs text-ink">
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-inksoft font-medium">Scarcity Rating:</span>
                <span className="font-bold inline-flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: activeSpecies.item.commonness }).map((_, i) => (
                    <IconStar key={i} size={12} className="fill-amber-400 text-amber-500" />
                  ))}
                  <span className="text-[10px] text-inksoft ml-1">({activeSpecies.item.commonness}/5)</span>
                </span>
              </div>
              <div className="flex justify-between border-b border-ink/10 pb-1">
                <span className="text-inksoft font-medium">Conservation Status:</span>
                <span className="font-bold flex items-center gap-1">
                  {activeSpecies.item.sensitive ? (
                    <>
                      <IconShield size={12} className="text-amber-700" />
                      <span className="text-amber-800">Protected / Confidential</span>
                    </>
                  ) : (
                    <span className="text-emerald-700">Least Concern / Public</span>
                  )}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                href="/"
                onClick={() => setActiveSpecies(null)}
                className="btn btn-accent flex-1 text-center py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <IconCamera size={14} />
                <span>Scan for {activeSpecies.item.label}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
