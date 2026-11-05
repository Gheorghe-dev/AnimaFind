"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCoin, IconCheck, IconStar, IconSparkles } from "@/components/icons/AppIcons";

export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-16 sm:py-24 bg-paper2/40 border-t border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconCoin size={14} className="text-amber-500" />
            <span>Fair &amp; Transparent Membership</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Choose Your Naturalist Journey
          </h2>
          <p className="text-sm font-semibold text-inksoft sm:text-base">
            AnimaFind is free to explore forever. Upgrade to Field Club Premium for 2.5× faster can recharges,
            an expanded stash, zero ads, and exclusive gold cosmetics.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${!annual ? "text-ink" : "text-inksoft"}`}>Monthly</span>
            <button
              onClick={() => setAnnual((a) => !a)}
              className="relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-ink bg-white p-0.5 transition-colors"
              aria-label="Toggle annual billing"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-accent transition-transform ${
                  annual ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${annual ? "text-ink" : "text-inksoft"}`}>
              Annual <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-black text-accent">SAVE 35%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid max-w-4xl mx-auto gap-8 lg:grid-cols-2">
          {/* FREE TIER */}
          <div className="glass-panel relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-inksoft">
                  Free Naturalist
                </span>
                <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-[10px] font-black text-ink">
                  FOREVER FREE
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-ink">$0</span>
                <span className="text-xs font-bold text-inksoft">/ month</span>
              </div>

              <p className="mt-2 text-xs text-inksoft leading-relaxed font-medium">
                Perfect for casual birdwatchers, backyard explorers, and dog walkers discovering local fauna.
              </p>

              {/* Feature List */}
              <ul className="mt-6 space-y-3 text-xs font-bold text-ink">
                <li className="flex items-center gap-2">
                  <IconCheck size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>5 Max Can Energy Stash</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>25-Minute Standard Can Recharge</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>Full On-Device Camera AI &amp; Anti-Cheat</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>Full 35-Species European Codex</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>Community Map 250m Proximity Claiming</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconCheck size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                  <span>Optional Rewarded Ads for Extra Cans</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link href="/" className="btn w-full py-3 text-xs font-black text-center">
                Start Exploring Free →
              </Link>
            </div>
          </div>

          {/* FIELD CLUB PREMIUM */}
          <div
            className="doodle relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-[#fffdf6] transition-all hover:-translate-y-1"
            style={{ boxShadow: "6px 6px 0 #2c2823, 0 0 24px rgba(226, 112, 58, 0.25)" }}
          >
            {/* Best Value Ribbon */}
            <div className="absolute -top-3.5 right-6 rounded-full border-2 border-ink bg-accent px-3 py-0.5 text-[10px] font-black text-white shadow-xs inline-flex items-center gap-1">
              <IconStar size={11} className="fill-white text-white" />
              <span>POPULAR FIELD CLUB</span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-accent">
                  Field Club Premium
                </span>
                <span className="text-xs font-black text-ink">All Perks Unlocked</span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-ink">
                  {annual ? "$3.25" : "$4.99"}
                </span>
                <span className="text-xs font-bold text-inksoft">
                  / month {annual && "(billed $39/year)"}
                </span>
              </div>

              <p className="mt-2 text-xs text-inksoft leading-relaxed font-medium">
                For passionate nature collectors, wildlife photographers, and daily trail hikers.
              </p>

              {/* Feature List */}
              <ul className="mt-6 space-y-3 text-xs font-bold text-ink">
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span><strong>8 Max Cans (+60% Capacity)</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span><strong>10-Minute Rapid Recharge (2.5× Faster!)</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span><strong>100% Ad-Free Experience (Zero Banners)</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span>Exclusive Gold Card Frame &amp; Explorer Hat</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span>Priority Cloud Verification Server Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span>Full Biodiversity Research Data Export (CSV/JSON)</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconSparkles size={14} className="text-accent shrink-0" />
                  <span>Early Access to Upcoming Seasonal Taxa Packs</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/shop"
                className="btn btn-accent w-full py-3.5 text-xs font-black text-center shadow-md"
              >
                Upgrade to Field Club Premium →
              </Link>
              <p className="mt-2 text-center text-[10px] text-inksoft">
                Instant activation · Cancel anytime in Settings
              </p>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="mt-16 max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-black text-ink pb-4 border-b border-ink/10">
            Feature Comparison Matrix
          </h3>

          <div className="divide-y divide-ink/10 text-xs">
            <div className="grid grid-cols-3 py-3 font-bold text-inksoft uppercase tracking-wider text-[10px]">
              <span>Capability</span>
              <span className="text-center">Free Naturalist</span>
              <span className="text-right text-accent">Field Club</span>
            </div>

            <div className="grid grid-cols-3 py-3 items-center">
              <span className="font-bold text-ink">Max Can Capacity</span>
              <span className="text-center text-inksoft font-medium">5 Cans</span>
              <span className="text-right font-black text-accent">8 Cans (+60%)</span>
            </div>

            <div className="grid grid-cols-3 py-3 items-center">
              <span className="font-bold text-ink">Energy Recharge Speed</span>
              <span className="text-center text-inksoft font-medium">1 Can / 25 min</span>
              <span className="text-right font-black text-accent">1 Can / 10 min (2.5×)</span>
            </div>

            <div className="grid grid-cols-3 py-3 items-center">
              <span className="font-bold text-ink">Ad-Free Gameplay</span>
              <span className="text-center text-inksoft font-medium">Rewarded Ads</span>
              <span className="text-right font-black text-accent">100% Ad-Free</span>
            </div>

            <div className="grid grid-cols-3 py-3 items-center">
              <span className="font-bold text-ink">On-Device Heuristic AI</span>
              <span className="text-center text-emerald-700 font-bold inline-flex items-center justify-center gap-1">
                <IconCheck size={14} strokeWidth={2.5} />
                <span>Included</span>
              </span>
              <span className="text-right text-emerald-700 font-bold inline-flex items-center justify-end gap-1">
                <IconCheck size={14} strokeWidth={2.5} />
                <span>Included</span>
              </span>
            </div>

            <div className="grid grid-cols-3 py-3 items-center">
              <span className="font-bold text-ink">Exclusive Cosmetics</span>
              <span className="text-center text-inksoft">—</span>
              <span className="text-right font-black text-accent">Gold Frame &amp; Hat</span>
            </div>

            <div className="grid grid-cols-3 py-3 items-center">
              <span className="font-bold text-ink">GDPR Account Data Export</span>
              <span className="text-center text-emerald-700 font-bold inline-flex items-center justify-center gap-1">
                <IconCheck size={14} strokeWidth={2.5} />
                <span>Standard</span>
              </span>
              <span className="text-right font-black text-accent inline-flex items-center justify-end gap-1">
                <IconCheck size={14} strokeWidth={2.5} />
                <span>Full CSV/JSON</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
