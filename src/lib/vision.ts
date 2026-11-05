import { SPECIES, type TaxonCategory } from "./game-data";

export type FrameFeatures = {
  luma: number;
  texture: number;
  edges: number;
  greenness: number;
  warmth: number;
  saturation: number;
  highFreq: number;
  motion: number;
};

const GRID = 32;

/** Downsamples the centre framing box to a 32x32 grid of features. */
export function extractFeatures(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  prev: Float32Array | null,
  outLuminance?: Float32Array,
): { features: FrameFeatures; luminance: Float32Array } {
  const boxSize = Math.floor(Math.min(width, height) * 0.72);
  const x0 = Math.floor((width - boxSize) / 2);
  const y0 = Math.floor((height - boxSize) / 2);
  const data = ctx.getImageData(x0, y0, boxSize, boxSize).data;

  const luminance = outLuminance && outLuminance.length === GRID * GRID ? outLuminance : new Float32Array(GRID * GRID);
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const step = boxSize / GRID;

  for (let gy = 0; gy < GRID; gy += 1) {
    for (let gx = 0; gx < GRID; gx += 1) {
      const px = Math.floor(gx * step + step / 2);
      const py = Math.floor(gy * step + step / 2);
      const i = (py * boxSize + px) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      rSum += r;
      gSum += g;
      bSum += b;
      luminance[gy * GRID + gx] = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }
  }

  const n = GRID * GRID;
  let lumaSum = 0;
  for (let i = 0; i < n; i += 1) lumaSum += luminance[i];
  const mean = lumaSum / n;
  let variance = 0;
  let edges = 0;
  let highFreq = 0;
  for (let y = 0; y < GRID; y += 1) {
    for (let x = 0; x < GRID; x += 1) {
      const v = luminance[y * GRID + x];
      variance += (v - mean) ** 2;
      if (x < GRID - 1) {
        const d = Math.abs(v - luminance[y * GRID + x + 1]);
        edges += d;
        if (d > 0.18) highFreq += 1;
      }
      if (y < GRID - 1) edges += Math.abs(v - luminance[(y + 1) * GRID + x]);
    }
  }
  variance /= n;
  edges /= n * 2;
  highFreq /= n;

  let motion = 0;
  if (prev) {
    for (let i = 0; i < n; i += 1) motion += Math.abs(luminance[i] - prev[i]);
    motion /= n;
  }

  const rMean = rSum / n;
  const gMean = gSum / n;
  const bMean = bSum / n;
  const maxC = Math.max(rMean, gMean, bMean);
  const minC = Math.min(rMean, gMean, bMean);

  return {
    luminance,
    features: {
      luma: mean,
      texture: Math.min(1, variance * 12),
      edges: Math.min(1, edges * 9),
      greenness: Math.max(0, (gMean - (rMean + bMean) / 2) / 128),
      warmth: Math.max(0, (rMean - bMean) / 128),
      saturation: maxC === 0 ? 0 : (maxC - minC) / maxC,
      highFreq,
      motion,
    },
  };
}

/** 64-bit average hash of the sampled grid — used to block duplicate photos. */
export function perceptualHash(luminance: Float32Array): string {
  const size = 8;
  const cells: number[] = [];
  const scale = GRID / size;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let sum = 0;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          sum += luminance[(y * scale + dy) * GRID + (x * scale + dx)];
        }
      }
      cells.push(sum / (scale * scale));
    }
  }
  const avg = cells.reduce((a, b) => a + b, 0) / cells.length;
  let hex = "";
  for (let i = 0; i < cells.length; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j += 1) nibble = (nibble << 1) | (cells[i + j] > avg ? 1 : 0);
    hex += nibble.toString(16);
  }
  return hex;
}

export type Detection = {
  confidence: number;
  taxon: TaxonCategory;
  ranking: { taxon: TaxonCategory; score: number }[];
  shortlist: string[];
  motionScore: number;
  screenScore: number;
};

/**
 * Lightweight multi-class heuristic detector. In the production app this is a
 * TFLite/COCO-SSD frame processor; here the same interface is fed by on-device
 * frame statistics so the whole pipeline (confidence gating, anti-cheat signals,
 * species shortlist) behaves identically.
 */
export function classify(f: FrameFeatures, motionAvg: number, moire: number): Detection {
  const scores: Record<TaxonCategory, number> = {
    Mammal: 0.35 + f.warmth * 0.8 + f.texture * 0.5 - f.greenness * 0.4,
    Bird: 0.3 + motionAvg * 2.4 + f.edges * 0.5 + (1 - f.saturation) * 0.25,
    Insect: 0.25 + f.highFreq * 1.6 + f.saturation * 0.4 - f.luma * 0.2,
    Reptile: 0.2 + f.greenness * 1.1 + f.texture * 0.7 - motionAvg * 1.2,
    Amphibian: 0.18 + f.greenness * 0.9 + f.saturation * 0.5 - f.edges * 0.3,
    Other: 0.22 + (1 - f.edges) * 0.5,
  };
  const ranking = (Object.entries(scores) as [TaxonCategory, number][])
    .map(([taxon, score]) => ({ taxon, score: Math.max(0, score) }))
    .sort((a, b) => b.score - a.score);

  const subject = Math.min(1, f.edges * 0.9 + f.texture * 0.7 + Math.min(0.35, motionAvg * 6));
  const confidence = Math.max(0, Math.min(0.99, subject * 0.85 + (f.luma > 0.08 && f.luma < 0.95 ? 0.12 : 0)));

  const top = ranking[0].taxon;
  const shortlist = SPECIES.filter((s) => s.taxon === top)
    .sort((a, b) => a.commonness - b.commonness)
    .slice(0, 6)
    .map((s) => s.label);

  return { confidence, taxon: top, ranking, shortlist, motionScore: motionAvg, screenScore: moire };
}

/** Moiré / rephotography estimate: repeated high-frequency banding + no parallax. */
export function moireScore(f: FrameFeatures, motionAvg: number) {
  const banding = Math.min(1, f.highFreq * 2.2);
  const staticness = motionAvg < 0.012 ? 1 : Math.max(0, 1 - motionAvg * 25);
  return Math.min(1, banding * 0.55 + staticness * 0.55);
}
