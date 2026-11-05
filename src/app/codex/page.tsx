"use client";

import { useEffect, useState } from "react";
import { TAXON_META, type TaxonCategory } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";

type Category = {
  taxon: TaxonCategory;
  total: number;
  found: number;
  species: { label: string; commonness: number; sensitive: boolean; found: boolean }[];
};

export default function CodexPage() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

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

  if (!categories) return <p className="p-8 text-center font-bold text-inksoft">Dusting off the encyclopedia…</p>;

  const total = categories.reduce((a, c) => a + c.total, 0);
  const found = categories.reduce((a, c) => a + c.found, 0);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-black">Encyclopedia</h1>
      <p className="text-[11px] text-inksoft">
        {found}/{total} species identified in your area. Species marked 🛡️ are protected — log them, but their
        locations are never published precisely.
      </p>

      {categories.map((c) => (
        <div key={c.taxon} className="doodle p-3">
          <button className="flex w-full items-center gap-3 p-0.5 text-left group" onClick={() => setOpen(open === c.taxon ? null : c.taxon)}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80 border border-ink/20 text-2xl shadow-xs group-hover:scale-105 transition-transform">
              {TAXON_META[c.taxon].emoji}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-black truncate">{c.taxon}</span>
              <span className="block text-[10px] text-inksoft truncate">
                {c.found}/{c.total} identified · {TAXON_META[c.taxon].blurb}
              </span>
            </span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/30 bg-white/80 text-xs font-black shadow-xs">
              {open === c.taxon ? "−" : "+"}
            </span>
          </button>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-ink/40 bg-white">
            <div className="h-full bg-leaf" style={{ width: `${(c.found / Math.max(1, c.total)) * 100}%` }} />
          </div>
          {open === c.taxon && (
            <ul className="mt-2 space-y-1">
              {c.species.map((s) => (
                <li
                  key={s.label}
                  className={`flex items-center justify-between text-[11px] ${
                    s.found ? "font-black" : "text-inksoft"
                  }`}
                >
                  <span>
                    {s.found ? "✔︎" : "▢"} {s.label} {s.sensitive ? "🛡️" : ""}
                  </span>
                  <span>{"★".repeat(s.commonness)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
