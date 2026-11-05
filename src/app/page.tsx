"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import CameraScanner, { type Capture } from "@/components/scan/CameraScanner";
import TossGame from "@/components/scan/TossGame";
import Reveal from "@/components/scan/Reveal";
import type { CardRow } from "@/lib/types";
import { gameApi } from "@/lib/api-client";
import { playCardRevealSound, playClickSound, playLockSound } from "@/lib/audio";

type Phase = "scan" | "toss" | "reveal";

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

  const startRoundWithCapture = useCallback(
    async (c: Capture) => {
      setCapture(c);
      const chosen = c.shortlist[0] ?? "Red Fox";
      setSpecies(chosen);
      playLockSound();

      if (me?.user.locationConsent && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => setCoords(null),
          { enableHighAccuracy: true, timeout: 8000 },
        );
      }

      setBusy(true);
      try {
        const data = await gameApi.startRound();
        playClickSound();
        setRoundId(data.roundId);
        setAttemptsLeft(data.attemptsLeft ?? 3);
        setPhase("toss");
        await refresh();
      } catch (err: unknown) {
        toast((err as Error).message || "Could not start field encounter.", "error");
        await refresh();
      } finally {
        setBusy(false);
      }
    },
    [me?.user.locationConsent, refresh, toast],
  );

  const registerAttempt = useCallback(async () => {
    if (!roundId) return;
    try {
      const data = await gameApi.attemptRound(roundId);
      setAttemptsLeft(data.attemptsLeft ?? 0);
    } catch {
      // local attempt fallback
    }
  }, [roundId]);

  const submitSighting = useCallback(async () => {
    if (!capture || !roundId) return;
    setBusy(true);
    try {
      const data = await gameApi.submitSighting({
        roundId,
        species,
        photo: capture.photo,
        phash: capture.phash,
        taxon: capture.taxon,
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        motionScore: capture.motionScore,
        screenScore: capture.screenScore,
        linkedFromSightingId: pinId ?? undefined,
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
  }, [capture, roundId, species, coords, pinId, setMe, toast, refresh]);

  function resetAll() {
    setPhase("scan");
    setCapture(null);
    setCard(null);
    setRoundId(null);
    setSpecies(null);
  }

  const cans = me?.cans;

  return (
    <div className="w-full flex flex-col">
      {/* Community Pin Claiming Alert */}
      {pinId && phase !== "reveal" && (
        <div className="mx-margin-mobile mb-2 bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-lg text-label-sm font-bold flex items-center gap-1.5 shadow-sm">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span>Claiming community sighting pin within 250m verification zone.</span>
        </div>
      )}

      {/* PHASE 1: Real-time Nature Viewfinder */}
      {phase === "scan" && (
        <CameraScanner
          onCapture={(c) => void startRoundWithCapture(c)}
          cansAvailable={cans?.current ?? 4}
          canRefillText={cans?.secondsUntilNext ? `${Math.floor(cans.secondsUntilNext / 60)}m` : "Ready"}
          coords={coords}
        />
      )}

      {/* PHASE 2: Active Encounter Minigame Arena */}
      {phase === "toss" && (
        <TossGame
          attemptsLeft={attemptsLeft}
          busy={busy}
          onAttempt={registerAttempt}
          onSuccess={() => void submitSighting()}
          onGiveUp={resetAll}
          speciesLabel={species || capture?.shortlist[0] || "Red Fox"}
          taxon={capture?.taxon || "Mammal"}
          photo={capture?.photo}
        />
      )}

      {/* PHASE 3: Victory Holographic Card Reveal Overlay */}
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
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container animate-spin flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">progress_activity</span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant">Calibrating Viewfinder…</span>
        </div>
      }
    >
      <ScanScreen />
    </Suspense>
  );
}
