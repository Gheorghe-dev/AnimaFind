"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconMap,
  IconMapPin,
  IconShield,
  TaxonIcon,
} from "@/components/icons/AppIcons";

type SightingPin = {
  id: string;
  name: string;
  taxon: string;
  finder: string;
  tier: string;
  tierColor: string;
  sensitive: boolean;
  fuzzRadius: string;
  x: number;
  y: number;
};

const SAMPLE_PINS: SightingPin[] = [
  {
    id: "p1",
    name: "Sir Bramble Thunder (Red Fox)",
    taxon: "Mammal",
    finder: "@UrbanNaturalist",
    tier: "Aurora Tier 5",
    tierColor: "#e8b53c",
    sensitive: false,
    fuzzRadius: "~150m standard jitter",
    x: 42,
    y: 38,
  },
  {
    id: "p2",
    name: "Fire Salamander",
    taxon: "Amphibian",
    finder: "@MossyRambler",
    tier: "Twilight Tier 3",
    tierColor: "#8c6bd6",
    sensitive: true,
    fuzzRadius: "~5km privacy cloak (Anti-Poaching)",
    x: 74,
    y: 55,
  },
  {
    id: "p3",
    name: "White Stork",
    taxon: "Bird",
    finder: "@AvianScout",
    tier: "Emberwood Tier 4",
    tierColor: "#e2703a",
    sensitive: true,
    fuzzRadius: "~5km privacy cloak (Nesting Safety)",
    x: 28,
    y: 72,
  },
  {
    id: "p4",
    name: "Seven-Spot Ladybird",
    taxon: "Insect",
    finder: "@GardenBeetle",
    tier: "Meadow Tier 2",
    tierColor: "#4a9ec4",
    sensitive: false,
    fuzzRadius: "~150m standard jitter",
    x: 62,
    y: 28,
  },
];

export default function CommunityMapSection() {
  const [activePin, setActivePin] = useState<SightingPin>(SAMPLE_PINS[0]);

  return (
    <section id="map" className="relative py-16 sm:py-24 overflow-hidden border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconMap size={14} className="text-leaf" />
            <span>Ethical Geolocation Network</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Fuzzed Community Map &amp; 250m Proximity Claiming
          </h2>
          <p className="text-sm font-semibold text-inksoft sm:text-base">
            Discover wildlife logged by other naturalists in your city. Walk within 250 meters of a community pin
            to claim a linked collector card, while strict differential privacy shields nesting grounds.
          </p>
        </div>

        {/* Map Interactive Interface */}
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left: Interactive SVG Radar Map */}
          <div className="lg:col-span-7">
            <div className="doodle relative overflow-hidden bg-[#242b20] p-4 text-white shadow-xl">
              {/* Map Canvas */}
              <div className="relative h-[340px] sm:h-[420px] w-full rounded-2xl overflow-hidden bg-[#1a2117] border border-white/10">
                {/* Topographic Contours SVG Pattern */}
                <svg
                  className="absolute inset-0 h-full w-full opacity-20 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Topo circles */}
                  <circle cx="50%" cy="50%" r="90" fill="none" stroke="#7f9c6a" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="50%" cy="50%" r="160" fill="none" stroke="#7f9c6a" strokeWidth="1" strokeDasharray="4 4" />
                </svg>

                {/* Radar Sweep Animation */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="h-72 w-72 rounded-full border border-leaf/40 animate-ping opacity-25" />
                </div>

                {/* You are here marker */}
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: "50%", top: "50%" }}
                >
                  <div className="relative grid h-7 w-7 place-items-center rounded-full bg-accent text-white shadow-lg border-2 border-white">
                    <IconMapPin size={14} />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                    You (250m Claim Radius)
                  </div>
                </div>

                {/* 250m Radius ring around player */}
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-accent/60 bg-accent/10 pointer-events-none"
                  style={{ left: "50%", top: "50%", width: "160px", height: "160px" }}
                />

                {/* Sighting Pins */}
                {SAMPLE_PINS.map((pin) => {
                  const isSelected = activePin.id === pin.id;
                  return (
                    <button
                      key={pin.id}
                      onClick={() => setActivePin(pin)}
                      className={`absolute z-30 -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125 focus:outline-none ${
                        isSelected ? "scale-125 z-40" : ""
                      }`}
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      aria-label={`Select pin ${pin.name}`}
                    >
                      <div
                        className="grid h-10 w-10 place-items-center rounded-full border-2 border-white shadow-lg transition-all text-white"
                        style={{
                          backgroundColor: pin.tierColor,
                          boxShadow: isSelected ? `0 0 16px ${pin.tierColor}` : "0 2px 8px rgba(0,0,0,0.4)",
                        }}
                      >
                        {pin.sensitive ? <IconShield size={18} /> : <TaxonIcon taxon={pin.taxon} size={18} />}
                      </div>

                      {/* Pin Tooltip */}
                      <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs">
                        {pin.name}
                      </div>
                    </button>
                  );
                })}

                {/* Map Legend Bar */}
                <div className="absolute bottom-3 inset-x-3 flex justify-between items-center text-[10px] font-bold bg-black/70 px-3 py-1.5 rounded-xl backdrop-blur-md">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>250m Active Claim Zone</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span>5km Fuzzed Privacy Shield</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sighting Details & Ethical Rules */}
          <div className="space-y-5 lg:col-span-5">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/5 border border-ink/10 text-leaf">
                    <TaxonIcon taxon={activePin.taxon} size={22} />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-ink">{activePin.name}</h3>
                    <p className="text-[11px] text-inksoft">{activePin.finder}</p>
                  </div>
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-black text-white"
                  style={{ backgroundColor: activePin.tierColor }}
                >
                  {activePin.tier}
                </span>
              </div>

              {/* Pin Data */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between rounded-xl bg-white/70 p-2.5 border border-ink/10">
                  <span className="font-bold text-inksoft">Taxon Class</span>
                  <span className="font-black text-ink">{activePin.taxon}</span>
                </div>
                <div className="flex justify-between rounded-xl bg-white/70 p-2.5 border border-ink/10">
                  <span className="font-bold text-inksoft">Proximity Rule</span>
                  <span className="font-black text-emerald-700">Claimable within 250m</span>
                </div>
                <div className="flex justify-between rounded-xl bg-white/70 p-2.5 border border-ink/10">
                  <span className="font-bold text-inksoft">GPS Protection</span>
                  <span className="font-black text-accent">{activePin.fuzzRadius}</span>
                </div>
              </div>

              {/* Sensitive Species Callout */}
              {activePin.sensitive ? (
                <div className="rounded-2xl border border-purple-300 bg-purple-50/80 p-3 text-xs leading-relaxed text-purple-950 flex items-start gap-2">
                  <IconShield size={16} className="text-purple-800 shrink-0 mt-0.5" />
                  <div>
                    <strong>Endangered Taxa Shield:</strong> This species is protected under European wildlife
                    directives. Its exact GPS coordinate is blurred to a 5-kilometer bounding circle on public
                    maps to protect it from poachers, collectors, or overcrowding.
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-ink/10 bg-white/80 p-3 text-xs leading-relaxed text-inksoft flex items-start gap-2">
                  <IconMapPin size={16} className="text-leaf shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink">Standard Urban Wildlife:</strong> Fuzzed by ~150 meters so your personal backyard
                    or residence coordinate is never revealed to other players.
                  </div>
                </div>
              )}

              <Link
                href="/map"
                className="btn btn-accent w-full py-2.5 text-xs font-black text-center inline-flex items-center justify-center gap-1.5"
              >
                <IconMap size={15} />
                <span>Explore Full Live Community Map →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
