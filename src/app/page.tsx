"use client";

import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import CameraScanner, { type Capture } from "@/components/scan/CameraScanner";
import TossGame from "@/components/scan/TossGame";
import Reveal from "@/components/scan/Reveal";
import { TAXON_META } from "@/lib/game-data";
import type { CardRow, Me } from "@/lib/types";

import { gameApi } from "@/lib/api-client";
import { playCardRevealSound, playClickSound, playLockSound } from "@/lib/audio";

type Phase = "scan" | "confirm" | "toss" | "reveal";

function ScanScreen() {
  const { me, refresh, setMe, toast } = useApp();
  const params = useSearchParams();
  const pinId = params.get("pin");

  const [phase, setPhase] = useState<Phase>("scan");
  const [capture, setCapture] = useState<Capture | null>(null);
  const [species, setSpecies] = useState<string | null>(null);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState<CardRow | null>(null);
  const [pending, setPending] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const onCapture = useCallback(
    (c: Capture) => {
      setCapture(c);
      setSpecies(c.shortlist[0] ?? null);
      setPhase("confirm");
      playLockSound();
      if (me?.user.locationConsent && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => setCoords(null),
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }
    },
    [me?.user.locationConsent],
  );

  async function startRound() {
    setBusy(true);
    try {
      const data = await gameApi.startRound();
      playClickSound();
      setRoundId(data.roundId);
      setAttemptsLeft(data.attemptsLeft ?? 3);
      setPhase("toss");
      await refresh();
    } catch (err: unknown) {
      toast((err as Error).message || "Could not start the round.", "error");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const registerAttempt = useCallback(async () => {
    if (!roundId) return;
    try {
      const data = await gameApi.attemptRound(roundId);
      setAttemptsLeft(data.attemptsLeft ?? 0);
    } catch {
      // ignore local attempt error
    }
  }, [roundId]);

  const submitSighting = useCallback(async () => {
    if (!capture || !roundId || busy) return;
    setBusy(true);
    try {
      const data = await gameApi.submitSighting({
        roundId,
        photo: capture.photo,
        phash: capture.phash,
        taxon: capture.taxon,
        species,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        motionScore: capture.motionScore,
        screenScore: capture.screenScore,
        linkedFromSightingId: pinId,
      });
      setCard(data.card);
      setPending(data.sighting?.verificationStatus === "pending");
      if (data.me) setMe(data.me);
      setPhase("reveal");
      playCardRevealSound(data.card.rarityTier === "tier5");
    } catch (err: unknown) {
      toast((err as Error).message || "Verification failed.", "error");
      setPhase("scan");
      setRoundId(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [busy, capture, coords, pinId, refresh, roundId, setMe, species, toast]);

  function resetAll() {
    setPhase("scan");
    setCapture(null);
    setCard(null);
    setRoundId(null);
    setSpecies(null);
  }

  const cans = me?.cans;

  return (
    <div className="space-y-3">
      {pinId && phase !== "reveal" && (
        <div className="doodle-soft bg-[#e8f2dd] px-3 py-2 text-[11px] font-bold">
          📍 Claiming a community pin — you must be within 250 m of it, verified server-side.
        </div>
      )}

      {phase === "scan" && (
        <>
          <Link
            href="/landing"
            className="doodle-soft flex items-center justify-between bg-[#fff6e2] px-3 py-1.5 text-[11px] font-bold text-ink transition-colors hover:bg-white"
          >
            <span className="flex items-center gap-1.5">
              <span>✨</span>
              <span>Explore AnimaFind SaaS &amp; 3D Card Studio</span>
            </span>
            <span className="text-accent font-black">Tour →</span>
          </Link>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black">Field scan</h1>
            <span className="text-[11px] font-bold text-inksoft">
              🥫 {cans?.current}/{cans?.max}
            </span>
          </div>
          <CameraScanner onCapture={onCapture} />
          <p className="text-[10px] leading-relaxed text-inksoft">
            Detection runs locally on your device. Nothing leaves your phone until a sighting is verified. Please
            keep your distance, never feed or corner an animal to get a card.
          </p>
        </>
      )}

      {phase === "confirm" && capture && (
        <div className="space-y-3">
          <h1 className="text-2xl font-black">Confirm the critter</h1>
          <div className="doodle overflow-hidden p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capture.photo} alt="captured animal" className="w-full rounded-xl object-cover" />
            <p className="mt-2 text-xs font-bold inline-flex items-center gap-1.5">
              <span className="text-sm">{TAXON_META[capture.taxon].emoji}</span>
              <span>Detected class: {capture.taxon} · {Math.round(capture.confidence * 100)}% confidence</span>
            </p>
            <p className="text-[10px] text-inksoft mt-0.5">
              Anti-cheat signals — parallax {capture.motionScore.toFixed(3)}, screen-likeness{" "}
              {capture.screenScore.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-inksoft">Species shortlist</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {capture.shortlist.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecies(s)}
                  className={`rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold transition-all ${
                    species === s ? "bg-accent text-white shadow-xs" : "bg-white/70 hover:bg-white"
                  }`}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => setSpecies(null)}
                className={`rounded-full border-2 border-ink px-3 py-1 text-[11px] font-bold transition-all ${
                  species === null ? "bg-accent text-white shadow-xs" : "bg-white/70 hover:bg-white"
                }`}
              >
                Not sure
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button className="btn flex-1" onClick={resetAll}>
              Rescan
            </button>
            <button
              className="btn btn-accent flex-1"
              disabled={busy || (cans?.current ?? 0) <= 0}
              onClick={() => void startRound()}
            >
              {(cans?.current ?? 0) <= 0 ? "No cans left" : "Spend 1 can → toss"}
            </button>
          </div>
          {(cans?.current ?? 0) <= 0 && (
            <div className="doodle-soft bg-[#fff4e8] p-3 text-center space-y-2 mt-2">
              <p className="text-[11px] font-bold text-ink">
                Out of cans! Cans recharge every {cans?.rechargeRateMinutes} minutes.
              </p>
              <div className="flex gap-2">
                <Link href="/shop" className="btn btn-accent flex-1 text-xs py-1.5">
                  Visit Shop 🥫
                </Link>
                <Link href="/album" className="btn flex-1 text-xs py-1.5">
                  View Album 📔
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "toss" && (
        <div className="space-y-3">
          <h1 className="text-2xl font-black">Toss the can</h1>
          <TossGame
            attemptsLeft={attemptsLeft}
            busy={busy}
            onAttempt={registerAttempt}
            onSuccess={() => void submitSighting()}
            onGiveUp={resetAll}
          />
        </div>
      )}

      {phase === "reveal" && card && (
        <Reveal
          card={card}
          pending={pending}
          onClose={() => {
            resetAll();
            void refresh();
          }}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6 text-center font-bold text-inksoft">Loading the viewfinder…</p>}>
      <ScanScreen />
    </Suspense>
  );
}
