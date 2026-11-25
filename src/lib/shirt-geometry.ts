// Builds the 3D T-shirt for the /merch viewer from a traced 2D outline.
// Front and back surfaces meet in a seam at the outline and bulge out
// symmetrically, so the torso has a rounded, body-like cross-section from
// above and both faces are convex. The bulge rises faster near the hem and
// shoulders than near the side seams, so the hem looks like a rolled edge
// rather than a knife edge.

import Delaunator from "delaunator";
import * as THREE from "three";

type Pt = readonly [number, number];

export type ShirtSurfaces = {
  front: THREE.BufferGeometry;
  back: THREE.BufferGeometry;
};

/** Distance between mesh points, in scene units. */
const STEP = 0.035;
/** How far in from a side seam the bulge reaches its full height. */
const ROUND = 0.42;
/** Half-thickness of the torso at its fullest. */
const PUFF = 0.27;
/**
 * Vertical distances count this many times over when measuring how far a point
 * is from the edge, so the hem, neck and shoulders round off over a short
 * distance while the side seams curve gently like a body.
 */
const VERTICAL_WEIGHT = 2.5;
const SMOOTHING_PASSES = 6;

function inside(p: Pt, poly: readonly Pt[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function edgeDistance(p: Pt, poly: readonly Pt[]) {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j];
    const dx = poly[i][0] - ax;
    const dy = poly[i][1] - ay;
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy)));
    best = Math.min(best, Math.hypot(p[0] - ax - t * dx, p[1] - ay - t * dy));
  }
  return best;
}

/**
 * Front and back surfaces of the shirt. `outline` is in scene units (x right,
 * y up, centred on the origin); `toUv` maps a point to texture coordinates for
 * each side's print.
 */
export function buildShirtSurfaces(
  outline: readonly Pt[],
  toUv: (x: number, y: number, side: "front" | "back") => [number, number],
): ShirtSurfaces {
  // Outline points every STEP, so the seam is smooth and Delaunay keeps to it.
  const points: Pt[] = [];
  for (let i = 0; i < outline.length; i++) {
    const [ax, ay] = outline[i];
    const [bx, by] = outline[(i + 1) % outline.length];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / STEP));
    for (let k = 0; k < n; k++) points.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  const edgeCount = points.length;

  // A staggered grid of interior points, kept clear of the outline.
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const rowStep = STEP * 0.866;
  for (let row = 0, y = minY + rowStep / 2; y < maxY; row++, y += rowStep) {
    for (let x = minX + (row % 2 ? STEP / 2 : 0); x < maxX; x += STEP) {
      const p: Pt = [x, y];
      if (inside(p, outline) && edgeDistance(p, outline) > STEP * 0.6) points.push(p);
    }
  }

  // Triangulate, then drop triangles outside the (concave) outline.
  const { triangles } = Delaunator.from(points);
  const tris: number[] = [];
  for (let i = 0; i < triangles.length; i += 3) {
    const [a, b, c] = [triangles[i], triangles[i + 1], triangles[i + 2]];
    const centroid: Pt = [
      (points[a][0] + points[b][0] + points[c][0]) / 3,
      (points[a][1] + points[b][1] + points[c][1]) / 3,
    ];
    if (!inside(centroid, outline)) continue;
    // Counter-clockwise in x-right/y-up, so the front faces +z.
    const area =
      (points[b][0] - points[a][0]) * (points[c][1] - points[a][1]) -
      (points[c][0] - points[a][0]) * (points[b][1] - points[a][1]);
    tris.push(...(area > 0 ? [a, b, c] : [a, c, b]));
  }

  // Puff height: a rounded edge profile, then smoothed so narrow parts like
  // the sleeves don't get a ridge down the middle. The seam stays at zero.
  const stretched = outline.map(([x, y]) => [x, y * VERTICAL_WEIGHT] as const);
  const height = points.map(([x, y], i) => {
    if (i < edgeCount) return 0;
    const s = Math.min(edgeDistance([x, y * VERTICAL_WEIGHT], stretched) / ROUND, 1);
    return PUFF * Math.sqrt(1 - (1 - s) ** 2);
  });
  const neighbours = points.map(() => new Set<number>());
  for (let i = 0; i < tris.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      neighbours[tris[i + k]].add(tris[i + ((k + 1) % 3)]);
      neighbours[tris[i + k]].add(tris[i + ((k + 2) % 3)]);
    }
  }
  for (let pass = 0; pass < SMOOTHING_PASSES; pass++) {
    const prev = height.slice();
    for (let i = edgeCount; i < points.length; i++) {
      let sum = 0;
      for (const n of neighbours[i]) sum += prev[n];
      height[i] = 0.5 * prev[i] + (0.5 * sum) / (neighbours[i].size || 1);
    }
  }

  const surface = (side: "front" | "back") => {
    const sign = side === "front" ? 1 : -1;
    const position = new Float32Array(points.length * 3);
    const uv = new Float32Array(points.length * 2);
    points.forEach(([x, y], i) => {
      position.set([x, y, sign * height[i]], i * 3);
      uv.set(toUv(x, y, side), i * 2);
    });
    // The back's triangles are flipped so it faces -z.
    const index = tris.slice();
    if (side === "back") {
      for (let i = 0; i < index.length; i += 3)
        [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setIndex(index);
    geo.computeVertexNormals();
    return geo;
  };

  return { front: surface("front"), back: surface("back") };
}
