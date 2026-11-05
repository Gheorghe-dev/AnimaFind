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
    <div className="space-y-3 px-margin-mobile">
      {/* Header & GPS button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Community Map</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            OpenStreetMap · Real-time neighbourhood field notes
          </p>
        </div>
        <button
          type="button"
          onClick={requestGps}
          disabled={locating}
          className="bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-xl font-label-md text-label-md font-bold text-primary inline-flex items-center gap-1.5 active:scale-95 shadow-sm transition-all"
          aria-label="Refresh GPS location"
        >
          {locating ? <IconLocating size={14} className="text-secondary" /> : <IconRadar size={14} />}
          <span>{locating ? "Locating…" : "Recenter"}</span>
        </button>
      </div>

      {/* Safety & Ethics Advisory */}
      <div className="bg-surface-container-low border border-primary/10 rounded-xl p-space-sm font-body-sm text-body-sm text-on-surface-variant flex items-start gap-2 shadow-xs">
        <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">shield_lock</span>
        <div>
          <strong className="text-primary font-semibold">Pins are approximate past sightings, not live animal locations.</strong> Common species are
          fuzzed to ~150 m; sensitive species are fuzzed to ~5 km or kept confidential. Never track,
          bait, or corner wildlife in nature.
        </div>
      </div>

      {/* Taxa Filter Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 font-label-md text-label-md no-scrollbar">
        <button
          type="button"
          onClick={() => setFilterTaxon("all")}
          className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
            filterTaxon === "all"
              ? "bg-primary text-on-primary shadow-sm"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
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
              type="button"
              onClick={() => setFilterTaxon(t.toLowerCase())}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
                active
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <TaxonIcon taxon={t} size={13} className={active ? "text-on-primary" : "text-primary"} />
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

      {loading && (
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant animate-pulse">
          Reading the community field notes…
        </p>
      )}

      {!loading && filteredPins.length === 0 && (
        <div className="bg-surface-container p-5 rounded-xl text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-surface-container-high mx-auto mb-2 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">map</span>
          </div>
          <p className="font-headline-md text-headline-md text-primary font-bold">No nearby sightings in this category yet.</p>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant max-w-xs mx-auto">
            Be the first naturalist to explore this area! Verified sightings will appear here as community pins.
          </p>
          <Link href="/" className="mt-3 bg-secondary text-on-secondary px-4 py-2 rounded-xl font-label-md text-label-md font-bold uppercase inline-block shadow-sm">
            Start Scanning
          </Link>
        </div>
      )}

      {/* Sightings List */}
      <div className="space-y-2 pt-1">
        {filteredPins.map((pin) => (
          <button
            key={pin.sightingId}
            type="button"
            onClick={() => setSelected(pin)}
            className="bg-surface-container-low hover:bg-surface-container rounded-xl flex w-full items-center gap-3 p-2.5 text-left transition-all active:scale-[0.99] border border-primary/10 shadow-xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pin.thumbnailUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-lg object-cover bg-surface-container-high border border-outline/20"
            />
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-1.5">
                <TaxonIcon taxon={pin.taxon} size={14} className="text-secondary shrink-0" />
                <span className="font-label-md text-label-md text-primary font-bold truncate">
                  {pin.cardName ?? pin.taxon}
                </span>
              </span>
              <span className="block font-body-sm text-[11px] text-on-surface-variant truncate mt-0.5">
                {pin.species ?? pin.taxon} · by {pin.byUsername} ·{" "}
                {pin.distanceMeters != null ? `${pin.distanceMeters} m` : "distance unknown"} · {pin.precision}
              </span>
            </span>
            {pin.isClaimableByViewer && (
              <span className="font-label-sm text-[10px] font-bold text-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded-full shrink-0">
                CLAIMABLE
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Selected Pin Bottom Sheet / Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-primary/75 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="my-auto w-full max-w-sm max-h-[90vh] overflow-y-auto space-y-3 p-4 bg-surface-container-lowest rounded-2xl border border-primary/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <TaxonIcon taxon={selected.taxon} size={16} />
                </div>
                <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-wider">
                  {selected.taxon}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-surface-container text-on-surface-variant"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.thumbnailUrl}
                alt=""
                className="h-44 w-44 rounded-xl object-cover border border-outline/20"
              />
              <div className="h-44 w-44 shrink-0 rounded-xl border border-dashed border-outline/30 flex items-center justify-center text-center font-label-sm text-[10px] text-on-surface-variant p-3 bg-surface-container">
                3D specimen preview
                <br />
                (unlocked after capture)
              </div>
            </div>

            <div>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                {selected.cardName ?? "Community sighting"}
              </h2>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                {selected.species ?? selected.taxon} · logged by {selected.byUsername} on{" "}
                {new Date(selected.timestamp).toLocaleDateString()} · {selected.precision}
              </p>
            </div>

            {selected.isSensitiveSpecies && (
              <div className="bg-tertiary-fixed text-tertiary px-2.5 py-1.5 rounded-lg font-body-sm text-[10px] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Protected species: exact location permanently fuzzed for wildlife conservation.</span>
              </div>
            )}

            {selected.isClaimableByViewer ? (
              <Link
                href={`/?pin=${selected.sightingId}`}
                className="w-full bg-secondary text-on-secondary py-2.5 rounded-xl font-label-md text-label-md font-bold uppercase text-center block shadow-sm"
              >
                Scan here for a linked card
              </Link>
            ) : (
              <button
                type="button"
                className="w-full bg-surface-container text-on-surface-variant py-2.5 rounded-xl font-label-md text-label-md font-bold"
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

            <button
              type="button"
              className="w-full bg-surface-container-high text-primary py-2 rounded-xl font-label-sm text-label-sm font-bold uppercase"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {!me?.user.locationConsent && (
        <p className="text-center font-label-sm text-label-sm text-on-surface-variant">
          Location sharing is off — your own sightings stay off the map. Enable it in{" "}
          <Link href="/settings" className="underline font-bold text-primary">
            Settings
          </Link>
          .
        </p>
      )}
    </div>
  );
}
