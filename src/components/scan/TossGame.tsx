"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playHitSound, playTossSound, playClickSound, triggerHaptic } from "@/lib/audio";
import type { TaxonCategory } from "@/lib/game-data";
import { SpecimenArtwork } from "@/lib/specimen-art";

type Props = {
  attemptsLeft: number;
  busy: boolean;
  onAttempt: () => Promise<void>;
  onSuccess: () => void;
  onGiveUp: () => void;
  speciesLabel?: string;
  taxon?: TaxonCategory;
  photo?: string | null;
};

type Vec = { x: number; y: number };

export default function TossGame({
  attemptsLeft,
  busy,
  onAttempt,
  onSuccess,
  onGiveUp,
  speciesLabel = "Red Fox",
  taxon = "Mammal",
  photo = null,
}: Props) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    rect: DOMRect | null;
    samples: { p: Vec; t: number }[];
  }>({ active: false, rect: null, samples: [] });
  const rafRef = useRef<number | null>(null);

  const [pos, setPos] = useState<Vec>({ x: 0.5, y: 0.85 });
  const [flying, setFlying] = useState(false);
  const [scale, setScale] = useState(1);
  const [zoneX, setZoneX] = useState(0.5);
  const dirRef = useRef(1);

  // Smooth target drifting
  useEffect(() => {
    let lastDrift = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(100, Math.max(16, now - lastDrift));
      lastDrift = now;
      const speed = 0.00018 * elapsed;
      setZoneX((x) => {
        let next = x + dirRef.current * speed;
        if (next > 0.68) {
          next = 0.68;
          dirRef.current = -1;
        }
        if (next < 0.32) {
          next = 0.32;
          dirRef.current = 1;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  const reset = useCallback(() => {
    setPos({ x: 0.5, y: 0.85 });
    setScale(1);
    setFlying(false);
  }, []);

  const throwCan = useCallback(
    async (v: Vec) => {
      setFlying(true);
      playTossSound();
      triggerHaptic("medium");
      await onAttempt();
      let p = { ...pos };
      let vel = { x: v.x, y: v.y };
      const gravity = 0.0016;
      const start = performance.now();
      let lastTime = start;

      const step = (now: number) => {
        const dtMs = Math.min(48, Math.max(8, now - lastTime));
        lastTime = now;
        const dtScale = dtMs / 16.667;

        p = { x: p.x + vel.x * dtScale, y: p.y + vel.y * dtScale };
        vel = { x: vel.x * Math.pow(0.995, dtScale), y: vel.y + gravity * dtScale };
        const t = now - start;
        setPos({ ...p });
        setScale(Math.max(0.45, 1 - Math.max(0, 0.85 - p.y) * 1.1));

        const reachedBox = p.y <= 0.42 && vel.y > -0.0005;
        if (reachedBox || p.y > 1.05 || t > 2600 || p.x < -0.15 || p.x > 1.15) {
          const hit = reachedBox && Math.abs(p.x - zoneX) < 0.16 && p.y > 0.22 && p.y < 0.52;
          if (hit) {
            playHitSound();
            triggerHaptic("success");
            onSuccess();
          } else {
            triggerHaptic("light");
            setTimeout(reset, 450);
          }
          return;
        }
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [onAttempt, onSuccess, pos, reset, zoneX],
  );

  useEffect(() => () => void (rafRef.current && cancelAnimationFrame(rafRef.current)), []);

  function toLocalWithRect(clientX: number, clientY: number, rect: DOMRect): Vec {
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (flying || busy || attemptsLeft <= 0) return;
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      active: true,
      rect,
      samples: [{ p: toLocalWithRect(e.clientX, e.clientY, rect), t: performance.now() }],
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active || !dragRef.current.rect) return;
    const p = toLocalWithRect(e.clientX, e.clientY, dragRef.current.rect);
    setPos({ x: p.x, y: Math.max(0.55, Math.min(0.92, p.y)) });
    const s = dragRef.current.samples;
    s.push({ p, t: performance.now() });
    if (s.length > 6) s.shift();
  }

  function onPointerUp() {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const s = dragRef.current.samples;
    if (s.length < 2) {
      reset();
      return;
    }
    const first = s[0];
    const last = s[s.length - 1];
    const dt = Math.max(16, last.t - first.t);
    const vx = ((last.p.x - first.p.x) / dt) * 16;
    const vy = ((last.p.y - first.p.y) / dt) * 16;

    if (vy < -0.008) {
      void throwCan({ x: vx * 0.9, y: Math.max(-0.045, Math.min(-0.015, vy)) });
    } else {
      reset();
    }
  }

  // Quick Action Button: Launch tin can with calibrated arc
  function handleManualLaunch() {
    if (flying || busy || attemptsLeft <= 0) return;
    playClickSound();
    // Calibrated trajectory aiming toward target zone
    const targetVx = (zoneX - 0.5) * 0.024;
    void throwCan({ x: targetVx, y: -0.028 });
  }

  // Quick Action Button: Inspect Card directly / Instant verify
  function handleDirectInspect() {
    playClickSound();
    playHitSound();
    onSuccess();
  }

  return (
    <div className="flex flex-col w-full relative select-none pb-space-lg">
      {/* Target Species Banner Card */}
      <div className="px-margin-mobile pt-space-xs flex flex-col gap-space-xs">
        <div className="bg-surface-container shadow-md rounded-xl p-space-sm flex flex-col gap-space-xs relative overflow-hidden">
          {/* Top Status Ribbon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-2xs bg-secondary-container text-on-secondary-container px-space-xs py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[14px]">track_changes</span>
              <span className="font-label-sm text-label-sm uppercase font-bold tracking-wider">
                Wild Specimen
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-high px-space-xs py-0.5 rounded-full text-on-surface-variant font-label-sm text-label-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-error animate-pulse" />
              <span>LIVE SIGHTING</span>
            </div>
          </div>

          {/* Species Lore Header */}
          <div className="flex items-baseline justify-between mt-0.5">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
                {speciesLabel === "Fox" || speciesLabel.includes("Fox")
                  ? "Vulpes vulpes"
                  : speciesLabel === "Owl" || speciesLabel.includes("Owl")
                  ? "Tyto alba"
                  : `${speciesLabel} sylvaticus`}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                {speciesLabel} • Forest Edge Moraine
              </p>
            </div>
            <div className="text-right">
              <span className="font-label-md text-label-md text-tertiary-container font-bold bg-tertiary-fixed px-space-xs py-1 rounded">
                TIER V
              </span>
            </div>
          </div>

          {/* Telemetry Gauges */}
          <div className="grid grid-cols-3 gap-space-2xs mt-space-2xs pt-space-2xs bg-surface-container-low p-space-xs rounded-lg">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">Range</span>
              <span className="font-specimen-numeral text-specimen-numeral text-primary font-bold">
                4.2<span className="font-label-sm text-label-sm text-on-surface-variant font-normal">m</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">Wind Drift</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-secondary">west</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  2.1 <span className="font-label-sm text-label-sm font-normal text-outline">mph W</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-outline uppercase">Rations Left</span>
              <div className="flex items-center gap-1">
                <span className="font-specimen-numeral text-specimen-numeral text-primary font-bold">
                  {attemptsLeft}<span className="font-label-sm text-label-sm text-outline font-normal">/3</span>
                </span>
                <span className="text-sm">🥫</span>
              </div>
            </div>
          </div>

          {/* Attempt Notice Note */}
          <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm px-1">
            <span>Attempt {4 - attemptsLeft} of 3 | Expended: 1 Tin Can</span>
            <span className="text-secondary font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">psychology</span> Calibrated
            </span>
          </div>
        </div>
      </div>

      {/* MINIGAME TOSS ARENA */}
      <div
        ref={areaRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative mx-margin-mobile mt-space-sm h-[390px] rounded-xl bg-surface-container-low shadow-inner overflow-hidden flex flex-col justify-between touch-none"
      >
        {/* Background Habitat Vista */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-65"
          style={{
            backgroundImage: "url('/images/stitch/background_view_e676dc65.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/40 via-transparent to-surface-container-highest/90 pointer-events-none" />

        {/* UPPER ARENA: Target Reticle Zone */}
        <div className="relative w-full h-[220px] flex items-center justify-center pointer-events-none">
          {/* Target Creature */}
          <div
            className="absolute transition-transform duration-700 ease-out flex flex-col items-center"
            style={{
              left: `${zoneX * 100}%`,
              top: "22%",
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Living Creature Miniature View */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-md bg-surface-container-highest flex items-center justify-center border-2 border-surface-container">
              {photo && !photo.includes("data:image/svg+xml") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={speciesLabel}
                  className="w-full h-full object-cover"
                />
              ) : (
                <SpecimenArtwork
                  taxon={taxon}
                  species={speciesLabel}
                  tier="tier4"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>

            {/* Concentric Naturalist Target Reticle Rings */}
            <div className="absolute -inset-6 flex items-center justify-center animate-pulse pointer-events-none">
              <div className="w-40 h-40 rounded-full bg-secondary/10 flex items-center justify-center shadow-sm">
                <div className="w-28 h-28 rounded-full bg-secondary-container/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-tertiary-fixed-dim/70 flex items-center justify-center animate-bounce shadow-md">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">
                      gps_fixed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Label Stamp */}
            <div className="mt-2 bg-primary text-on-primary font-label-sm text-label-sm px-space-xs py-0.5 rounded shadow whitespace-nowrap">
              CRITICAL RADIUS • 98% SYNC
            </div>
          </div>

          {/* Dynamic Parabolic Flight Trajectory Arc SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" viewBox="0 0 320 220">
            <path
              d="M 160 215 C 160 140, 150 90, 160 48"
              className="text-secondary/70 animate-pulse"
              stroke="currentColor"
              strokeDasharray="4 6"
              strokeWidth="2.5"
            />
            <circle cx="160" cy="46" r="4.5" className="fill-tertiary-container animate-ping" />
          </svg>
        </div>

        {/* LOWER ARENA: Catapult Pedestal & Tactile Tin-Can Launcher */}
        <div className="relative z-10 w-full pb-space-md pt-space-xs flex flex-col items-center">
          {/* Interactive Can Object */}
          <div
            className="relative cursor-grab active:cursor-grabbing transition-transform touch-none flex flex-col items-center"
            style={{
              position: flying ? "absolute" : "relative",
              left: flying ? `${pos.x * 100}%` : "auto",
              top: flying ? `${pos.y * 100}%` : "auto",
              transform: flying ? `translate(-50%, -50%) scale(${scale})` : "none",
            }}
          >
            {/* Floating Guide Pill */}
            {!flying && (
              <div className="mb-2 bg-surface-container-highest/95 backdrop-blur shadow-sm px-space-sm py-1 rounded-full flex items-center gap-1.5 animate-bounce">
                <span className="material-symbols-outlined text-[16px] text-secondary">swipe_up</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  Flick upward to toss!
                </span>
              </div>
            )}

            {/* The Skeuomorphic Energy Can 🥫 Pedestal Component */}
            <div
              className="w-[52px] h-[78px] rounded-xl bg-gradient-to-b from-surface-variant via-surface-container to-surface-dim shadow-xl relative overflow-hidden flex flex-col justify-between transition-transform duration-200 active:scale-95"
            >
              {/* Brushed Tin Metal Top with Ring-Pull Rim */}
              <div className="h-3.5 bg-gradient-to-r from-outline-variant via-surface-container-lowest to-outline-variant flex items-center justify-center shadow-inner">
                <div className="w-3.5 h-1.5 rounded-full bg-outline/40" />
              </div>

              {/* Vintage Botanical Paper Specimen Label */}
              <div className="mx-1 h-12 bg-secondary-container/90 rounded-sm shadow-inner px-1 py-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-[8px] leading-[9px] text-on-secondary-container uppercase tracking-tight">
                    Ration
                  </span>
                  <span className="material-symbols-outlined text-[10px] text-secondary">eco</span>
                </div>
                <div className="text-center font-label-md text-[10px] text-primary font-bold tracking-tight">
                  APEX LURE
                </div>
                <div className="flex justify-between items-center text-[7px] font-label-sm text-on-secondary-container/80">
                  <span>EST. 1894</span>
                  <span>100g</span>
                </div>
              </div>

              {/* Bottom Metal Base Plate */}
              <div className="h-2.5 bg-gradient-to-r from-outline-variant via-surface-container-lowest to-outline-variant shadow-inner" />

              {/* Glossy Vertical Cylinder Reflection Strip */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface-container-lowest/30 to-transparent pointer-events-none" />
            </div>

            {/* Springback Pedestal Notch */}
            <div className="w-16 h-2 mt-1 rounded-full bg-primary/20 blur-[1px]" />
          </div>

          {/* Quick Action: Simulation / Launch Buttons */}
          <div className="mt-space-xs flex items-center gap-space-xs pointer-events-auto">
            <button
              type="button"
              onClick={handleManualLaunch}
              disabled={flying || busy || attemptsLeft <= 0}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold px-space-md py-1.5 rounded-lg shadow-md active:translate-y-0.5 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">sports_volleyball</span>
              <span>Launch Tin Can</span>
            </button>
            <button
              type="button"
              onClick={handleDirectInspect}
              className="bg-surface-container-highest text-primary font-label-sm text-label-sm font-bold px-space-sm py-1.5 rounded-lg shadow-sm hover:bg-surface-variant transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Inspect Card</span>
            </button>
            <button
              type="button"
              onClick={onGiveUp}
              className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-space-xs py-1.5 rounded-lg shadow-xs hover:bg-surface-container"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* EXPEDITION FIELD OBSERVATIONS SLATE */}
      <div className="px-margin-mobile mt-space-md">
        <div className="bg-surface-container p-space-sm rounded-xl shadow-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase font-bold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">auto_stories</span>
              Field Notes &amp; Lore
            </span>
            <span className="font-label-sm text-label-sm text-outline">Vol. IV • Entry #42</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface leading-snug">
            Alert and inquisitive, this {speciesLabel.toLowerCase()} emerged near twilight pine canopies. A gentle
            bait toss toward the outer moss circle entices an intimate observational imprint.
          </p>
        </div>
      </div>
    </div>
  );
}
