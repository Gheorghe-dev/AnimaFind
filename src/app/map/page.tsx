"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useApp } from "@/components/AppProvider";
import { TAXA, type TaxonCategory } from "@/lib/game-data";
import { gameApi } from "@/lib/api-client";
import type { MapPin } from "@/lib/types";
import {
  IconRadar,
  IconLocating,
  IconWarning,
  IconMap,
  IconShield,
  IconCompass,
  IconCross,
  TaxonIcon,
} from "@/components/icons/AppIcons";

const FALLBACK = { lat: 44.4268, lng: 26.1025 };

// Dynamic client-only Leaflet map to prevent SSR window/document reference errors
const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div
      className="doodle relative overflow-hidden flex flex-col items-center justify-center p-8 bg-[#e8efdd] border-2 border-ink text-center"
      style={{ height: "440px" }}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/90 border-2 border-ink shadow-sm mb-3">
        <IconCompass size={24} className="text-leaf animate-spin" />
      </div>
      <p className="font-black text-sm text-ink">Mapping the local terrain…</p>
      <p className="text-[11px] text-inksoft mt-1">Connecting to OpenStreetMap open tiles</p>
    </div>
  ),
});

export default function MapPage() {
  const { me, toast } = useApp();
  const [center, setCenter] = useState<{ lat: number; lng: number }>(FALLBACK);
  const [usingFallback, setUsingFallback] = useState(true);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [filterTaxon, setFilterTaxon] = useState<string>("all");

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

  const filteredPins = useMemo(() => {
    if (filterTaxon === "all") return pins;
    return pins.filter((p) => p.taxon.toLowerCase() === filterTaxon.toLowerCase());
  }, [pins, filterTaxon]);

  return (
    <div className="space-y-3">
      {/* Header & GPS button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Community map</h1>
          <p className="text-[11px] text-inksoft">OpenStreetMap · Real-time neighbourhood field notes</p>
        </div>
        <button
          onClick={requestGps}
          disabled={locating}
          className="doodle-soft bg-white/90 px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 hover:bg-white active:scale-95 shadow-sm border border-ink/20 transition-all"
          aria-label="Refresh GPS location"
        >
          {locating ? <IconLocating size={14} className="text-accent" /> : <IconRadar size={14} />}
          <span>{locating ? "Locating…" : "Recenter"}</span>
        </button>
      </div>

      {/* Safety & Ethics Advisory */}
      <div className="doodle-soft bg-[#fff8ee] border border-amber-200 px-3 py-2 text-[11px] leading-relaxed flex items-start gap-2 shadow-sm">
        <IconWarning size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Pins are approximate past sightings, not live animal locations.</strong> Everyday species are
          fuzzed to ~150 m; protected, rare, or endangered species are fuzzed to ~5 km or withheld. Never track,
          bait, or corner an animal in nature.
        </div>
      </div>

      {/* Taxa Filter Bar */}
      <div className="scrollhide flex gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setFilterTaxon("all")}
          className={`px-3 py-1 rounded-full border transition-all shrink-0 ${
            filterTaxon === "all"
              ? "bg-ink text-white border-ink shadow-sm"
              : "bg-white/80 border-ink/20 text-ink hover:bg-white"
          }`}
        >
          All ({pins.length})
        </button>
        {TAXA.map((t) => {
          const count = pins.filter((p) => p.taxon.toLowerCase() === t.toLowerCase()).length;
          const active = filterTaxon === t.toLowerCase();
          return (
            <button
              key={t}
              onClick={() => setFilterTaxon(t.toLowerCase())}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all shrink-0 ${
                active
                  ? "bg-ink text-white border-ink shadow-sm"
                  : "bg-white/80 border-ink/20 text-ink hover:bg-white"
              }`}
            >
              <TaxonIcon taxon={t} size={13} className={active ? "text-white" : "text-ink"} />
              <span>{t}</span>
              {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Real Interactive Leaflet Map */}
      <InteractiveMap
        center={center}
        pins={filteredPins}
        selectedPin={selected}
        onSelectPin={(pin) => setSelected(pin)}
        onRequestGps={requestGps}
        locating={locating}
        usingFallback={usingFallback}
      />

      {loading && <p className="text-center text-xs font-bold text-inksoft animate-pulse">Reading the field notes…</p>}

      {!loading && filteredPins.length === 0 && (
        <div className="doodle tape p-5 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-paper2 border-2 border-ink mx-auto mb-2 text-ink">
            <IconMap size={24} />
          </div>
          <p className="font-black text-sm">No nearby sightings in this category yet.</p>
          <p className="mt-1 text-xs text-inksoft leading-relaxed max-w-xs mx-auto">
            Be the first naturalist to explore this area! Verified sightings will appear here as community pins.
          </p>
          <Link href="/" className="btn btn-accent mt-3 inline-block">
            Start Scanning
          </Link>
        </div>
      )}

      {/* Sightings List */}
      <div className="space-y-2 pt-1">
        {filteredPins.map((pin) => (
          <button
            key={pin.sightingId}
            onClick={() => setSelected(pin)}
            className="doodle flex w-full items-center gap-3 p-2.5 text-left transition-transform hover:translate-x-0.5 active:scale-[0.99] border-2 border-ink shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pin.thumbnailUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg border-2 border-ink object-cover bg-white"
            />
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5">
                <TaxonIcon taxon={pin.taxon} size={14} className="text-leaf shrink-0" />
                <span className="text-xs font-black truncate">{pin.cardName ?? pin.taxon}</span>
              </span>
              <span className="block text-[10px] text-inksoft truncate mt-0.5">
                {pin.species ?? pin.taxon} · by {pin.byUsername} ·{" "}
                {pin.distanceMeters != null ? `${pin.distanceMeters} m` : "distance unknown"} · {pin.precision}
              </span>
            </span>
            {pin.isClaimableByViewer && (
              <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/30 shrink-0">
                CLAIMABLE
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected Pin Bottom Sheet / Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="doodle my-auto w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-3 p-4 bg-white border-2 border-ink shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-leaf/10 text-leaf">
                  <TaxonIcon taxon={selected.taxon} size={16} />
                </div>
                <span className="text-xs font-bold text-inksoft uppercase tracking-wider">{selected.taxon}</span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5 text-inksoft hover:text-ink"
                aria-label="Close modal"
              >
                <IconCross size={16} />
              </button>
            </div>

            <div className="scrollhide flex gap-2 overflow-x-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.thumbnailUrl}
                alt=""
                className="h-44 w-44 rounded-xl border-2 border-ink object-cover"
              />
              <div className="grid h-44 w-44 shrink-0 place-items-center rounded-xl border-2 border-dashed border-ink/40 text-center text-[10px] text-inksoft p-3 bg-paper">
                3D specimen preview
                <br />
                (unlocked after capture)
              </div>
            </div>

            <div>
              <h2 className="text-lg font-black">{selected.cardName ?? "Community sighting"}</h2>
              <p className="text-[11px] text-inksoft">
                {selected.species ?? selected.taxon} · logged by {selected.byUsername} on{" "}
                {new Date(selected.timestamp).toLocaleDateString()} · {selected.precision}
              </p>
            </div>

            {selected.isSensitiveSpecies && (
              <div className="doodle-soft bg-[#fff8ee] border border-amber-200 px-2.5 py-1.5 text-[10px] text-amber-900 flex items-center gap-1.5">
                <IconShield size={14} className="text-amber-700 shrink-0" />
                <span>Protected species: exact location permanently withheld for conservation.</span>
              </div>
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
