"use client";

import Link from "next/link";
import { useState } from "react";
import { FoxIllustration } from "./CardIllustrations";
import {
  IconCamera,
  IconSparkles,
  IconCan,
  IconShield,
  IconMap,
  IconCodex,
  IconFlame,
  IconFox,
  IconRadar,
  IconPaw,
  IconFlip,
} from "@/components/icons/AppIcons";

export default function HeroSection() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pb-32">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-accent/15 via-leaf/15 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 -z-10 h-96 w-96 rounded-full bg-[#e8b53c]/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Value Prop & CTAs */}
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-black text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <span>AnimaFind 2.4 · Real-World Wildlife AR Trading Card Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl font-black tracking-tight text-ink sm:text-5xl md:text-6xl lg:leading-[1.1]">
              Turn Real-World Wildlife Into{" "}
              <span className="bg-gradient-to-r from-accent via-[#c05621] to-[#e8b53c] bg-clip-text text-transparent">
                Legendary Collectible Cards
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl text-base font-semibold leading-relaxed text-inksoft sm:text-lg lg:mx-0">
              Point your camera at genuine living animals in backyards, trails, and city parks.
              Pass real-time on-device vision &amp; anti-cheat checks, land the tin-can toss, and mint
              one-of-a-kind trading cards with combat stats, unique serial numbers, and 5 rarity tiers.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/"
                className="btn btn-accent w-full px-8 py-3.5 text-base font-black shadow-md transition-transform hover:-translate-y-0.5 sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <IconCamera size={18} />
                <span>Launch Web App — Free</span>
              </Link>

              <a
                href="#simulator"
                className="btn w-full px-6 py-3.5 text-base font-bold transition-transform hover:-translate-y-0.5 sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <IconSparkles size={16} />
                <span>Test 3D Card Studio ↓</span>
              </a>
            </div>

            {/* Value Guarantees / Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4 sm:gap-4">
              <div className="glass-panel rounded-2xl p-3 text-left">
                <div className="text-leaf mb-1">
                  <IconCan size={22} />
                </div>
                <div className="text-xs font-black text-ink">On-Device AI</div>
                <div className="text-[10px] text-inksoft">Photos never leave your phone unverified</div>
              </div>

              <div className="glass-panel rounded-2xl p-3 text-left">
                <div className="text-amber-700 mb-1">
                  <IconShield size={22} />
                </div>
                <div className="text-xs font-black text-ink">Anti-Cheat Engine</div>
                <div className="text-[10px] text-inksoft">Parallax &amp; moiré screen detection</div>
              </div>

              <div className="glass-panel rounded-2xl p-3 text-left">
                <div className="text-leaf mb-1">
                  <IconMap size={22} />
                </div>
                <div className="text-xs font-black text-ink">Fuzzed GPS Map</div>
                <div className="text-[10px] text-inksoft">250m claim radius, protected species privacy</div>
              </div>

              <div className="glass-panel rounded-2xl p-3 text-left">
                <div className="text-ink mb-1">
                  <IconCodex size={22} />
                </div>
                <div className="text-xs font-black text-ink">35 Curated Taxa</div>
                <div className="text-[10px] text-inksoft">Mammals, birds, insects, reptiles, amphibians</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Hero Card Showcase */}
          <div className="flex flex-col items-center justify-center lg:col-span-5">
            <div className="relative w-full max-w-[340px] sm:max-w-[360px]">
              {/* Floating Badge */}
              <div className="animate-float absolute -top-5 -right-4 z-20 flex items-center gap-1.5 rounded-full border-2 border-ink bg-[#fffdf6] px-3 py-1 shadow-md">
                <IconSparkles size={14} className="text-amber-500" />
                <span className="text-[11px] font-black text-accent uppercase tracking-wider">
                  Tier 5 Aurora Series
                </span>
              </div>

              <div
                className="animate-float absolute -bottom-5 -left-4 z-20 flex items-center gap-1.5 rounded-full border-2 border-ink bg-[#fffdf6] px-3 py-1 shadow-md"
                style={{ animationDelay: "2s" }}
              >
                <IconFlame size={14} className="text-accent" />
                <span className="text-[11px] font-black text-ink">
                  Combat Ready · Grit 96
                </span>
              </div>

              {/* 3D Flip Card Container */}
              <div className="[perspective:1200px] w-full">
                <div
                  onClick={() => setFlipped((f) => !f)}
                  className={`card-flip relative cursor-pointer select-none transition-transform duration-500 ${
                    flipped ? "flipped" : ""
                  }`}
                  style={{ aspectRatio: "2.5/3.5" }}
                >
                  {/* FRONT FACE */}
                  <div
                    className="card-face doodle absolute inset-0 flex flex-col justify-between p-3.5"
                    style={{
                      background: "linear-gradient(135deg, #fffdf8 0%, #fdf8eb 100%)",
                      boxShadow: "5px 5px 0 #2c2823, 0 0 35px rgba(232, 181, 60, 0.75)",
                    }}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b-2 border-ink/15 pb-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-inksoft">
                          Aurora · #00042
                        </span>
                        <span className="rounded-full bg-[#e8b53c] px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-xs">
                          Tier 5
                        </span>
                      </div>

                      {/* Card Artwork */}
                      <div className="relative h-56 w-full overflow-hidden rounded-xl border-2 border-ink bg-stone-900 shadow-inner mt-2">
                        <FoxIllustration className="h-full w-full object-cover" />
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs flex items-center gap-1">
                          <IconFox size={12} />
                          <span>Vulpes vulpes · Mammal</span>
                        </span>
                      </div>

                      {/* Card Identity */}
                      <div className="pt-2.5">
                        <h3 className="truncate text-xl font-black text-ink">
                          Sir Bramble Thunder
                        </h3>
                        <p className="text-xs font-bold text-inksoft">
                          Chonky Hunter · Dusk Prowler
                        </p>
                      </div>
                    </div>

                    {/* Combat Stats */}
                    <div className="space-y-1.5 pt-2 border-t-2 border-dashed border-ink/20">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl border border-ink/20 bg-amber-50/80 p-1.5">
                          <span className="block text-[9px] font-bold uppercase text-inksoft">Snack</span>
                          <span className="text-sm font-black text-ink">88</span>
                        </div>
                        <div className="rounded-xl border border-ink/20 bg-rose-50/80 p-1.5">
                          <span className="block text-[9px] font-bold uppercase text-inksoft">Charm</span>
                          <span className="text-sm font-black text-ink">92</span>
                        </div>
                        <div className="rounded-xl border border-ink/20 bg-emerald-50/80 p-1.5">
                          <span className="block text-[9px] font-bold uppercase text-inksoft">Grit</span>
                          <span className="text-sm font-black text-ink">96</span>
                        </div>
                      </div>
                      <p className="text-center text-[10px] font-bold text-accent flex items-center justify-center gap-1">
                        <IconFlip size={12} />
                        <span>Tap or click card to flip for Lore &amp; Abilities</span>
                      </p>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div
                    className="card-face card-back doodle absolute inset-0 flex flex-col justify-between p-4 text-left"
                    style={{
                      background: "#fffdf6",
                      boxShadow: "5px 5px 0 #2c2823, 0 0 35px rgba(232, 181, 60, 0.75)",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-ink/15 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-ink">
                          Collector Codex Card
                        </span>
                        <span className="text-xs font-black text-[#e8b53c]">Aurora Legendary</span>
                      </div>

                      <h4 className="mt-2 text-lg font-black text-ink">Sir Bramble Thunder</h4>
                      <p className="mt-1 text-xs leading-relaxed text-inksoft">
                        &quot;Spotted bounding through blackberry thickets at dusk. Known for stealing
                        picnic crusts and vanishing into autumn mist before human eyes can focus.&quot;
                      </p>

                      {/* Procedural Abilities */}
                      <div className="mt-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">
                          Unlocked Abilities
                        </p>
                        <div className="mt-1.5 space-y-1.5">
                          <div className="doodle-soft bg-white/80 px-2.5 py-1 text-xs font-bold text-ink flex items-center gap-1.5">
                            <IconSparkles size={13} className="text-amber-500 shrink-0" />
                            <span>
                              <span className="text-accent">Static Floof:</span> Paralyzes bugs on contact
                            </span>
                          </div>
                          <div className="doodle-soft bg-white/80 px-2.5 py-1 text-xs font-bold text-ink flex items-center gap-1.5">
                            <IconRadar size={13} className="text-leaf shrink-0" />
                            <span>
                              <span className="text-accent">Snack Radar:</span> Locates food within 300 meters
                            </span>
                          </div>
                          <div className="doodle-soft bg-white/80 px-2.5 py-1 text-xs font-bold text-ink flex items-center gap-1.5">
                            <IconPaw size={13} className="text-leaf shrink-0" />
                            <span>
                              <span className="text-accent">Toe Bean Stomp:</span> Deals +30 morale damage
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-ink/20 bg-paper p-2.5 text-[10px] font-bold text-inksoft">
                      <div className="flex justify-between">
                        <span>Logged by: @UrbanNaturalist</span>
                        <span>Serial: #00042</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Class: Mammal (Vulpes)</span>
                        <span>Verified: On-Device AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs font-bold text-inksoft flex items-center justify-center gap-1">
                <IconFlip size={13} />
                <span>Interactive 3D Card — Flip and inspect details</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
