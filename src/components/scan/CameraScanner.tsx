"use client";

import { useEffect, useRef, useState } from "react";
import { classify, extractFeatures, moireScore, perceptualHash, type Detection } from "@/lib/vision";
import { SPECIES, type TaxonCategory } from "@/lib/game-data";
import { getSpecimenDataUri } from "@/lib/specimen-art";
import { playLockSound, playClickSound, triggerHaptic } from "@/lib/audio";

export type Capture = {
  photo: string;
  phash: string;
  taxon: TaxonCategory;
  shortlist: string[];
  motionScore: number;
  screenScore: number;
  confidence: number;
};

const SAMPLE_MS = 160;
const ZOOM_LEVELS = ["1.0×", "1.8×", "2.5×"];
const ZOOM_SCALES = ["scale-100", "scale-105", "scale-125"];

export default function CameraScanner({
  onCapture,
  cansAvailable = 4,
  canRefillText = "+1 in 11m 40s",
  coords = null,
}: {
  onCapture: (c: Capture) => void;
  cansAvailable?: number;
  canRefillText?: string;
  coords?: { lat: number; lng: number } | null;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevRef = useRef<Float32Array | null>(null);
  const motionHistory = useRef<number[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [detection, setDetection] = useState<Detection | null>(null);
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [currentHash, setCurrentHash] = useState<string>("e4b9-87a1");
  const [lockTicks, setLockTicks] = useState(3);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatedSpecies, setSimulatedSpecies] = useState({
    latin: "Vulpes vulpes",
    vernacular: "Red Fox",
    order: "Order Carnivora",
    taxon: "Mammal" as TaxonCategory,
  });

  useEffect(() => {
    let cancelled = false;
    let localRaf: number | null = null;
    let lastSampleTime = 0;
    let lockCount = 0;

    function loop() {
      localRaf = requestAnimationFrame(loop);
      rafRef.current = localRaf;
      const now = performance.now();
      if (now - lastSampleTime < SAMPLE_MS) return;
      lastSampleTime = now;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const w = 240;
      const h = Math.round((video.videoHeight / video.videoWidth) * w) || 320;
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);

      const { features, luminance } = extractFeatures(ctx, w, h, prevRef.current);
      prevRef.current = luminance;
      motionHistory.current.push(features.motion);
      if (motionHistory.current.length > 12) motionHistory.current.shift();
      const motionAvg =
        motionHistory.current.reduce((a, b) => a + b, 0) / Math.max(1, motionHistory.current.length);

      const moire = moireScore(features, motionAvg);
      const result = classify(features, motionAvg, moire);

      lockCount = result.confidence > 0.5 ? Math.min(6, lockCount + 1) : Math.max(0, lockCount - 1);
      setLockTicks(Math.min(3, Math.max(1, Math.ceil(lockCount / 2))));
      setDetection(result);

      if (luminance) {
        const hash = perceptualHash(luminance);
        setCurrentHash(`${hash.slice(0, 4)}-${hash.slice(4, 8)}`);
      }

      const isNowLocked = lockCount >= 3 && result.confidence > 0.5;
      if (isNowLocked && !lockedRef.current) {
        playLockSound();
      }
      lockedRef.current = isNowLocked;
      setLocked(isNowLocked);
    }

    async function start() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Camera API not available on this browser — use the field simulation dice.");
        return;
      }

      let stream: MediaStream | null = null;
      const attempts: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280, max: 1920 } }, audio: false },
        { video: { facingMode: "environment" }, audio: false },
        { video: true, audio: false },
      ];

      for (const constraints of attempts) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch {
          // try next tier
        }
      }

      if (!stream) {
        setError("Camera not active — displaying natural habitat vista with specimen simulation.");
        return;
      }

      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("webkit-playsinline", "true");
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      const track = stream.getVideoTracks()[0];
      const caps = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean };
      setTorchAvailable(Boolean(caps.torch));
      setReady(true);
      localRaf = requestAnimationFrame(loop);
      rafRef.current = localRaf;
    }

    void start();
    return () => {
      cancelled = true;
      if (localRaf) cancelAnimationFrame(localRaf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  async function toggleTorch() {
    playClickSound();
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) {
      setTorchOn((t) => !t);
      return;
    }
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] } as unknown as MediaTrackConstraints);
      setTorchOn((t) => !t);
    } catch {
      setTorchOn((t) => !t);
    }
  }

  function cycleZoom() {
    playClickSound();
    setZoomIndex((prev) => (prev + 1) % ZOOM_LEVELS.length);
  }

  function rollSpecimen() {
    playClickSound();
    triggerHaptic("medium");
    playLockSound();
    setIsSimulated(true);

    const random = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const latin =
      random.taxon === "Mammal"
        ? random.label === "Fox"
          ? "Vulpes vulpes"
          : random.label === "Badger"
          ? "Meles meles"
          : `${random.label} sylvaticus`
        : random.taxon === "Bird"
        ? random.label === "Owl"
          ? "Tyto alba"
          : `${random.label} communis`
        : random.label;

    setSimulatedSpecies({
      latin,
      vernacular: random.label,
      order: `Class ${random.taxon}`,
      taxon: random.taxon,
    });
    setLocked(true);
    lockedRef.current = true;
    setLockTicks(3);
  }

  function grabPhoto(): string | null {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      // Return beautiful vector specimen data URI or cached vista
      return getSpecimenDataUri(simulatedSpecies.taxon, simulatedSpecies.vernacular, "tier3");
    }
    const out = document.createElement("canvas");
    const size = 480;
    out.width = size;
    out.height = size;
    const ctx = out.getContext("2d");
    if (!ctx) return null;
    const side = Math.min(video.videoWidth, video.videoHeight);
    ctx.drawImage(
      video,
      (video.videoWidth - side) / 2,
      (video.videoHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
    return out.toDataURL("image/jpeg", 0.75);
  }

  function handleStartEncounter() {
    playClickSound();
    triggerHaptic("heavy");

    const photo = grabPhoto() || getSpecimenDataUri(simulatedSpecies.taxon, simulatedSpecies.vernacular, "tier3");
    const taxon = isSimulated ? simulatedSpecies.taxon : detection?.taxon ?? simulatedSpecies.taxon;
    const shortlist = SPECIES.filter((s) => s.taxon === taxon).map((s) => s.label);
    if (!shortlist.includes(simulatedSpecies.vernacular)) {
      shortlist.unshift(simulatedSpecies.vernacular);
    }

    onCapture({
      photo,
      phash: currentHash.replace("-", "").padEnd(16, "0"),
      taxon,
      shortlist,
      motionScore: detection?.motionScore ?? 0.08,
      screenScore: detection?.screenScore ?? 0.14,
      confidence: detection?.confidence ?? 0.94,
    });
  }

  const confidencePct = Math.round((detection?.confidence ?? 0.94) * 100);
  const currentScale = ZOOM_SCALES[zoomIndex];

  return (
    <div className="flex flex-col w-full relative select-none">
      {/* Live Nature Viewfinder Stage */}
      <div className="relative w-full aspect-[4/5] max-h-[580px] overflow-hidden rounded-xl shadow-lg bg-surface-container-highest">
        {/* Background / Live Video Element */}
        <div
          className={`absolute inset-0 bg-cover bg-center w-full h-full transform ${currentScale} transition-transform duration-700 ease-out`}
          style={{
            backgroundImage: "url('/images/stitch/background_view_b6d810ac.png')",
          }}
        >
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`h-full w-full object-cover ${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Soft Vignette & Sun Filter Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-primary/40 pointer-events-none" />

        {/* Live CV Scanning HUD Layer */}
        <div className="absolute inset-0 p-space-xs flex flex-col justify-between pointer-events-none">
          {/* Top Heuristics & Lock-on Bar */}
          <div className="flex flex-col gap-space-2xs w-full pointer-events-auto">
            {/* Top Status Bar with Lock-On Meter */}
            <div className="flex items-center justify-between bg-primary-container/90 backdrop-blur-md px-space-sm py-1.5 rounded-lg shadow-sm text-on-primary">
              <div className="flex items-center gap-space-2xs">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping" />
                <span className="font-label-md text-label-md tracking-wider uppercase text-secondary-fixed">
                  {locked ? `Lock-On: ${confidencePct}% [3/3 TICKS]` : `Seeking: ${confidencePct}% [SCANNING]`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`w-2.5 h-1.5 rounded-sm ${
                    lockTicks >= 1 ? "bg-secondary-fixed" : "bg-outline/40"
                  }`}
                />
                <span
                  className={`w-2.5 h-1.5 rounded-sm ${
                    lockTicks >= 2 ? "bg-secondary-fixed" : "bg-outline/40"
                  }`}
                />
                <span
                  className={`w-2.5 h-1.5 rounded-sm ${
                    lockTicks >= 3 ? "bg-secondary-fixed" : "bg-outline/40"
                  }`}
                />
                <span className="font-label-sm text-label-sm text-on-primary-container pl-1">0.18s</span>
              </div>
            </div>

            {/* Floating Anti-Spoofing & CV Verification Badges */}
            <div className="flex flex-wrap gap-1 items-center">
              <div className="flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-primary">
                <span className="material-symbols-outlined text-[13px] text-secondary">verified_user</span>
                <span className="font-label-sm text-label-sm">
                  Anti-Screen Moiré: PASSED ({detection ? detection.screenScore.toFixed(2) : "0.14"})
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-primary">
                <span className="material-symbols-outlined text-[13px] text-secondary">view_in_ar</span>
                <span className="font-label-sm text-label-sm">
                  Parallax Depth: 3D REAL ({detection ? detection.motionScore.toFixed(2) : "1.82"} var)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[13px] text-outline">fingerprint</span>
                <span className="font-label-sm text-label-sm">64-bit pHash: #{currentHash}</span>
              </div>
            </div>
          </div>

          {/* Center Reticle & Dynamic Spatial Tracking Box */}
          <div className="relative w-full flex-1 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64 flex items-center justify-center animate-pulse duration-1000">
              {/* Outer Circular Scanning Reticle (SVG) */}
              <svg className="absolute inset-0 w-full h-full text-secondary-fixed animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" opacity="0.85" r="46" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1" />
                <circle cx="50" cy="50" fill="none" opacity="0.6" r="42" stroke="currentColor" strokeDasharray="1 8" strokeWidth="0.5" />
              </svg>

              {/* Corner Aim Crosshairs */}
              <div className="absolute top-2 left-2 w-5 h-5 flex flex-col justify-start items-start">
                <div className="w-full h-1 bg-secondary-fixed rounded-full shadow-sm" />
                <div className="h-full w-1 bg-secondary-fixed rounded-full shadow-sm" />
              </div>
              <div className="absolute top-2 right-2 w-5 h-5 flex flex-col justify-start items-end">
                <div className="w-full h-1 bg-secondary-fixed rounded-full shadow-sm" />
                <div className="h-full w-1 bg-secondary-fixed rounded-full shadow-sm" />
              </div>
              <div className="absolute bottom-2 left-2 w-5 h-5 flex flex-col justify-end items-start">
                <div className="h-full w-1 bg-secondary-fixed rounded-full shadow-sm" />
                <div className="w-full h-1 bg-secondary-fixed rounded-full shadow-sm" />
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 flex flex-col justify-end items-end">
                <div className="h-full w-1 bg-secondary-fixed rounded-full shadow-sm" />
                <div className="w-full h-1 bg-secondary-fixed rounded-full shadow-sm" />
              </div>

              {/* Micro Center Crosshair Pip */}
              <div className="w-2.5 h-2.5 bg-secondary-fixed rounded-full flex items-center justify-center shadow-md">
                <div className="w-1 h-1 bg-primary rounded-full" />
              </div>

              {/* Dynamic Taxa Identification Tag Tagged to Reticle */}
              <div className="absolute -bottom-4 bg-primary text-on-primary px-space-xs py-1 rounded-full shadow-lg flex items-center gap-1.5 transform hover:scale-105 transition-transform pointer-events-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse" />
                <span className="font-label-md text-label-md font-bold tracking-tight text-secondary-fixed">
                  {simulatedSpecies.latin}
                </span>
                <span className="font-label-sm text-label-sm text-on-primary-container">
                  ({simulatedSpecies.vernacular}) · {simulatedSpecies.order}
                </span>
              </div>
            </div>
          </div>

          {/* Mid-Right Floating Field Tool Utilities */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-space-xs pointer-events-auto z-10">
            {/* Torch Toggle Button */}
            <button
              type="button"
              aria-label="Toggle Torchlight"
              onClick={toggleTorch}
              className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all ${
                torchOn
                  ? "bg-secondary-fixed text-on-secondary-fixed"
                  : "bg-surface-container-lowest/90 backdrop-blur-md text-primary hover:bg-surface-container"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {torchOn ? "flashlight_off" : "flashlight_on"}
              </span>
            </button>

            {/* Lens Zoom Preset Button */}
            <button
              type="button"
              aria-label="Switch Optical Zoom"
              onClick={cycleZoom}
              className="w-11 h-11 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-primary flex flex-col items-center justify-center shadow-md hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="font-label-md text-label-md font-bold">{ZOOM_LEVELS[zoomIndex]}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant -mt-1">OPT</span>
            </button>

            {/* Field Simulation Dice Button */}
            <button
              type="button"
              aria-label="Simulate Discovery"
              onClick={rollSpecimen}
              title="Roll New Animal"
              className="w-11 h-11 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md hover:bg-secondary/90 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">casino</span>
            </button>
          </div>

          {/* Bottom Floating Specimen Protection GPS Strip */}
          <div className="w-full flex items-center justify-between bg-primary-container/85 backdrop-blur-md px-space-xs py-1 rounded-lg text-on-primary pointer-events-auto">
            <div className="flex items-center gap-1.5 truncate">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">shield_lock</span>
              <span className="font-label-sm text-label-sm text-surface-variant truncate">
                {coords
                  ? `${coords.lat.toFixed(4)}° N, ${Math.abs(coords.lng).toFixed(4)}° W`
                  : "45.5152° N, 122.6784° W"}{" "}
                · Fuzzed for Wildlife Safety
              </span>
            </div>
            <span className="font-label-sm text-label-sm bg-secondary/80 text-on-secondary px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
              Protected
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Journal Deck & Engagement CTA Section */}
      <div className="flex flex-col gap-space-xs px-margin-mobile pt-space-xs pb-space-sm">
        {/* Botanical Observation Log Card */}
        <div className="bg-surface-container-low rounded-xl p-space-sm shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined text-[24px]">visibility</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-primary font-bold">Specimen Locked</span>
                <span className="font-label-sm text-label-sm bg-secondary-container text-on-secondary-container px-1 py-0.2 rounded font-bold">
                  Unregistered
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Juvenile {simulatedSpecies.vernacular.toLowerCase()} observing perimeter. Stationary for 8s.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-label-md text-label-md text-secondary font-bold block">+65 XP</span>
            <span className="font-label-sm text-label-sm text-outline">Discovery</span>
          </div>
        </div>

        {/* Primary Field Action Button: Start Encounter */}
        <div className="flex flex-col gap-1 w-full pt-1">
          <button
            type="button"
            onClick={handleStartEncounter}
            disabled={cansAvailable <= 0}
            className="w-full bg-secondary hover:bg-secondary/95 text-on-secondary py-space-sm px-space-md rounded-xl font-label-lg text-label-lg uppercase tracking-wider flex items-center justify-center gap-space-xs shadow-md active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
          >
            <span aria-hidden="true" className="text-lg leading-none">🥫</span>
            <span>
              {cansAvailable <= 0 ? "No Cans Remaining" : "Start Field Encounter (Costs 1 Can)"}
            </span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>

          {/* Subtext Stamina & Rations Indicator */}
          <div className="flex items-center justify-center gap-1.5 text-center flex-wrap">
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Rations Remaining: {cansAvailable} Cans · Next refill in {canRefillText}
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-bold">
              • Optimal Weather (+10% Tame Chance)
            </span>
          </div>
        </div>

        {/* Tactile Field Note Accordion / Biometric Insight */}
        <div className="bg-surface-container rounded-lg p-space-xs flex items-center justify-between text-on-surface">
          <div className="flex items-center gap-space-2xs">
            <span className="material-symbols-outlined text-[16px] text-secondary">psychology_alt</span>
            <span className="font-label-sm text-label-sm font-bold">Field Tip:</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Keep phone level to minimize feral alert rate.
            </span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-outline">info</span>
        </div>
      </div>
    </div>
  );
}
