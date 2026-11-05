"use client";

import { useCallback, useEffect, useState } from "react";
import { TAXA, TAXON_META } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";

type Option = { id: string; label: string; votes: number; voted: boolean };

export default function PvpPage() {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = (await gameApi.getPvp()) as { options: Option[] };
      setOptions(data.options);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      try {
        const data = (await gameApi.getPvp()) as { options: Option[] };
        if (active) setOptions(data.options);
      } catch (err) {
        console.error("[PvpPage] Failed to load vote options:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadOptions();
    return () => {
      active = false;
    };
  }, []);

  async function vote(option: string) {
    try {
      await gameApi.votePvp(option);
    } catch (err) {
      console.error("[PvpPage] Vote failed:", err);
    }
    await load();
  }

  const totalVotes = options.reduce((a, o) => a + o.votes, 0);

  return (
    <div className="space-y-4">
      <div className="doodle tape p-5 text-center">
        <p className="text-5xl">⚔️</p>
        <h1 className="mt-2 text-2xl font-black">Critter duels — coming soon</h1>
        <p className="mt-1 text-xs text-inksoft">
          Phase 3. Your cards already carry everything a battler needs: two core stats, a class stat, a cosmetic
          type and 1–3 abilities.
        </p>
      </div>

      <div className="doodle p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Planned class matchups</p>
        <ul className="mt-1.5 grid grid-cols-2 gap-1.5 text-[11px] font-bold">
          {TAXA.filter((t) => t !== "Other").map((t) => (
            <li key={t} className="doodle-soft bg-white/70 px-2.5 py-1.5 flex items-center gap-1.5">
              <span className="text-base shrink-0">{TAXON_META[t].emoji}</span>
              <span className="truncate">{t} → beats {TAXON_META[t].advantage}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="doodle p-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">
          Vote on what we build first ({totalVotes} votes)
        </p>
        {loading && <p className="py-4 text-center text-xs font-bold text-inksoft">Loading roadmap options…</p>}
        {!loading && options.length === 0 && (
          <p className="py-3 text-center text-xs text-inksoft">No active voting polls at the moment.</p>
        )}
        <ul className="mt-2 space-y-2">
          {options.map((o) => (
            <li key={o.id}>
              <button
                onClick={() => void vote(o.id)}
                className={`doodle-soft flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-bold transition-colors ${
                  o.voted ? "bg-[#e8f2dd] border-[#7f9c6a]" : "bg-white/70 hover:bg-white"
                }`}
              >
                <span className="flex-1">{o.label}</span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-white/80 px-2 py-0.5 rounded-full border border-ink/20 shrink-0">
                  {o.voted ? "✔︎ " : ""}{o.votes}
                </span>
              </button>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${totalVotes ? (o.votes / totalVotes) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
