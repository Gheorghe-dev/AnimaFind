"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardFull } from "../CardViews";
import { RARITY_META } from "@/lib/game-data";
import type { CardRow } from "@/lib/types";
import { IconSparkles, IconCoin, IconShield, IconShare } from "@/components/icons/AppIcons";

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
  const legendary = card.rarityTier === "tier5";
  const [show, setShow] = useState(!legendary);

  useEffect(() => {
    if (legendary) {
      const id = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(id);
    }
  }, [legendary]);

  async function share() {
    const url = `${window.location.origin}/card?id=${card.id}`;
    const text = `I logged ${card.generatedName} (${meta.name} ${card.taxonCategory}) in Critter Codex!`;
    if (navigator.share) {
      await navigator.share({ title: card.generatedName, text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 py-8 overflow-y-auto">
      {legendary && !show && (
        <div className="relative grid place-items-center">
          <div className="golden grid h-52 w-52 place-items-center rounded-full bg-[#e8b53c] text-white">
            <IconSparkles size={80} />
          </div>
          <p className="mt-4 text-center text-xl font-black text-[#ffe9a8]">AURORA SERIES</p>
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="sparkle absolute text-xs text-[#ffe9a8]"
              style={{
                left: `${15 + ((i * 37) % 70)}%`,
                top: `${20 + ((i * 41) % 60)}%`,
                animationDelay: `${i * 0.16}s`,
              }}
            >
              <IconSparkles size={14} />
            </span>
          ))}
        </div>
      )}

      {show && (
        <div className="w-full max-w-sm space-y-3 my-auto">
          <p className="text-center text-sm font-black text-white flex items-center justify-center gap-1.5">
            <span>{meta.name} series</span>
            <span>·</span>
            <span>+{card.xpAwarded} XP</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-amber-300">
              +{card.coinsAwarded}
              <IconCoin size={14} />
            </span>
          </p>
          <CardFull card={card} />
          {pending && (
            <div className="doodle-soft bg-[#fff4d8] px-3 py-2 text-[11px] text-center flex items-center justify-center gap-1.5 text-amber-900 border border-amber-300">
              <IconShield size={14} className="text-amber-800 shrink-0" />
              <span>
                Protected species flagged — the card is yours, but the sighting is queued for manual review and its
                location will never be shown precisely on the public map.
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button className="btn btn-leaf flex-1" onClick={onClose}>
              Add to album
            </button>
            <Link className="btn flex-1 text-center" href={`/card?id=${card.id}`}>
              Details
            </Link>
            <button
              className="btn h-11 w-11 shrink-0 p-0 text-base"
              onClick={() => void share()}
              title="Share card"
              aria-label="Share card"
            >
              <IconShare size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
