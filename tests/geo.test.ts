import { describe, it } from "node:test";
import assert from "node:assert";
import { haversineMeters, fuzzCoords, PROXIMITY_METERS } from "@/lib/geo";

describe("Geospatial & Coordinate Fuzzing Engine", () => {
  it("calculates haversine distance between two points accurately", () => {
    // 0 distance for identical points
    assert.strictEqual(haversineMeters(44.4268, 26.1025, 44.4268, 26.1025), 0);

    // Approximate distance between Bucharest (44.4268, 26.1025) and Ploiesti (44.9385, 26.0227) is ~57-60 km
    const dist = haversineMeters(44.4268, 26.1025, 44.9385, 26.0227);
    assert.ok(dist > 55000 && dist < 65000, `Expected ~58km, got ${dist}`);

    // Equator 1 degree longitude is ~111.3 km
    const eqDist = haversineMeters(0, 0, 0, 1);
    assert.ok(eqDist > 110000 && eqDist < 112000, `Equator 1 deg should be ~111.3km, got ${eqDist}`);
  });

  it("fuzzes non-sensitive species coords within standard neighbourhood bounds (~150m)", () => {
    const lat = 44.4268;
    const lng = 26.1025;
    const fuzzed = fuzzCoords(lat, lng, false, "seed-test-1");

    // The 2D coordinate must be displaced from original
    assert.ok(fuzzed.lat !== lat || fuzzed.lng !== lng, "At least one coordinate axis must be displaced");

    const offsetMeters = haversineMeters(lat, lng, fuzzed.lat, fuzzed.lng);
    assert.ok(offsetMeters <= 300, `Non-sensitive fuzzing should stay close, got ${offsetMeters}m`);
    assert.ok(offsetMeters >= 10, `Non-sensitive fuzzing should displace by at least 10m, got ${offsetMeters}m`);
  });

  it("fuzzes sensitive species coords within safety bounds (~5km) to protect wildlife", () => {
    const lat = 44.4268;
    const lng = 26.1025;
    const fuzzed = fuzzCoords(lat, lng, true, "seed-sensitive-1");

    const offsetMeters = haversineMeters(lat, lng, fuzzed.lat, fuzzed.lng);
    assert.ok(offsetMeters > 500, `Sensitive species offset should be significant (>500m), got ${offsetMeters}m`);
    assert.ok(offsetMeters <= 7500, `Sensitive species offset should not exceed ~7.5km, got ${offsetMeters}m`);
  });

  it("produces deterministic fuzzing for the same seed", () => {
    const a = fuzzCoords(44.4268, 26.1025, false, "consistent-seed");
    const b = fuzzCoords(44.4268, 26.1025, false, "consistent-seed");
    assert.strictEqual(a.lat, b.lat);
    assert.strictEqual(a.lng, b.lng);
  });

  it("enforces the standard 250m community proximity threshold", () => {
    assert.strictEqual(PROXIMITY_METERS, 250);
  });
});
