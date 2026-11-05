"use client";

import Link from "next/link";
import { useState } from "react";
import { RARITY_META, TAXON_META } from "@/lib/game-data";
import type { CardRow } from "@/lib/types";

export function TierBadge({ tier, small }: { tier: keyof typeof RARITY_META; small?: boolean }) {
  const meta = RARITY_META[tier];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-ink font-black text-white ${
        small ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"
      }`}
      style={{ background: meta.color, boxShadow: `0 0 10px ${meta.glow}` }}
    >
      {meta.name}
    </span>
  );
}

export function CardTile({ card }: { card: CardRow }) {
  const meta = RARITY_META[card.rarityTier];
  return (
    <Link
      href={`/card?id=${card.id}`}
      className="doodle relative block overflow-hidden p-1.5 transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: `3px 3px 0 #2c2823, 0 0 14px ${meta.glow}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.photoUrl}
        alt={card.generatedName}
        loading="lazy"
        decoding="async"
        className="h-24 w-full rounded-lg object-cover"
      />
      <div className="mt-1 px-0.5">
        <p className="truncate text-[11px] font-black leading-tight">{card.generatedName}</p>
        <p className="text-[9px] text-inksoft truncate">
          {TAXON_META[card.taxonCategory].emoji} {card.typeLabel} · #{card.serialNumber}
        </p>
      </div>
      <span
        className="absolute right-2 top-2 rounded-full border border-ink px-1.5 py-0.5 text-[8px] font-black text-white shadow-xs backdrop-blur-xs max-w-[80%] truncate"
        style={{ background: meta.color }}
      >
        {meta.name}
      </span>
    </Link>
  );
}

export function CardFull({ card, startFlipped = false }: { card: CardRow; startFlipped?: boolean }) {
  const [flipped, setFlipped] = useState(startFlipped);
  const meta = RARITY_META[card.rarityTier];
  const taxon = TAXON_META[card.taxonCategory];

  return (
    <div className="[perspective:1200px]">
      <button
        onClick={() => setFlipped((f) => !f)}
        className={`card-flip relative block h-[420px] w-full cursor-pointer select-none ${flipped ? "flipped" : ""}`}
        aria-label="Flip card"
      >
        <div
          className={`card-face doodle absolute inset-0 flex flex-col gap-2 p-3 ${
            card.rarityTier === "tier5" ? "golden" : ""
          }`}
          style={{ boxShadow: `4px 4px 0 #2c2823, 0 0 24px ${meta.glow}` }}
        >
          <div className="flex items-center justify-between">
            <TierBadge tier={card.rarityTier} small />
            <span className="text-[10px] font-black text-inksoft">#{String(card.serialNumber).padStart(5, "0")}</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.photoUrl}
            alt={card.generatedName}
            decoding="async"
            className="h-52 w-full rounded-xl border-2 border-ink object-cover"
          />
          <h2 className="text-left text-xl font-black leading-tight truncate">{card.generatedName}</h2>
          <p className="text-left text-[11px] text-inksoft -mt-1 truncate">
            {taxon.emoji} {card.taxonCategory} · {card.typeLabel}
            {card.speciesLabel ? ` · ${card.speciesLabel}` : ""}
          </p>
          <div className="mt-auto grid grid-cols-3 gap-1.5 text-center">
            <Stat label="Snack" value={card.statA} />
            <Stat label="Charm" value={card.statB} />
            <Stat label={card.statCLabel ?? taxon.statCLabel} value={card.statC ?? 0} />
          </div>
          <p className="text-[9px] text-inksoft text-center mt-1">tap to flip ↺</p>
        </div>

        <div
          className="card-face card-back doodle absolute inset-0 flex flex-col gap-3 p-4 text-left"
          style={{ background: "#fffdf6", boxShadow: `4px 4px 0 #2c2823, 0 0 24px ${meta.glow}` }}
        >
          <h3 className="text-lg font-black">{card.generatedName}</h3>
          <p className="text-xs text-inksoft">{taxon.blurb}</p>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Abilities</p>
            <ul className="mt-1 space-y-1">
              {card.abilities.map((a) => (
                <li key={a} className="doodle-soft bg-white/70 px-2 py-1 text-xs font-bold flex items-center gap-1.5">
                  <span className="text-accent text-[10px]">✦</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <dl className="mt-auto grid grid-cols-2 gap-1 text-[11px]">
            <Row k="Series" v={meta.name} />
            <Row k="Serial" v={`#${card.serialNumber}`} />
            <Row k="Class" v={card.taxonCategory} />
            <Row k="Type" v={card.typeLabel} />
            <Row k="Species" v={card.speciesLabel ?? "Unidentified"} />
            <Row k="Logged" v={new Date(card.createdAt).toLocaleDateString()} />
          </dl>
          <p className="text-[9px] text-inksoft">
            Advantage in PvP against {TAXON_META[card.taxonCategory].advantage}s.
          </p>
          <p className="text-[9px] text-inksoft text-center mt-0.5">tap to flip back ↻</p>
        </div>
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="doodle-soft bg-white/70 px-1 py-1 flex flex-col items-center justify-center">
      <p className="text-[9px] font-black uppercase tracking-wider text-inksoft">{label}</p>
      <p className="text-lg font-black leading-none mt-0.5">{value}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[9px] font-black uppercase tracking-wider text-inksoft">{k}</dt>
      <dd className="font-bold">{v}</dd>
    </div>
  );
}
