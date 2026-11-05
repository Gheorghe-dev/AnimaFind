"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { gameApi } from "@/lib/api-client";

export default function SettingsPage() {
  const { me, setMe, toast, refresh } = useApp();
  const [feedback, setFeedback] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!me) return null;

  async function toggleLocation(v: boolean) {
    try {
      const updated = await gameApi.updateProfile({ locationConsent: v });
      setMe(updated);
      toast(v ? "Fuzzed location will be attached to new sightings." : "Location sharing disabled.");
    } catch (err: unknown) {
      toast((err as Error).message || "Could not update the consent.", "error");
    }
  }

  async function exportData() {
    try {
      const data = await gameApi.exportAccount();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "critter-codex-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast((err as Error).message || "Export failed.", "error");
    }
  }

  async function deleteAccount() {
    try {
      await gameApi.deleteAccount();
      toast("Account deleted. Backups are purged within 30 days.");
      setConfirmDelete(false);
      await refresh();
      window.location.href = "/";
    } catch (err: unknown) {
      toast((err as Error).message || "Could not delete the account.", "error");
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Settings</h1>

      <section className="doodle bg-[#fff6e2] p-3">
        <h2 className="text-sm font-black">AnimaFind SaaS Platform Tour</h2>
        <p className="mt-1 text-[11px] text-inksoft">
          Explore the official product landing page, interactive 3D card simulator, vision anti-cheat deep-dive,
          and Field Club membership perks.
        </p>
        <Link href="/landing" className="btn btn-accent mt-2 w-full text-xs font-black text-center">
          ✨ Open SaaS Landing Page &amp; 3D Studio →
        </Link>
      </section>

      <section className="doodle p-3">
        <h2 className="text-sm font-black">Consents</h2>
        <p className="mt-1 text-[11px] text-inksoft">
          GDPR consent given {me.user.gdprConsentAt ? new Date(me.user.gdprConsentAt).toLocaleString() : "—"} · age
          16+ confirmed {me.user.ageConfirmed ? "✔︎" : "✕"}
        </p>
        <label className="mt-2 flex items-center justify-between text-xs font-bold">
          <span>Attach fuzzed location to sightings (community map)</span>
          <input
            type="checkbox"
            checked={me.user.locationConsent}
            onChange={(e) => void toggleLocation(e.target.checked)}
          />
        </label>
      </section>

      <section className="doodle p-3" id="privacy">
        <h2 className="text-sm font-black">Privacy policy (summary)</h2>
        <ul className="mt-1 space-y-1 text-[11px] text-inksoft">
          <li>
            <strong>Local-first.</strong> Animal detection, perceptual hashing and anti-cheat heuristics run on your
            device. Frames are never streamed to us.
          </li>
          <li>
            <strong>What we sync.</strong> Only a verified sighting: the single captured photo, the detected class,
            an optional fuzzed coordinate, and the generated card.
          </li>
          <li>
            <strong>Never sold.</strong> We do not sell personal data to third parties. Ads are served contextually.
          </li>
          <li>
            <strong>Sensitive species.</strong> Protected, rare or endangered species are flagged for manual
            moderation; their coordinates are fuzzed to ~5 km or withheld entirely to prevent poaching and habitat
            disturbance.
          </li>
          <li>
            <strong>Age.</strong> 16+ only, because the app uses camera, optional location and social features.
          </li>
          <li>
            <strong>Deletion.</strong> Delete your account from this screen; residual backups are purged within 30
            days.
          </li>
        </ul>
      </section>

      <section className="doodle p-3">
        <h2 className="text-sm font-black">Wildlife watching ethics</h2>
        <ul className="mt-1 space-y-1 text-[11px] text-inksoft">
          <li>🚫 Don&apos;t feed or bait animals to get a scan.</li>
          <li>📏 Keep your distance; use zoom rather than approach.</li>
          <li>🪹 Never disturb nests, dens or hibernating animals.</li>
          <li>🤫 If an animal changes its behaviour because of you, you are too close.</li>
        </ul>
      </section>

      <section className="doodle p-3">
        <h2 className="text-sm font-black">Feedback &amp; support</h2>
        <textarea
          className="doodle-soft mt-1 h-24 w-full bg-white/70 p-2 text-xs"
          placeholder="Tell us what broke, or which species we should add…"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button
          className="btn btn-accent mt-2 w-full"
          disabled={!feedback.trim()}
          onClick={() => {
            setFeedback("");
            toast("Thanks! Your note reached the field office.");
          }}
        >
          Send to support
        </button>
        <p className="mt-1 text-[10px] text-inksoft">Or email support@crittercodex.example</p>
      </section>

      <section className="doodle p-3">
        <h2 className="text-sm font-black">Your data</h2>
        <button className="btn mt-2 w-full" onClick={() => void exportData()}>
          Export my data (JSON)
        </button>
        {!confirmDelete ? (
          <button className="btn mt-2 w-full bg-[#ffe0d4]" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </button>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] font-bold">
              This erases your profile, sightings and every card immediately. Backups purged within 30 days.
            </p>
            <div className="flex gap-2">
              <button className="btn flex-1" onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button className="btn btn-accent flex-1" onClick={() => void deleteAccount()}>
                Yes, delete
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
