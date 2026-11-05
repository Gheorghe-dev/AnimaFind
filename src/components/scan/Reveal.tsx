"use client";

import { useEffect, useState } from "react";
import { RARITY_META } from "@/lib/game-data";
import { playCardRevealSound, playClickSound, playCardFlipSound, triggerHaptic } from "@/lib/audio";
import type { CardRow } from "@/lib/types";
import { SpecimenArtwork } from "@/lib/specimen-art";

export default function Reveal({
  card,
  pending,
  onClose,
}: {
  card: CardRow;
  pending: boolean;
  onClose: () => void;
}) {
  const meta = RARITY_META[card.rarityTier];
  const isAurora = card.rarityTier === "tier5";
  const [showSpecimenPlate, setShowSpecimenPlate] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastText, setToastText] = useState("Specimen safely entered into Field Codex!");

  useEffect(() => {
    playCardRevealSound(isAurora);
    triggerHaptic(isAurora ? "heavy" : "success");
  }, [isAurora]);

  function handleAddToAlbum() {
    playClickSound();
    triggerHaptic("medium");
    setToastText("Specimen safely entered into Field Codex!");
    setToastVisible(true);
    setTimeout(() => {
      onClose();
    }, 900);
  }

  async function handleShare() {
    playClickSound();
    const url = typeof window !== "undefined" ? `${window.location.origin}/card?id=${card.id}` : "";
    const text = `I logged ${card.generatedName} (${meta.name} ${card.taxonCategory}) in AnimaFind!`;

    if (navigator.share) {
      await navigator.share({ title: card.generatedName, text, url }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setToastText("Card details copied to clipboard!");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    }
  }

  function togglePlate() {
    playCardFlipSound();
    triggerHaptic("light");
    setShowSpecimenPlate((p) => !p);
  }

  const serialStr = String(card.serialNumber).padStart(4, "0");
  const vigorStat = card.statA ?? 88;
  const cunningStat = card.statB ?? 94;

  return (
    <div className="fixed inset-0 z-50 bg-primary/80 backdrop-blur-md flex flex-col items-center justify-center px-margin-mobile transition-opacity duration-300">
      {/* Dismiss / Close Mini Tag */}
      <div className="w-full max-w-[340px] flex justify-end mb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="bg-surface-container-highest text-primary rounded-full w-8 h-8 flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* THE TIER 5 AURORA LEGENDARY SPECIMEN CARD */}
      <div className="w-full max-w-[340px] rounded-2xl bg-surface-container-lowest p-3 shadow-2xl relative overflow-hidden flex flex-col border border-primary/20">
        {/* Prismatic Holographic Sheen Layer */}
        <div className="absolute inset-0 bg-gradient-to-tr from-tertiary-fixed/30 via-secondary-fixed/30 to-tertiary-fixed-dim/30 pointer-events-none mix-blend-color-dodge" />
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-tertiary-fixed-dim/40 via-secondary-fixed/40 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Card Outer Header: Specimen Ledger Serial & Rarity Badge */}
        <div className="relative z-10 flex items-center justify-between pb-2">
          <div className="flex flex-col">
            <span className="font-label-sm text-[10px] text-on-surface-variant font-bold tracking-wider uppercase">
              ARCHIVE CODEX
            </span>
            <span className="font-label-md text-label-md text-primary font-bold">
              #{serialStr} • {card.typeLabel || "Forest Park"}
            </span>
          </div>
          <div className="bg-gradient-to-r from-tertiary-container to-tertiary text-on-tertiary px-space-xs py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[13px] text-tertiary-fixed animate-spin"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span className="font-label-sm text-label-sm font-bold tracking-wide uppercase">
              {meta.name} {card.rarityTier === "tier5" ? "V" : ""}
            </span>
          </div>
        </div>

        {/* Card Specimen Portrait Window with Brass Eyelet aesthetic */}
        <div className="relative z-10 w-full h-44 rounded-xl overflow-hidden shadow-inner bg-surface-container-high flex flex-col justify-end">
          {showSpecimenPlate || !card.photoUrl || card.photoUrl.includes("font-size") ? (
            <SpecimenArtwork
              taxon={card.taxonCategory}
              species={card.speciesLabel}
              tier={card.rarityTier}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.photoUrl}
              alt={card.generatedName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Holographic diagonal light slash */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-surface-container-lowest/25 to-transparent pointer-events-none" />

          {/* View Toggle Pill */}
          <button
            type="button"
            onClick={togglePlate}
            className="absolute top-2 left-2 z-20 bg-primary/75 hover:bg-primary text-white font-label-sm text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[11px]">layers</span>
            <span>{showSpecimenPlate ? "Photo" : "Plate"}</span>
          </button>

          {/* In-card Floating Catch Tag */}
          <div className="relative z-10 m-2 bg-surface/90 backdrop-blur px-space-xs py-1 rounded-lg flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold leading-none">
                {card.speciesLabel || card.generatedName}
              </h3>
              <span className="font-label-sm text-[9px] text-secondary font-bold uppercase">
                {card.generatedName} • Prime Moraine
              </span>
            </div>
            <span className="font-specimen-numeral text-[16px] text-tertiary-container font-bold">
              ★ 99.8%
            </span>
          </div>
        </div>

        {/* Procedural Biometric Stats Grid */}
        <div className="relative z-10 mt-3 grid grid-cols-2 gap-space-xs">
          {/* Vigor Stat Bar */}
          <div className="bg-surface-container p-space-xs rounded-lg flex flex-col gap-1 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Vigor</span>
              <span className="font-label-md text-label-md font-bold text-primary">
                {vigorStat}
                <span className="text-outline font-normal text-[10px]">/100</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(100, vigorStat)}%` }} />
            </div>
          </div>

          {/* Cunning Stat Bar */}
          <div className="bg-surface-container p-space-xs rounded-lg flex flex-col gap-1 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Cunning</span>
              <span className="font-label-md text-label-md font-bold text-primary">
                {cunningStat}
                <span className="text-outline font-normal text-[10px]">/100</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-tertiary-container rounded-full" style={{ width: `${Math.min(100, cunningStat)}%` }} />
            </div>
          </div>
        </div>

        {/* Ability & Trait Stamped Tag */}
        <div className="relative z-10 mt-2 bg-surface-container-low p-2 rounded-lg flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              nightlight
            </span>
            <span className="font-label-sm text-label-sm font-bold uppercase">
              {card.abilities?.[0] || "Twilight Stalker (Passive)"}
            </span>
          </div>
          <p className="font-body-sm text-[11px] leading-tight text-on-surface-variant">
            {card.abilities?.[1] ||
              "Nocturnal Camouflage: Grants +18 Territorial Instinct when tracking dusk-phase fauna."}
          </p>
        </div>

        {/* Sensitive species protection notice */}
        {pending && (
          <div className="relative z-10 mt-2 bg-tertiary-fixed p-1.5 rounded-lg text-[10px] text-tertiary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Sensitive species protected: exact habitat fuzzed to 5 km.</span>
          </div>
        )}

        {/* Discovery Seal Stamp */}
        <div className="relative z-10 mt-2 flex items-center justify-between text-outline font-label-sm text-[9px] pt-1">
          <span>COLLECTOR EDITION: 1ST MINT</span>
          <span className="text-secondary font-bold">VERIFIED SPECIMEN ✓</span>
        </div>

        {/* Dual Action Buttons */}
        <div className="relative z-10 mt-3 grid grid-cols-2 gap-space-xs">
          <button
            type="button"
            onClick={handleAddToAlbum}
            className="bg-secondary text-on-secondary font-label-sm text-label-sm font-bold py-2.5 px-space-xs rounded-xl shadow-md active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Add to Album</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="bg-primary text-on-primary font-label-sm text-label-sm font-bold py-2.5 px-space-xs rounded-xl shadow-md active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>Share PNG</span>
          </button>
        </div>
      </div>

      {/* FLOATING EXPEDITION NOTIFICATION BANNER */}
      <div
        className={`fixed bottom-6 inset-x-6 z-50 bg-primary text-on-primary rounded-xl px-space-md py-2.5 shadow-xl flex items-center justify-between transition-all duration-300 ${
          toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-secondary-fixed text-[20px]">verified</span>
          <span className="font-label-md text-label-md">{toastText}</span>
        </div>
      </div>
    </div>
  );
}
