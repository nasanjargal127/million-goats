/**
 * The logo's middle and lower rows rendered as thick 3D slabs on a lit blue
 * floor, after the hero mockup: black side slabs with bevelled edges that catch
 * the light, the lower "V" with a glowing notch, and depth of field (soft at the
 * top, sharp at the bottom). Pure SVG, so it scales with the viewport and costs
 * no image download. Coordinates follow the 2000×1120 mockup.
 */

type Point = readonly [number, number];

const LEFT_SLAB: Point[] = [
  [356, 396],
  [786, 396],
  [352, 824],
  [-80, 824],
];
const LOWER_V: Point[] = [
  [352, 836],
  [780, 836],
  [1000, 1046],
  [1220, 836],
  [1648, 836],
  [1184, 1300],
  [816, 1300],
];
const LEFT_FLOOR: Point[] = [
  [-100, 832],
  [352, 832],
  [816, 1300],
  [-100, 1300],
];

const mirror = (pts: Point[]): Point[] => pts.map(([x, y]) => [2000 - x, y] as const);
const toPoints = (pts: Point[]) => pts.map((p) => p.join(",")).join(" ");

/** A lit edge: a wide blurred glow under a bright core, coloured along its length. */
type Edge = {
  id: string;
  from: Point;
  to: Point;
  /** Colour at `from` and at `to`. */
  colors: readonly [string, string];
  width: number;
  glow?: string;
};

const leftEdges: Edge[] = [
  // Inner diagonal: the brightest bevel, blue at the top, near-white at the bottom
  {
    id: "l-in",
    from: [786, 396],
    to: [352, 824],
    colors: ["#1d4dc9", "#f2f6ff"],
    width: 26,
    glow: "#3f7bff",
  },
  // Outer diagonal
  {
    id: "l-out",
    from: [356, 396],
    to: [-80, 824],
    colors: ["#1a46c0", "#d9e4ff"],
    width: 20,
    glow: "#3a74ff",
  },
  // Top edge
  {
    id: "l-top",
    from: [356, 397],
    to: [786, 397],
    colors: ["#2a62ea", "#1f55e0"],
    width: 10,
    glow: "#1f5cff",
  },
  // Bottom edge
  {
    id: "l-bot",
    from: [-80, 829],
    to: [346, 829],
    colors: ["#c4d4ff", "#e2eaff"],
    width: 14,
    glow: "#5d8fff",
  },
  // Lower V: top edge (bright at the outer end) and notch (brightening toward the point)
  {
    id: "v-top",
    from: [360, 841],
    to: [776, 841],
    colors: ["#e0e9ff", "#8eaef6"],
    width: 12,
    glow: "#4d82ff",
  },
  {
    id: "v-notch",
    from: [782, 842],
    to: [1000, 1046],
    colors: ["#1b4bd2", "#79a8ff"],
    width: 7,
    glow: "#2f6bff",
  },
];

const mirrorEdge = (e: Edge): Edge => ({
  ...e,
  id: `${e.id}-r`,
  from: [2000 - e.from[0], e.from[1]],
  to: [2000 - e.to[0], e.to[1]],
});

const edges = [...leftEdges, ...leftEdges.map(mirrorEdge)];

