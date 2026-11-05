import { describe, it } from "node:test";
import assert from "node:assert";
import { perceptualHash, moireScore, classify, type FrameFeatures } from "@/lib/vision";
import { TAXA } from "@/lib/game-data";

describe("Computer Vision & Anti-Cheat Heuristics", () => {
  it("generates a 16-character 64-bit hexadecimal perceptual hash", () => {
    const grid = new Float32Array(32 * 32);
    // Fill with a gradient pattern
    for (let i = 0; i < grid.length; i++) {
      grid[i] = (i % 32) / 32;
    }
    const hash1 = perceptualHash(grid);
    assert.strictEqual(typeof hash1, "string");
    assert.strictEqual(hash1.length, 16, "Hash must be 16 hex chars (64 bits)");

    // Deterministic for same grid
    const hash2 = perceptualHash(grid);
    assert.strictEqual(hash1, hash2, "Identical frames must produce identical pHash");
  });

  it("produces different hashes for distinctly different images", () => {
    const gridA = new Float32Array(32 * 32);
    const gridB = new Float32Array(32 * 32);
    // Left-bright vs Right-bright
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        gridA[y * 32 + x] = x < 16 ? 0.9 : 0.1;
        gridB[y * 32 + x] = x >= 16 ? 0.9 : 0.1;
      }
    }
    const hashA = perceptualHash(gridA);
    const hashB = perceptualHash(gridB);
    assert.notStrictEqual(hashA, hashB, "Distinct images must have distinct hashes");
  });

  it("calculates moire scores to detect digital screen artifacts", () => {
    const naturalFeatures: FrameFeatures = {
      luma: 0.5,
      texture: 0.4,
      edges: 0.3,
      greenness: 0.3,
      warmth: 0.2,
      saturation: 0.4,
      highFreq: 0.05,
      motion: 0.03,
    };
    const naturalScore = moireScore(naturalFeatures, 0.03);

    const screenFeatures: FrameFeatures = {
      ...naturalFeatures,
      highFreq: 0.65, // extreme high-frequency grid interference
      texture: 0.9,
    };
    const screenScore = moireScore(screenFeatures, 0.001); // stationary monitor

    assert.ok(screenScore > naturalScore, `Screen score (${screenScore}) should exceed natural scene (${naturalScore})`);
  });

  it("classifies taxa and produces candidate shortlist and confidence bounds", () => {
    const features: FrameFeatures = {
      luma: 0.55,
      texture: 0.45,
      edges: 0.4,
      greenness: 0.5, // strong green foliage -> Insect / Amphibian / Bird bias
      warmth: 0.1,
      saturation: 0.5,
      highFreq: 0.1,
      motion: 0.04,
    };

    const result = classify(features, 0.04, 0.1);
    assert.ok(TAXA.includes(result.taxon), `Detected taxon ${result.taxon} must be a valid TaxonCategory`);
    assert.ok(result.confidence >= 0 && result.confidence <= 1, "Confidence must be within 0..1");
    assert.ok(Array.isArray(result.shortlist) && result.shortlist.length > 0, "Must provide species shortlist");
    assert.strictEqual(typeof result.motionScore, "number");
    assert.strictEqual(typeof result.screenScore, "number");
  });
});
