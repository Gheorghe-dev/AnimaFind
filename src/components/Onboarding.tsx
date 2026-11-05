"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "./AppProvider";
import { gameApi } from "@/lib/api-client";
import { playClickSound } from "@/lib/audio";
import {
  IconPaw,
  IconCan,
  IconMap,
  IconSparkles,
} from "./icons/AppIcons";

const STEPS = 3;

export default function Onboarding() {
  const { me, setMe, toast } = useApp();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(me?.user.username ?? "");
  const [gdpr, setGdpr] = useState(false);
  const [age, setAge] = useState(false);
  const [loc, setLoc] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  async function finish() {
    setBusy(true);
    try {
      const updated = await gameApi.saveConsent({
        gdprConsent: gdpr,
        ageConfirmed: age,
        locationConsent: loc,
        username,
      });
      setMe(updated);
      playClickSound();
      toast("Field journal opened. Go find something with legs.");
    } catch (err: unknown) {
      toast((err as Error).message || "Consent required.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-5">
      <div className="doodle tape p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-inksoft font-bold">Critter Codex</p>
        <h1 className="mt-1 text-3xl font-black leading-tight">
          Scan real animals.
          <br />
          Collect absurd cards.
        </h1>

        {step === 0 && (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-inksoft leading-relaxed">
              Point your camera at a genuine, breathing animal — a pigeon, next door&apos;s cat, a beetle on a
              wall. Land the tin-can toss and the encounter becomes a one-of-a-kind collectible card in your
              field journal.
            </p>
            <ul className="space-y-2 text-inksoft pt-1">
              <li className="flex items-center gap-2">
                <IconPaw size={16} className="text-leaf shrink-0" />
                <span>Multi-class detection: mammals, birds, insects, reptiles, amphibians</span>
              </li>
              <li className="flex items-center gap-2">
                <IconCan size={16} className="text-leaf shrink-0" />
                <span>Cans recharge over time — 3 tosses per can</span>
              </li>
              <li className="flex items-center gap-2">
                <IconMap size={16} className="text-leaf shrink-0" />
                <span>Community map with fuzzed, never-exact locations</span>
              </li>
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="mt-4 space-y-3 text-sm">
            <h2 className="font-black text-ink">Privacy, plainly</h2>
            <p className="text-inksoft leading-relaxed">
              Detection runs on your device. Only a <strong>verified</strong> sighting is synced. We never sell
              personal data. Locations of protected or rare species are fuzzed to a 5 km area or hidden entirely,
              because poaching and habitat disturbance are real.
            </p>
            <p className="text-inksoft leading-relaxed">
              Wildlife ethics: don&apos;t disturb, don&apos;t feed, keep your distance. A card is never worth
              stressing an animal.
            </p>
            <button
              type="button"
              className="text-xs font-bold underline text-ink hover:text-accent text-left block"
              onClick={() => setShowPrivacyModal(true)}
            >
              Read the full privacy policy (summary)
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-inksoft">Field name</span>
              <input
                className="doodle-soft mt-1 w-full bg-white/70 px-3 py-2 font-bold"
                value={username}
                maxLength={24}
                placeholder="e.g. MossyRambler"
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-ink/15 bg-white/60 cursor-pointer select-none transition-colors hover:bg-white">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-ink cursor-pointer accent-accent"
                checked={age}
                onChange={(e) => setAge(e.target.checked)}
              />
              <span className="text-xs leading-snug">
                I am 16 or older (camera, location and social features require it).
              </span>
            </label>
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-ink/15 bg-white/60 cursor-pointer select-none transition-colors hover:bg-white">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-ink cursor-pointer accent-accent"
                checked={gdpr}
                onChange={(e) => setGdpr(e.target.checked)}
              />
              <span className="text-xs leading-snug">
                I consent to processing of my sightings for the purposes described in the privacy policy (GDPR
                Art. 6(1)(a)). Not pre-ticked, revocable any time in Settings.
              </span>
            </label>
            <label className="flex items-start gap-3 p-2.5 rounded-xl border border-ink/15 bg-white/60 cursor-pointer select-none transition-colors hover:bg-white">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-ink cursor-pointer accent-accent"
                checked={loc}
                onChange={(e) => setLoc(e.target.checked)}
              />
              <span className="text-xs leading-snug">
                <em>Optional:</em> attach fuzzed coordinates to sightings so they can appear on the community map.
              </span>
            </label>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <div className="flex gap-1">
            {Array.from({ length: STEPS }).map((_, i) => (
              <span
                key={i}
                className={`h-2 w-6 rounded-full transition-all ${i <= step ? "bg-accent" : "bg-black/15"}`}
              />
            ))}
          </div>
          {step < STEPS - 1 ? (
            <button className="btn btn-accent" onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button className="btn btn-accent" disabled={busy || !gdpr || !age} onClick={() => void finish()}>
              {busy ? "Opening…" : "Start exploring"}
            </button>
          )}
        </div>
      </div>
      <div className="text-center">
        <Link
          href="/landing"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-inksoft hover:text-accent transition-colors"
        >
          <IconSparkles size={14} className="text-accent" />
          <span>New to AnimaFind? Explore the SaaS Landing Page &amp; 3D Card Studio →</span>
        </Link>
      </div>

      {showPrivacyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="doodle max-w-md w-full max-h-[85vh] overflow-y-auto p-5 space-y-3 bg-paper shadow-2xl">
            <h3 id="privacy-modal-title" className="text-lg font-black text-ink">
              Privacy Policy &amp; Ethics Charter
            </h3>
            <ul className="space-y-2 text-xs text-inksoft leading-relaxed">
              <li>
                <strong className="text-ink">1. Local-First Processing:</strong> All animal detection, computer vision heuristics, moiré detection, and perceptual hashing run strictly on your device. Video frames never leave your phone.
              </li>
              <li>
                <strong className="text-ink">2. What We Sync:</strong> Only verified sightings when you catch a card: the single captured photo, detected class, optional fuzzed coordinates, and card stats.
              </li>
              <li>
                <strong className="text-ink">3. Anti-Poaching Coordinate Fuzzing:</strong> Locations of everyday species are fuzzed to a ~150 m radius. Protected, rare, or sensitive species are fuzzed to a ~5 km radius or kept confidential.
              </li>
              <li>
                <strong className="text-ink">4. No Data Brokering:</strong> We do not sell your personal data or location to third parties.
              </li>
              <li>
                <strong className="text-ink">5. Wildlife First:</strong> Never bait, harass, disturb, or corner animals. Naturalist ethics are mandatory.
              </li>
            </ul>
            <button
              className="btn btn-accent w-full mt-4"
              onClick={() => setShowPrivacyModal(false)}
            >
              I Understand &amp; Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
