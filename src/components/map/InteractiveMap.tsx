"use client";

import { useEffect, useRef, useState, useCallback, type FC } from "react";
import L from "leaflet";
import type { MapPin } from "@/lib/types";
import {
  IconLocating,
  IconCompass,
  IconRadar,
  IconWarning,
  IconRefresh,
  IconShield,
} from "@/components/icons/AppIcons";

interface InteractiveMapProps {
  center: { lat: number; lng: number };
  pins: MapPin[];
  selectedPin: MapPin | null;
  onSelectPin: (pin: MapPin) => void;
  onRequestGps?: () => void;
  locating?: boolean;
  usingFallback?: boolean;
  className?: string;
}

// Inline SVG strings for marker icons (clean 20x20 line paths matching AppIcons)
const TAXON_SVGS: Record<string, string> = {
  mammal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 4 8 18 12 15 16 18 21 4 15 8 9 8 3 4"/><circle cx="12" cy="14" r="1"/></svg>`,
  bird: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 18Z"/><path d="m20 7 2 .5-2 1.5"/><path d="M10 18v3"/><path d="M14 17.75V21"/></svg>`,
  insect: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="12" x="8" y="7" rx="4"/><path d="m19 5-3 3"/><path d="m5 5 3 3"/><path d="M20 13h-4"/><path d="M4 13h4"/><line x1="12" x2="12" y1="11" y2="19"/></svg>`,
  reptile: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3c-1.5 0-3 1.5-3 3 0 2 2 3 2 5s-2 3-3 4-3 1-5 1-3 1-3 3 2 2 4 2c4 0 6-2 7-4s1-3 2-5c1.5-3 3-5 5-5a3 3 0 0 0-3-4h-6Z"/><circle cx="16" cy="6" r="1"/></svg>`,
  amphibian: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="2.5"/><circle cx="17" cy="8" r="2.5"/><path d="M5.5 10c0 4 3 7 6.5 7s6.5-3 6.5-7"/><path d="M9 13a3 3 0 0 0 6 0"/></svg>`,
  other: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h16a4 4 0 0 0 4-4c0-2.5-2-4-4.5-4H17"/><circle cx="12" cy="13" r="5"/><circle cx="20" cy="5" r=".75"/><circle cx="16" cy="5" r=".75"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
};

function getTaxonSvgString(taxon: string, isSensitive: boolean): string {
  if (isSensitive) return TAXON_SVGS.shield;
  const key = taxon.toLowerCase();
  return TAXON_SVGS[key] || TAXON_SVGS.other;
}

export const InteractiveMap: FC<InteractiveMapProps> = ({
  center,
  pins,
  selectedPin,
  onSelectPin,
  onRequestGps,
  locating = false,
  usingFallback = false,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [tileError, setTileError] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [initKey, setInitKey] = useState(0);

  // Cache initial center for map construction without re-triggering map recreation
  const initialCenterRef = useRef(center);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    // Guard against re-initialization on hot reload
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      const initCoords = initialCenterRef.current;
      const map = L.map(containerRef.current, {
        center: [initCoords.lat, initCoords.lng],
        zoom: 15,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false, // We render custom accessible zoom buttons
        attributionControl: false,
      });

      // Free tile layer: OpenStreetMap Standard Tiles (Zero API key, 100% free)
      const tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      });

      tileLayer.on("tileerror", () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      // Attribution control in bottom-right
      L.control
        .attribution({
          position: "bottomright",
          prefix: false,
        })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>')
        .addTo(map);

      // Layer group for pins
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      // User location pulse marker
      const userDivIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div class="user-pulse-marker" aria-label="Your approximate location">
            <div class="user-pulse-ring"></div>
            <div class="user-pulse-dot"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const userMarker = L.marker([initCoords.lat, initCoords.lng], {
        icon: userDivIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      userMarkerRef.current = userMarker;

      // Proximity ring: 250 m claimable zone
      const userCircle = L.circle([initCoords.lat, initCoords.lng], {
        radius: 250,
        color: "#2e6f40",
        weight: 2,
        dashArray: "6, 6",
        fillColor: "#4ade80",
        fillOpacity: 0.14,
      }).addTo(map);
      userCircleRef.current = userCircle;

      mapRef.current = map;
    } catch (err) {
      console.error("[InteractiveMap] Initialization failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to load map engine";
      setTimeout(() => {
        setInitError(msg);
      }, 0);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initKey]);

  // Sync center updates smoothly
  useEffect(() => {
    if (!mapRef.current) return;
    const currentCenter = mapRef.current.getCenter();
    const distanceMoved = Math.hypot(currentCenter.lat - center.lat, currentCenter.lng - center.lng);

    // Pan if moved significantly
    if (distanceMoved > 0.0001) {
      mapRef.current.panTo([center.lat, center.lng], { animate: true, duration: 0.8 });
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([center.lat, center.lng]);
    }
    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([center.lat, center.lng]);
    }
  }, [center]);

  // Sync pins on the map
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    pins.forEach((pin) => {
      const isSelected = selectedPin?.sightingId === pin.sightingId;
      const isClaimable = Boolean(pin.isClaimableByViewer);
      const isSensitive = Boolean(pin.isSensitiveSpecies);
      const svgIcon = getTaxonSvgString(pin.taxon, isSensitive);

      const html = `
        <button
          type="button"
          class="pin-marker-btn ${isClaimable ? "claimable-bounce" : ""} ${isSelected ? "selected-pin" : ""}"
          aria-label="${pin.cardName ?? pin.taxon} sighting"
        >
          <span class="inline-flex items-center justify-center text-ink">
            ${svgIcon}
          </span>
          ${isClaimable ? '<span class="pin-badge">CLAIM</span>' : ""}
        </button>
      `;

      const divIcon = L.divIcon({
        className: "custom-pin-marker",
        html,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([pin.approxLat, pin.approxLng], {
        icon: divIcon,
        zIndexOffset: isSelected ? 500 : isClaimable ? 300 : 100,
      });

      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectPin(pin);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [pins, selectedPin, onSelectPin]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleRecenter = useCallback(() => {
    if (onRequestGps) {
      onRequestGps();
    }
    if (mapRef.current) {
      mapRef.current.flyTo([center.lat, center.lng], 15, { duration: 0.8 });
    }
  }, [center, onRequestGps]);

  const handleRetryInit = () => {
    setInitError(null);
    setTileError(false);
    setInitKey((k) => k + 1);
  };

  if (initError) {
    return (
      <div
        className={`doodle flex flex-col items-center justify-center p-6 text-center bg-[#fff8f0] ${className}`}
        style={{ minHeight: "420px" }}
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent mb-3">
          <IconWarning size={28} />
        </div>
        <h3 className="font-black text-sm text-ink mb-1">Map display unavailable</h3>
        <p className="text-xs text-inksoft max-w-xs mb-4">
          The map engine could not initialize on this view. You can retry or inspect sightings in list view below.
        </p>
        <button onClick={handleRetryInit} className="btn btn-accent inline-flex items-center gap-1.5 text-xs">
          <IconRefresh size={14} />
          <span>Retry Map</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-2 border-ink bg-[#e8efdd] shadow-md ${className}`}
      style={{ height: "440px" }}
    >
      {/* Map Container */}
      <div ref={containerRef} className="h-full w-full" tabIndex={0} aria-label="Interactive community sightings map" />

      {/* Offline / Tile Error Banner */}
      {tileError && (
        <div className="absolute top-2 inset-x-2 z-[500] flex items-center justify-between rounded-xl bg-amber-50/95 px-3 py-2 border border-amber-300 text-[11px] font-bold text-amber-900 shadow-sm backdrop-blur">
          <span className="inline-flex items-center gap-1.5">
            <IconWarning size={14} className="text-amber-600 shrink-0" />
            <span>Tile network slow; displaying local sightings overlay.</span>
          </span>
          <button
            onClick={() => setTileError(false)}
            className="text-[10px] underline hover:text-amber-950 font-black ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Floating Recenter & Compass Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          disabled={locating}
          className="doodle-soft grid h-10 w-10 place-items-center bg-white/95 text-ink hover:bg-white active:scale-95 shadow-md border-2 border-ink transition-transform"
          aria-label="Recenter map to your location"
          title="Recenter map"
        >
          {locating ? <IconLocating size={18} className="text-accent" /> : <IconRadar size={18} />}
        </button>

        <div className="doodle-soft flex flex-col rounded-xl overflow-hidden bg-white/95 border-2 border-ink shadow-md">
          <button
            onClick={handleZoomIn}
            className="grid h-8 w-10 place-items-center text-base font-black hover:bg-black/5 active:bg-black/10 border-b border-ink/20"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="grid h-8 w-10 place-items-center text-base font-black hover:bg-black/5 active:bg-black/10"
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      {/* Floating Compass Rose */}
      <div className="absolute top-3 left-3 z-[400] pointer-events-none">
        <div className="doodle-soft flex items-center gap-1.5 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink border-2 border-ink shadow-sm">
          <IconCompass size={14} className="text-leaf" />
          <span>North</span>
        </div>
      </div>

      {/* Bottom Status & 250m Proximity Legend */}
      <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
        <div className="doodle-soft bg-white/90 px-2.5 py-1 text-[10px] font-bold text-inksoft border border-ink/30 shadow-sm backdrop-blur inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-leaf inline-block" />
          <span>{usingFallback ? "Estimated location (GPS unavailable)" : "Live GPS"} · 250 m claim zone</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