function LitEdge({ id, from, to, colors, width, glow }: Edge) {
  const gid = `hb-${id}`;
  const d = `M ${from.join(" ")} L ${to.join(" ")}`;
  return (
    <>
      <defs>
        <linearGradient
          id={gid}
          gradientUnits="userSpaceOnUse"
          x1={from[0]}
          y1={from[1]}
          x2={to[0]}
          y2={to[1]}
        >
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      {glow && (
        <path
          d={d}
          stroke={glow}
          strokeWidth={width * 2.5}
          strokeLinecap="round"
          opacity="0.28"
          filter="url(#hb-glow)"
        />
      )}
      <path
        d={d}
        stroke={`url(#${gid})`}
        strokeWidth={width}
        strokeLinecap="round"
        filter="url(#hb-bevel)"
      />
    </>
  );
}

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <svg
        className="size-full"
        // Starts below the mockup's header strip, which the real header covers.
        viewBox="0 62 2000 1058"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          {/* Lit floor: brightest just above the V's point */}
          <radialGradient
            id="hb-floor"
            gradientUnits="userSpaceOnUse"
            cx="1000"
            cy="1010"
            r="640"
            gradientTransform="translate(1000 1010) scale(1.3 1) translate(-1000 -1010)"
          >
            <stop offset="0" stopColor="#0657d6" />
            <stop offset="0.17" stopColor="#0046ae" />
            <stop offset="0.33" stopColor="#003a94" />
            <stop offset="0.6" stopColor="#011f52" />
            <stop offset="0.78" stopColor="#011537" />
            <stop offset="0.88" stopColor="#021131" />
            <stop offset="1" stopColor="#020d27" />
          </radialGradient>
          <linearGradient id="hb-slab" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000104" />
            <stop offset="1" stopColor="#01050f" />
          </linearGradient>
          <linearGradient
            id="hb-floor-side"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="760"
            y2="0"
          >
            <stop offset="0" stopColor="#020b22" />
            <stop offset="1" stopColor="#05246a" />
          </linearGradient>
          <linearGradient
            id="hb-floor-side-r"
            gradientUnits="userSpaceOnUse"
            x1="2000"
            y1="0"
            x2="1240"
            y2="0"
          >
            <stop offset="0" stopColor="#020b22" />
            <stop offset="1" stopColor="#05246a" />
          </linearGradient>
          <linearGradient id="hb-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#010f3c" />
            <stop offset="1" stopColor="#011c62" />
          </linearGradient>
          <radialGradient id="hb-v-glow" gradientUnits="userSpaceOnUse" cx="1000" cy="1120" r="300">
            <stop offset="0" stopColor="#0a4fd0" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#0638a8" stopOpacity="0.5" />
            <stop offset="1" stopColor="#0638a8" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id="hb-top-fade"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="62"
            x2="0"
            y2="420"
          >
            <stop offset="0" stopColor="#020d27" stopOpacity="0.7" />
            <stop offset="1" stopColor="#020d27" stopOpacity="0" />
          </linearGradient>
          {/* Depth of field: the blurred copy shows at the top and fades out toward the bottom */}
          <linearGradient
            id="hb-dof-grad"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="62"
            x2="0"
            y2="1120"
          >
            <stop offset="0.38" stopColor="#fff" />
            <stop offset="0.72" stopColor="#000" />
          </linearGradient>
          <mask
            id="hb-dof-mask"
            maskUnits="userSpaceOnUse"
            x="-200"
            y="0"
            width="2400"
            height="1400"
          >
            <rect x="-200" y="0" width="2400" height="1400" fill="url(#hb-dof-grad)" />
          </mask>

          <filter
            id="hb-dof"
            filterUnits="userSpaceOnUse"
            x="-200"
            y="0"
            width="2400"
            height="1400"
          >
            <feGaussianBlur stdDeviation="11" />
          </filter>
          <filter
            id="hb-glow"
            filterUnits="userSpaceOnUse"
            x="-200"
            y="0"
            width="2400"
            height="1400"
          >
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter
            id="hb-bevel"
            filterUnits="userSpaceOnUse"
            x="-200"
            y="0"
            width="2400"
            height="1400"
          >
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter
            id="hb-rim"
            filterUnits="userSpaceOnUse"
            x="-200"
            y="0"
            width="2400"
            height="1400"
          >
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <clipPath id="hb-clip-l">
            <polygon points={toPoints(LEFT_SLAB)} />
          </clipPath>
          <clipPath id="hb-clip-r">
            <polygon points={toPoints(mirror(LEFT_SLAB))} />
          </clipPath>

          <g id="hb-scene">
            <rect x="-200" y="0" width="2400" height="1400" fill="url(#hb-floor)" />

            {/* Floor beside the lower V */}
            <polygon points={toPoints(LEFT_FLOOR)} fill="url(#hb-floor-side)" />
            <polygon points={toPoints(mirror(LEFT_FLOOR))} fill="url(#hb-floor-side-r)" />

            {/* Lower V, lit from its notch */}
            <polygon points={toPoints(LOWER_V)} fill="url(#hb-v)" />
            <polygon points={toPoints(LOWER_V)} fill="url(#hb-v-glow)" />
            {/* Its outer edges sit in shadow, with a thin blue rim */}
            <g fill="none" strokeLinecap="round">
              <path
                d="M 352 840 L 816 1300 M 1648 840 L 1184 1300"
                stroke="#000a24"
                strokeWidth="12"
              />
              <path
                d="M 364 842 L 826 1300 M 1636 842 L 1174 1300"
                stroke="#1b46b8"
                strokeWidth="3"
                opacity="0.7"
                filter="url(#hb-bevel)"
              />
            </g>

            {/* Underside of the top piece, just below the headline */}
            <path
              d="M 790 430 L 1210 430"
              stroke="#2b56b0"
              strokeWidth="14"
              opacity="0.55"
              filter="url(#hb-bevel)"
            />

            {/* Side slabs: near-black with a blue rim light inside the edges */}
            {(["l", "r"] as const).map((side) => {
              const pts = toPoints(side === "l" ? LEFT_SLAB : mirror(LEFT_SLAB));
              return (
                <g key={side}>
                  <polygon points={pts} fill="url(#hb-slab)" />
                  <g clipPath={`url(#hb-clip-${side})`}>
                    <polygon
                      points={pts}
                      fill="none"
                      stroke="#0b3cc4"
                      strokeWidth="80"
                      opacity="0.5"
                      filter="url(#hb-rim)"
                    />
                  </g>
                </g>
              );
            })}

            {/* Lit bevels */}
            <g fill="none">
              {edges.map((e) => (
                <LitEdge key={e.id} {...e} />
              ))}
            </g>

            {/* Glow where the notch meets */}
            <ellipse
              cx="1000"
              cy="1048"
              rx="70"
              ry="24"
              fill="#86b4ff"
              opacity="0.55"
              filter="url(#hb-glow)"
            />
          </g>
        </defs>

        <use href="#hb-scene" />
        <use href="#hb-scene" filter="url(#hb-dof)" mask="url(#hb-dof-mask)" />
        <rect x="-200" y="0" width="2400" height="1400" fill="url(#hb-top-fade)" />
      </svg>
    </div>
  );
}
