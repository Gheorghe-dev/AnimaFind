"use client";

import Link from "next/link";
import { useState, useRef, type MouseEvent } from "react";
import { RARITY_META, TAXON_META } from "@/lib/game-data";
import { playCardFlipSound, triggerHaptic } from "@/lib/audio";
import { SpecimenArtwork } from "@/lib/specimen-art";
import {
  TaxonIcon,
  IconSparkles,
  IconLeaf,
  IconStar,
  IconFlame,
  IconLayers,
  IconShield,
} from "@/components/icons/AppIcons";
import type { CardRow } from "@/lib/types";

export function TierBadge({ tier, small }: { tier: keyof typeof RARITY_META; small?: boolean }) {
  const meta = RARITY_META[tier];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 border-ink font-black text-white shadow-xs ${
        small ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]"
      }`}
      style={{ background: meta.color, boxShadow: `0 0 12px ${meta.glow}` }}
    >
      {tier === "tier5" && <IconStar size={small ? 10 : 12} className="fill-amber-300 text-amber-200" />}
      {tier === "tier4" && <IconFlame size={small ? 10 : 12} className="text-orange-200" />}
      {tier === "tier3" && <IconSparkles size={small ? 10 : 12} className="text-purple-200" />}
      {tier === "tier2" && <IconLeaf size={small ? 10 : 12} className="text-sky-200" />}
      {tier === "tier1" && <IconLeaf size={small ? 10 : 12} className="text-emerald-100" />}
      <span>{meta.name}</span>
    </span>
  );
}

export function CardTile({ card }: { card: CardRow }) {
  const meta = RARITY_META[card.rarityTier];
  const isEmojiPhoto = !card.photoUrl || card.photoUrl.includes("font-size") || card.photoUrl.includes("%F0%9F");

  return (
    <Link
      href={`/card?id=${card.id}`}
      className="doodle group relative block overflow-hidden p-1.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: `3px 3px 0 #2c2823, 0 0 16px ${meta.glow}` }}
    >
      {/* Visual Photo or Zoological Specimen Artwork */}
      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-stone-900 border border-ink/30">
        {isEmojiPhoto ? (
          <SpecimenArtwork
            taxon={card.taxonCategory}
            species={card.speciesLabel}
            tier={card.rarityTier}
            className="h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.photoUrl}
            alt={card.generatedName}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        {/* Tier 5 Celestial Shimmer Overlay */}
        {card.rarityTier === "tier5" && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-transparent to-yellow-200/30 mix-blend-overlay" />
        )}
      </div>

      <div className="mt-1.5 px-0.5">
        <p className="truncate text-[11px] font-black leading-tight text-ink group-hover:text-accent">
          {card.generatedName}
        </p>
        <p className="text-[9px] text-inksoft truncate flex items-center gap-1 mt-0.5">
          <TaxonIcon taxon={card.taxonCategory} size={11} className="shrink-0 text-leaf" />
          <span>{card.typeLabel}</span>
          <span>·</span>
          <span>#{String(card.serialNumber).padStart(4, "0")}</span>
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
  const [showSpecimenPlate, setShowSpecimenPlate] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const meta = RARITY_META[card.rarityTier];
  const taxon = TAXON_META[card.taxonCategory];
  const isEmojiPhoto = !card.photoUrl || card.photoUrl.includes("font-size") || card.photoUrl.includes("%F0%9F");

  // Dynamic 3D tilt tracking for holographic effect
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -9;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 9;
    setTilt({ rx, ry, glareX: px, glareY: py });
  }

  function handleMouseLeave() {
    setTilt({ rx: 0, ry: 0, glareX: 50, glareY: 50 });
  }

  function handleFlip() {
    playCardFlipSound();
    triggerHaptic("light");
    setFlipped((f) => !f);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="[perspective:1200px] transition-transform duration-100 ease-out"
      style={{
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      <div
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleFlip();
        }}
        className={`card-flip relative block h-[450px] w-full cursor-pointer select-none ${flipped ? "flipped" : ""}`}
        aria-label={`Flip card ${card.generatedName}`}
      >
        {/* CARD FRONT FACE */}
        <div
          className={`card-face doodle absolute inset-0 flex flex-col gap-2 p-3.5 transition-shadow ${
            card.rarityTier === "tier5" ? "golden" : ""
          }`}
          style={{
            boxShadow: `5px 5px 0 #2c2823, 0 0 28px ${meta.glow}`,
          }}
        >
          {/* Holographic Iridescent Sheen for Rare Cards */}
          {(card.rarityTier === "tier5" || card.rarityTier === "tier4" || card.rarityTier === "tier3") && (
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-25 mix-blend-color-dodge transition-opacity"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.85) 0%, rgba(244,114,182,0.4) 35%, rgba(56,189,248,0.4) 70%, transparent 100%)`,
              }}
            />
          )}

          {/* Header Metadata */}
          <div className="flex items-center justify-between z-10">
            <TierBadge tier={card.rarityTier} />
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-ink/5 border border-ink/20 px-2 py-0.5 text-[10px] font-black text-inksoft">
                #{String(card.serialNumber).padStart(5, "0")}
              </span>
              {/* Specimen View Mode Toggle Button */}
              {!isEmojiPhoto && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpecimenPlate((p) => !p);
                    triggerHaptic("light");
                  }}
                  className="rounded-full bg-white/90 border border-ink/30 px-2 py-0.5 text-[9px] font-black text-ink hover:bg-white flex items-center gap-1 shadow-xs"
                  title="Toggle Field Photo vs Zoological Plate"
                >
                  <IconLayers size={11} className="text-leaf" />
                  <span>{showSpecimenPlate ? "Photo" : "Plate"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Card Visual Artwork Plate */}
          <div className="relative h-56 w-full overflow-hidden rounded-xl border-2 border-ink shadow-inner bg-stone-900">
            {isEmojiPhoto || showSpecimenPlate ? (
              <SpecimenArtwork
                taxon={card.taxonCategory}
                species={card.speciesLabel}
                tier={card.rarityTier}
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={card.photoUrl}
                alt={card.generatedName}
                decoding="async"
                className="h-full w-full object-cover"
              />
            )}

            {/* In-Frame Species Badge */}
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-xs border border-white/20">
              <TaxonIcon taxon={card.taxonCategory} size={12} className="text-leaf shrink-0" />
              <span className="truncate max-w-[160px]">{card.speciesLabel ?? card.taxonCategory}</span>
            </div>
          </div>

          {/* Creature Title & Subtitle */}
          <div className="text-left">
            <h2 className="text-xl font-black leading-tight truncate text-ink">{card.generatedName}</h2>
            <p className="text-[11px] text-inksoft truncate flex items-center gap-1.5 mt-0.5">
              <TaxonIcon taxon={card.taxonCategory} size={13} className="shrink-0 text-leaf" />
              <span>
                {card.taxonCategory} · {card.typeLabel}
              </span>
              {card.speciesLabel && (
                <>
                  <span>·</span>
                  <span className="font-semibold">{card.speciesLabel}</span>
                </>
              )}
            </p>
          </div>

          {/* Tactical Stat Visual Bars */}
          <div className="mt-auto grid grid-cols-3 gap-1.5 text-center">
            <StatBar label="Snack" value={card.statA} color="bg-amber-500" />
            <StatBar label="Charm" value={card.statB} color="bg-rose-500" />
            <StatBar
              label={card.statCLabel ?? taxon.statCLabel}
              value={card.statC ?? 0}
              color="bg-leaf"
            />
          </div>

          <p className="text-[9px] text-inksoft text-center mt-1 flex items-center justify-center gap-1 font-semibold">
            <span>tap card to flip</span>
            <span className="text-xs">↺</span>
          </p>
        </div>

        {/* CARD BACK FACE */}
        <div
          className="card-face card-back doodle absolute inset-0 flex flex-col gap-3 p-4 text-left"
          style={{ background: "#fffdf6", boxShadow: `5px 5px 0 #2c2823, 0 0 28px ${meta.glow}` }}
        >
          <div className="flex items-center justify-between border-b border-ink/10 pb-2">
            <div>
              <h3 className="text-lg font-black text-ink">{card.generatedName}</h3>
              <p className="text-xs text-inksoft">{taxon.blurb}</p>
            </div>
            <TierBadge tier={card.rarityTier} small />
          </div>

          {/* Abilities */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Combat Abilities</p>
            <ul className="mt-1 space-y-1">
              {card.abilities.map((a) => (
                <li
                  key={a}
                  className="doodle-soft bg-white/80 px-2.5 py-1 text-xs font-bold flex items-center gap-2 shadow-2xs"
                >
                  <IconSparkles size={12} className="text-accent shrink-0" />
                  <span className="text-ink">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Field Dossier Details */}
          <dl className="mt-auto grid grid-cols-2 gap-1.5 text-[11px] bg-paper2/50 rounded-xl p-2.5 border border-ink/10">
            <Row k="Series" v={meta.name} />
            <Row k="Serial" v={`#${String(card.serialNumber).padStart(5, "0")}`} />
            <Row k="Taxonomic Class" v={card.taxonCategory} />
            <Row k="Specimen Type" v={card.typeLabel} />
            <Row k="Confirmed Species" v={card.speciesLabel ?? "Unidentified"} />
            <Row k="Date Logged" v={new Date(card.createdAt).toLocaleDateString()} />
          </dl>

          <div className="flex items-center justify-between text-[9px] text-inksoft pt-1">
            <span className="flex items-center gap-1 font-bold text-accent">
              <IconShield size={11} />
              <span>Advantage vs {TAXON_META[card.taxonCategory].advantage}s</span>
            </span>
            <span className="font-semibold">tap to flip back ↻</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="doodle-soft bg-white/80 px-1.5 py-1.5 flex flex-col items-center justify-center shadow-2xs">
      <p className="text-[9px] font-black uppercase tracking-wider text-inksoft">{label}</p>
      <p className="text-lg font-black leading-none mt-0.5 text-ink">{value}</p>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(10, (value / 99) * 100))}%` }}
        />
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[9px] font-black uppercase tracking-wider text-inksoft">{k}</dt>
      <dd className="font-bold text-ink truncate">{v}</dd>
    </div>
  );
}
