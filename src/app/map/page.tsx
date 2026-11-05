"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { TAXON_META } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import type { MapPin } from "@/lib/types";

const FALLBACK = { lat: 44.4268, lng: 26.1025 };
const SPAN = 0.05; // degrees shown edge-to-edge

export default function MapPage() {
  const { me, toast } = useApp();
  const [center, setCenter] = useState<{ lat: number; lng: number }>(FALLBACK);
  const [usingFallback, setUsingFallback] = useState(true);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [loading, setLoading] = useState(true);

  const [locating, setLocating] = useState(false);

  const requestGps = () => {
    if (!("geolocation" in navigator)) {
      toast("Geolocation is not supported by your device.", "error");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCenter({ lat: p.coords.latitude, lng: p.coords.longitude });
        setUsingFallback(false);
        setLocating(false);
        toast("Location updated.");
      },
      () => {
        setLocating(false);
        toast("Unable to acquire precise GPS signal. Using estimated area.", "error");
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          setCenter({ lat: p.coords.latitude, lng: p.coords.longitude });
          setUsingFallback(false);
        },
        () => {
          // Keep FALLBACK if denied
        },
        { timeout: 8000 },
      );
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function fetchPins() {
      setLoading(true);
      try {
        const data = await gameApi.getMap(center.lat, center.lng);
        if (active) setPins(data.pins);
      } catch (err) {
        console.error("[MapPage] Failed to fetch pins:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchPins();
    return () => {
      active = false;
    };
  }, [center]);

  const placed = useMemo(
    () =>
      center
        ? pins.map((p) => ({
            pin: p,
            x: 50 + ((p.approxLng - center.lng) / SPAN) * 100,
            y: 50 - ((p.approxLat - center.lat) / SPAN) * 100,
          }))
        : [],
    [pins, center],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Community map</h1>
        <button
          onClick={requestGps}
          disabled={locating}
          className="doodle-soft bg-white/80 px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-white transition-colors"
          aria-label="Refresh GPS location"
        >
          <span>{locating ? "⏳" : "📡"}</span>
          <span>{locating ? "Locating…" : "Recenter"}</span>
        </button>
      </div>

      <p className="doodle-soft bg-[#fff2e2] px-3 py-2 text-[10px] leading-relaxed">
        ⚠︎ <strong>Pins are approximate past sightings, not live animal locations.</strong> Everyday species are
        fuzzed to a ~150 m area; protected, rare or endangered species are fuzzed to a ~5 km area, hidden, or held
        for manual review. Never track, bait or corner an animal — don&apos;t disturb, don&apos;t feed, keep your
        distance.
      </p>

      <div className="doodle relative overflow-hidden" style={{ aspectRatio: "1/1", background: "#e8efdd" }}>
        <div className="absolute inset-0 opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={`h${i}`} className="absolute inset-x-0 border-t border-dashed border-[#9bab88]" style={{ top: `${(i + 1) * 10}%` }} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={`v${i}`} className="absolute inset-y-0 border-l border-dashed border-[#9bab88]" style={{ left: `${(i + 1) * 10}%` }} />
          ))}
        </div>
        {/* proximity ring: 250 m */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[#7f9c6a]"
          style={{ left: "50%", top: "50%", width: `${(0.0045 / SPAN) * 100}%`, aspectRatio: "1/1" }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/90 border-2 border-ink shadow-sm text-base">
          🧭
        </div>

        {placed.map(({ pin, x, y }) =>
          x < -5 || x > 105 || y < -5 || y > 105 ? null : (
            <button
              key={pin.sightingId}
              onClick={() => setSelected(pin)}
              className="absolute -translate-x-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-white/90 border-2 border-ink shadow-md text-base transition-transform hover:scale-115 active:scale-95"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={pin.species ?? pin.taxon}
            >
              <span className={pin.isClaimableByViewer ? "animate-bounce" : ""}>
                {pin.isSensitiveSpecies ? "🛡️" : TAXON_META[pin.taxon]?.emoji ?? "🐾"}
              </span>
            </button>
          ),
        )}

        <div className="absolute bottom-1 left-2 text-[9px] font-black text-[#5b6b4d]">
          {usingFallback ? "demo location (GPS unavailable)" : "your approximate area"} · ~5 km across
        </div>
      </div>

      {loading && <p className="text-center text-xs font-bold text-inksoft">Reading the field notes…</p>}

      {!loading && pins.length === 0 && (
        <div className="doodle tape p-5 text-center">
          <p className="text-3xl">🗺️</p>
          <p className="mt-2 font-black text-sm">No nearby sightings recorded yet.</p>
          <p className="mt-1 text-xs text-inksoft leading-relaxed">
            Be the first naturalist to explore this area! Verified sightings will appear here as community pins.
          </p>
          <Link href="/" className="btn btn-accent mt-3 inline-block">
            Start Scanning
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {pins.map((pin) => (
          <button
            key={pin.sightingId}
            onClick={() => setSelected(pin)}
            className="doodle flex w-full items-center gap-3 p-2 text-left transition-transform hover:translate-x-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pin.thumbnailUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border-2 border-ink object-cover bg-white" />
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-black truncate">{pin.cardName ?? pin.taxon}</span>
              <span className="block text-[10px] text-inksoft truncate">
                {pin.species ?? pin.taxon} · by {pin.byUsername} ·{" "}
                {pin.distanceMeters != null ? `${pin.distanceMeters} m` : "distance unknown"} · {pin.precision}
              </span>
            </span>
            {pin.isClaimableByViewer && <span className="text-[10px] font-black text-accent shrink-0">CLAIMABLE</span>}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/70 p-4" onClick={() => setSelected(null)}>
          <div className="doodle my-auto w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-2 p-3" onClick={(e) => e.stopPropagation()}>
            <div className="scrollhide flex gap-2 overflow-x-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.thumbnailUrl} alt="" className="h-44 w-44 rounded-xl border-2 border-ink object-cover" />
              <div className="grid h-44 w-44 shrink-0 place-items-center rounded-xl border-2 border-dashed border-ink/40 text-center text-[10px] text-inksoft">
                3D scene preview
                <br />
                (coming later)
              </div>
            </div>
            <h2 className="text-lg font-black">{selected.cardName ?? "Community sighting"}</h2>
            <p className="text-[11px] text-inksoft">
              {selected.species ?? selected.taxon} · logged by {selected.byUsername} on{" "}
              {new Date(selected.timestamp).toLocaleDateString()} · shown within a {selected.precision}
            </p>
            {selected.isSensitiveSpecies && (
              <p className="doodle-soft bg-[#fff2e2] px-2 py-1 text-[10px]">
                🛡️ Protected species: exact location permanently withheld.
              </p>
            )}
            {selected.isClaimableByViewer ? (
              <Link href={`/?pin=${selected.sightingId}`} className="btn btn-accent block text-center">
                Scan here for a linked card
              </Link>
            ) : (
              <button
                className="btn w-full"
                onClick={() =>
                  toast(
                    selected.alreadyClaimed
                      ? "You already have a linked card from this pin."
                      : selected.isOwn
                        ? "This is your own sighting."
                        : `Get within 250 m of the pin to claim it${
                            selected.distanceMeters != null ? ` (currently ${selected.distanceMeters} m away)` : ""
                          }.`,
                  )
                }
              >
                Not claimable yet
              </button>
            )}
            <button className="btn w-full" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {!me?.user.locationConsent && (
        <p className="text-center text-[11px] font-bold text-inksoft">
          Location sharing is off — your own sightings stay off the map. Enable it in{" "}
          <Link href="/settings" className="underline">
            Settings
          </Link>
          .
        </p>
      )}
    </div>
  );
}
