// Fills the area around the shirts in a mockup with their fabric colour. The
// 3D shirt's traced outline doesn't follow the photo exactly, and its deep
// sides stretch whatever sits at the outline across the side of the shirt.
// The photo's own rim (highlights, shadow lines, anti-aliasing) would smear
// into streaks there, so the rim is replaced too: everything from a few pixels
// inside the shirt outwards takes the nearest inner fabric colour, softened so
// no streaks survive.

/** Pixels at least this opaque count as shirt. */
const SOLID_ALPHA = 250;
/** How far in from the photo's edge the fabric is trusted, in px. */
const RIM = 10;
/** Box-blur radius applied to the filled pixels, in px. */
const SOFTEN = 8;

/**
 * For every pixel, the index of the nearest pixel where `isSeed` holds and the
 * squared distance to it, by a two-pass nearest-seed sweep.
 */
function nearestSeed(isSeed: Uint8Array, w: number, h: number) {
  const n = w * h;
  const seed = new Int32Array(n).fill(-1);
  const dist = new Float32Array(n).fill(Number.POSITIVE_INFINITY);
  for (let i = 0; i < n; i++) {
    if (isSeed[i]) {
      seed[i] = i;
      dist[i] = 0;
    }
  }
  const relax = (i: number, x: number, y: number, j: number) => {
    const s = seed[j];
    if (s < 0) return;
    const dx = (s % w) - x;
    const dy = ((s / w) | 0) - y;
    const dd = dx * dx + dy * dy;
    if (dd < dist[i]) {
      dist[i] = dd;
      seed[i] = s;
    }
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (dist[i] === 0) continue;
      if (x > 0) relax(i, x, y, i - 1);
      if (y > 0) {
        relax(i, x, y, i - w);
        if (x > 0) relax(i, x, y, i - w - 1);
        if (x < w - 1) relax(i, x, y, i - w + 1);
      }
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (dist[i] === 0) continue;
      if (x < w - 1) relax(i, x, y, i + 1);
      if (y < h - 1) {
        relax(i, x, y, i + w);
        if (x < w - 1) relax(i, x, y, i + w + 1);
        if (x > 0) relax(i, x, y, i + w - 1);
      }
    }
  }
  return { seed, dist };
}

/** Separable box blur of the RGB channels, written back only where `mask` is set. */
function softenMasked(d: Uint8ClampedArray, mask: Uint8Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(w * h * 3);
  const size = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += d[(y * w + Math.min(w - 1, Math.max(0, k))) * 4 + c];
      for (let x = 0; x < w; x++) {
        tmp[(y * w + x) * 3 + c] = sum / size;
        const out = Math.max(0, x - r);
        const into = Math.min(w - 1, x + r + 1);
        sum += d[(y * w + into) * 4 + c] - d[(y * w + out) * 4 + c];
      }
    }
  }
  for (let x = 0; x < w; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) sum += tmp[(Math.min(h - 1, Math.max(0, k)) * w + x) * 3 + c];
      for (let y = 0; y < h; y++) {
        const i = y * w + x;
        if (mask[i]) d[i * 4 + c] = sum / size;
        const out = Math.max(0, y - r);
        const into = Math.min(h - 1, y + r + 1);
        sum += tmp[(into * w + x) * 3 + c] - tmp[(out * w + x) * 3 + c];
      }
    }
  }
}

/**
 * Replaces, in place, the shirts' rims and every pixel up to `maxDistance` px
 * outside them with softened inner fabric. `d` is RGBA, `w`×`h` pixels.
 */
export function bleedPixels(d: Uint8ClampedArray, w: number, h: number, maxDistance = 200) {
  const n = w * h;

  // Distance from each pixel to the nearest non-shirt pixel, to find the rim.
  const outside = new Uint8Array(n);
  for (let i = 0; i < n; i++) outside[i] = d[i * 4 + 3] < SOLID_ALPHA ? 1 : 0;
  const toOutside = nearestSeed(outside, w, h).dist;

  // Fabric we trust: shirt pixels at least RIM px from the edge.
  const inner = new Uint8Array(n);
  for (let i = 0; i < n; i++) inner[i] = toOutside[i] >= RIM * RIM ? 1 : 0;
  const { seed, dist } = nearestSeed(inner, w, h);

  const max2 = (maxDistance + RIM) ** 2;
  const filled = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (inner[i] || dist[i] > max2) continue;
    const s = seed[i] * 4;
    d[i * 4] = d[s];
    d[i * 4 + 1] = d[s + 1];
    d[i * 4 + 2] = d[s + 2];
    d[i * 4 + 3] = 255;
    filled[i] = 1;
  }
  softenMasked(d, filled, w, h, SOFTEN);
}

/** A canvas copy of `image` with `bleedPixels` applied. */
export function bleedEdges(image: HTMLImageElement | ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  bleedPixels(pixels.data, canvas.width, canvas.height);
  ctx.putImageData(pixels, 0, 0);
  return canvas;
}
