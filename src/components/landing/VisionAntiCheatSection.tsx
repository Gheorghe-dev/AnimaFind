"use client";

import { useState } from "react";
import {
  IconCheck,
  IconBan,
  IconWarning,
  IconShield,
  IconFox,
  IconPhone,
  IconFileText,
} from "@/components/icons/AppIcons";

export default function VisionAntiCheatSection() {
  const [mode, setMode] = useState<"real" | "fake_screen" | "fake_paper">("real");

  const telemetry = {
    real: {
      status: "VERIFIED LIVING WILDLIFE",
      statusColor: "text-emerald-700 bg-emerald-100 border-emerald-400",
      icon: IconCheck,
      motionScore: 0.148,
      motionVerdict: "Pass (3D Parallax Active)",
      screenScore: 0.08,
      screenVerdict: "Pass (Zero Moiré Grid)",
      hashDistance: 44,
      hashVerdict: "Unique 64-bit Hash",
      confidence: 96,
      summary:
        "Subject exhibits organic multi-planar micro-movements consistent with 3D volumetric depth. No pixel refresh banding or halftone print patterns detected.",
    },
    fake_screen: {
      status: "FRAUD DETECTED: DIGITAL SCREEN",
      statusColor: "text-rose-700 bg-rose-100 border-rose-400",
      icon: IconBan,
      motionScore: 0.003,
      motionVerdict: "Fail (Zero 3D Parallax)",
      screenScore: 0.94,
      screenVerdict: "Critical Fail (High-Freq Moiré Banding)",
      hashDistance: 6,
      hashVerdict: "Duplicate Hash Matched",
      confidence: 12,
      summary:
        "High-frequency RGB subpixel grid detected. Camera detected high-pass spatial noise characteristic of an LCD/OLED computer monitor or smartphone screen.",
    },
    fake_paper: {
      status: "FRAUD DETECTED: 2D PRINTOUT",
      statusColor: "text-amber-800 bg-amber-100 border-amber-400",
      icon: IconWarning,
      motionScore: 0.001,
      motionVerdict: "Critical Fail (Planar Flatness)",
      screenScore: 0.12,
      screenVerdict: "Pass (No Digital Refresh)",
      hashDistance: 2,
      hashVerdict: "Duplicate Print Hash",
      confidence: 18,
      summary:
        "Zero motion parallax between background and subject edges during device translation. Subject is a flat 2D photograph or printed paper.",
    },
  }[mode];

  const TelemetryIcon = telemetry.icon;

  return (
    <section id="anti-cheat" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-white/80 px-3 py-1 text-xs font-black text-ink">
            <IconShield size={14} className="text-leaf" />
            <span>Proprietary Security Pipeline</span>
          </div>
          <h2 className="text-3xl font-black text-ink sm:text-4xl">
            Military-Grade Anti-Cheat &amp; On-Device Vision
          </h2>
          <p className="text-sm font-semibold text-inksoft sm:text-base">
            Collectible trading cards only hold value if they are genuine. Our proprietary browser engine
            extracts 32×32 feature vectors directly in HTML5 Canvas to prevent photos of screens and printouts.
          </p>
        </div>

        {/* Interactive Telemetry Simulator */}
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Visual Scanner Mockup */}
          <div className="space-y-4 lg:col-span-6">
            {/* Mode Selector Tabs */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/70 border border-ink/15 doodle-soft">
              <button
                onClick={() => setMode("real")}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all inline-flex items-center justify-center gap-1.5 ${
                  mode === "real" ? "bg-accent text-white shadow-xs" : "text-ink hover:bg-white"
                }`}
              >
                <IconFox size={14} />
                <span>Real Red Fox</span>
              </button>
              <button
                onClick={() => setMode("fake_screen")}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all inline-flex items-center justify-center gap-1.5 ${
                  mode === "fake_screen" ? "bg-accent text-white shadow-xs" : "text-ink hover:bg-white"
                }`}
              >
                <IconPhone size={14} />
                <span>Phone Screen</span>
              </button>
              <button
                onClick={() => setMode("fake_paper")}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all inline-flex items-center justify-center gap-1.5 ${
                  mode === "fake_paper" ? "bg-accent text-white shadow-xs" : "text-ink hover:bg-white"
                }`}
              >
                <IconFileText size={14} />
                <span>Paper Print</span>
              </button>
            </div>

            {/* Simulated Camera Viewfinder */}
            <div className="doodle relative overflow-hidden bg-stone-900 p-4 text-white">
              {/* Simulated subject backdrop */}
              <div
                className={`relative h-64 sm:h-72 w-full rounded-xl overflow-hidden flex items-center justify-center transition-all ${
                  mode === "real" ? "bg-stone-800" : mode === "fake_screen" ? "bg-blue-950" : "bg-neutral-800"
                }`}
              >
                {/* 32x32 feature grid overlay */}
                <div
                  className="absolute inset-0 opacity-25 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Center Reticle */}
                <div
                  className={`relative z-10 grid h-36 w-36 place-items-center rounded-2xl border-2 transition-all ${
                    mode === "real"
                      ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                      : "border-rose-500 bg-rose-500/15 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                  }`}
                >
                  <div className="grid place-items-center">
                    {mode === "real" ? (
                      <IconFox size={48} className="text-emerald-400" />
                    ) : mode === "fake_screen" ? (
                      <IconPhone size={48} className="text-rose-400" />
                    ) : (
                      <IconFileText size={48} className="text-amber-400" />
                    )}
                  </div>
                  <div className="absolute top-1 left-2 text-[8px] font-mono text-white/80">32×32 LUMA</div>
                  <div className="absolute bottom-1 right-2 text-[8px] font-mono text-white/80">
                    CONF: {telemetry.confidence}%
                  </div>
                </div>

                {/* Corner reticle brackets */}
                <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-white/60" />
                <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-white/60" />
                <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-white/60" />
                <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-white/60" />

                {/* Live Banner */}
                <div className="absolute top-3 inset-x-3 flex justify-between items-center text-[10px] font-mono bg-black/60 px-3 py-1 rounded-lg backdrop-blur-xs">
                  <span>FPS: 60 · LOCAL_CANVAS</span>
                  <span>LATENCY: 12ms</span>
                </div>
              </div>

              {/* Status bar */}
              <div
                className={`mt-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-black ${telemetry.statusColor}`}
              >
                <span className="flex items-center gap-1.5">
                  <TelemetryIcon size={14} className="shrink-0" />
                  <span>{telemetry.status}</span>
                </span>
                <span className="font-mono">{telemetry.confidence}% CONF</span>
              </div>
            </div>
          </div>

          {/* Right Column: Deep-Dive Signal Metrics */}
          <div className="space-y-4 lg:col-span-6">
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-xl font-black text-ink">4-Layer Verification Pipeline</h3>
              <p className="text-xs font-semibold text-inksoft leading-relaxed">{telemetry.summary}</p>

              <div className="space-y-3 pt-2">
                {/* Parallax */}
                <div className="rounded-2xl border border-ink/15 bg-white/70 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-ink">1. Motion Parallax Variance</span>
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        telemetry.motionScore > 0.05 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {telemetry.motionScore.toFixed(3)} · {telemetry.motionVerdict}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-inksoft">
                    Measures relative optical flow between foreground animal contours and background scenery during natural handheld camera tremor.
                  </p>
                </div>

                {/* Moiré */}
                <div className="rounded-2xl border border-ink/15 bg-white/70 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-ink">2. High-Frequency Moiré Filter</span>
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        telemetry.screenScore < 0.3 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {telemetry.screenScore.toFixed(2)} · {telemetry.screenVerdict}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-inksoft">
                    Applies 2D frequency bandpass transforms to detect the characteristic interference banding created by digital display pixel grids.
                  </p>
                </div>

                {/* pHash */}
                <div className="rounded-2xl border border-ink/15 bg-white/70 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-ink">3. 64-bit Perceptual Hash (pHash)</span>
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        telemetry.hashDistance > 15 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      Δ {telemetry.hashDistance} · {telemetry.hashVerdict}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-inksoft">
                    Discrete Cosine Transform (DCT) computes structural luminance fingerprints, preventing players from scanning the same photo repeatedly.
                  </p>
                </div>

                {/* Rate Limiting */}
                <div className="rounded-2xl border border-ink/15 bg-white/70 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-ink">4. Server Token Rate-Limiter</span>
                    <span className="font-mono text-[11px] font-bold text-emerald-700">
                      20 Scans / Hr Ceiling
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-inksoft">
                    Cryptographic round tokens prevent automated headless browser spam and GPS spoof farming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
