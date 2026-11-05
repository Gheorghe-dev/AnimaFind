export function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Public map coordinates are never exact. Everyday sightings get ~150 m of
 * jitter; protected / sensitive species get ~5 km (or are dropped entirely).
 */
export function fuzzCoords(lat: number, lng: number, sensitive: boolean, seed: string) {
  const radius = sensitive ? 5000 : 150;
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const angle = ((h % 360) * Math.PI) / 180;
  const dist = radius * (0.35 + ((h >> 9) % 100) / 150);
  const dLat = (dist * Math.cos(angle)) / 111_320;
  const dLng = (dist * Math.sin(angle)) / (111_320 * Math.cos((lat * Math.PI) / 180) || 1);
  return {
    lat: Number((lat + dLat).toFixed(sensitive ? 2 : 4)),
    lng: Number((lng + dLng).toFixed(sensitive ? 2 : 4)),
  };
}

export const PROXIMITY_METERS = 250;
