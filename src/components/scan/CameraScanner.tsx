"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { classify, extractFeatures, moireScore, perceptualHash, type Detection } from "@/lib/vision";
import { SPECIES, TAXON_META, type TaxonCategory } from "@/lib/game-data";

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

export default function CameraScanner({ onCapture }: { onCapture: (c: Capture) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevRef = useRef<Float32Array | null>(null);
  const motionHistory = useRef<number[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [detection, setDetection] = useState<Detection | null>(null);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [ready, setReady] = useState(false);

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
      setDetection(result);
      setLocked(lockCount >= 3 && result.confidence > 0.5);
    }

    async function start() {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setError("Camera API not supported on this browser — use the sample specimen button (🎲) below.");
        return;
      }

      let stream: MediaStream | null = null;
      // Multi-tier camera constraints for maximum mobile device compatibility:
      // Tier 1: Ideal environment camera with HD resolution
      // Tier 2: Basic environment camera without strict size constraints
      // Tier 3: Any available video stream
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
          // try next constraint tier
        }
      }

      if (!stream) {
        setError("Camera unavailable — please grant camera permission, or use a sample specimen below.");
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
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn }] } as unknown as MediaTrackConstraints);
      setTorchOn((t) => !t);
    } catch {
      setTorchAvailable(false);
    }
  }

  function grabPhoto(): string | null {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;
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
    return out.toDataURL("image/jpeg", 0.7);
  }

  function capture() {
    if (!detection) return;
    const photo = grabPhoto();
    if (!photo) return;
    const hash = prevRef.current ? perceptualHash(prevRef.current) : Math.random().toString(16).slice(2, 18);
    onCapture({
      photo,
      phash: hash,
      taxon: detection.taxon,
      shortlist: detection.shortlist,
      motionScore: Number(detection.motionScore.toFixed(4)),
      screenScore: Number(detection.screenScore.toFixed(3)),
      confidence: detection.confidence,
    });
  }

  function sampleSpecimen() {
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const c = document.createElement("canvas");
    c.width = 480;
    c.height = 480;
    const ctx = c.getContext("2d")!;
    const grd = ctx.createLinearGradient(0, 0, 480, 480);
    grd.addColorStop(0, "#d9e6c8");
    grd.addColorStop(1, "#f4ead6");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 480, 480);
    ctx.font = "220px serif";
    ctx.textAlign = "center";
    ctx.fillText(TAXON_META[species.taxon].emoji, 240, 320);
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#2c2823";
    ctx.fillText("sample specimen", 240, 420);
    onCapture({
      photo: c.toDataURL("image/jpeg", 0.7),
      phash: Math.random().toString(16).slice(2, 18).padEnd(16, "0"),
      taxon: species.taxon,
      shortlist: SPECIES.filter((s) => s.taxon === species.taxon).map((s) => s.label),
      motionScore: 0.06,
      screenScore: 0.2,
      confidence: 0.82,
    });
  }

  const conf = detection?.confidence ?? 0;

  return (
    <div className="space-y-3">
      <div className="doodle relative overflow-hidden bg-black/85" style={{ aspectRatio: "3/4" }}>
        <video ref={videoRef} playsInline autoPlay muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {/* framing overlay */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div
            className="relative h-[72%] w-[72%] rounded-3xl border-4 border-dashed transition-colors"
            style={{ borderColor: locked ? "#7f9c6a" : "rgba(255,253,246,.75)" }}
          >
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/65 px-3 py-0.5 text-[10px] font-bold text-white shadow">
              keep the animal inside the frame
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5">
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-sm">
            {error ? "no camera" : ready ? "on-device detector running" : "starting camera…"}
          </span>
          {torchAvailable && (
            <button
              className="grid h-8 w-8 place-items-center rounded-full bg-black/60 text-sm backdrop-blur-sm transition-transform active:scale-95"
              onClick={() => void toggleTorch()}
              aria-label="Toggle flashlight"
            >
              {torchOn ? "🔦" : "💡"}
            </button>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 space-y-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
            <span className="inline-flex items-center gap-1.5">
              {detection ? `${TAXON_META[detection.taxon].emoji} ${detection.taxon}` : "scanning…"}
            </span>
            <span>{Math.round(conf * 100)}% confidence</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.round(conf * 100)}%`, background: locked ? "#7f9c6a" : "#e2703a" }}
            />
          </div>
          {detection && detection.screenScore > 0.72 && (
            <p className="text-[10px] font-bold text-[#ffd0bb] text-center">
              ⚠︎ looks like a screen (moiré / no parallax) — move the phone a little
            </p>
          )}
        </div>
      </div>

      {error && <p className="doodle-soft bg-[#ffe9dd] px-3 py-2 text-xs text-center">{error}</p>}

      <div className="flex gap-2">
        <button
          className="btn btn-accent flex-1 flex items-center justify-center gap-2"
          disabled={!locked}
          onClick={capture}
        >
          {locked ? "🎯 Animal locked — capture" : "🔍 Hold steady on an animal…"}
        </button>
        <button
          className="btn h-11 w-11 shrink-0 p-0 text-xl"
          onClick={sampleSpecimen}
          title="For preview without a camera"
          aria-label="Generate sample specimen"
        >
          🎲
        </button>
      </div>
    </div>
  );
}
