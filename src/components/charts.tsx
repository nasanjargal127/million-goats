import { makeCandles, makeSparkline } from "@/lib/chart";
import type { Bias } from "@/lib/content";

const W = 520;
const H = 260;

/** Illustrative candlestick chart (demo data, not live prices). */
export function CandleChart({
  label,
  seed = 7,
  levels = false,
}: {
  label: string;
  seed?: number;
  levels?: boolean;
}) {
  const { candles, bodyWidth } = makeCandles({ count: 34, width: W, height: H, seed, trend: 0.55 });
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full">
      {levels ? (
        <>
          <line
            x1="0"
            y1="36"
            x2={W}
            y2="36"
            stroke="#FF3600"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <line
            x1="0"
            y1="200"
            x2={W}
            y2="200"
            stroke="#00FFCE"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        </>
      ) : (
        <g stroke="rgba(255,255,255,0.12)">
          <line x1="0" y1="65" x2={W} y2="65" />
          <line x1="0" y1="130" x2={W} y2="130" />
          <line x1="0" y1="195" x2={W} y2="195" />
        </g>
      )}
      {candles.map((c) => {
        const color = c.up ? "#00FFCE" : "#FF3600";
        return (
          <g key={c.x}>
            <line
              x1={c.x}
              y1={c.wickTop}
              x2={c.x}
              y2={c.wickBottom}
              stroke={color}
              strokeWidth="1.2"
            />
            <rect
              x={c.x - bodyWidth / 2}
              y={c.bodyY}
              width={bodyWidth}
              height={c.bodyH}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}

const trendByBias: Record<Bias, number> = { bullish: 0.35, bearish: -0.35, neutral: 0.02 };

const biasColors: Record<Bias, { dark: string; light: string }> = {
  bullish: { dark: "#00FFCE", light: "#00B492" },
  bearish: { dark: "#FF3600", light: "#FF3600" },
  neutral: { dark: "#55A2FF", light: "#0068FF" },
};

/** Illustrative sparkline with a soft area fill. */
export function Sparkline({
  bias,
  seed,
  tone = "dark",
  className = "h-24",
}: {
  bias: Bias;
  seed: number;
  tone?: "dark" | "light";
  className?: string;
}) {
  const { line, area } = makeSparkline({
    count: 40,
    width: 320,
    height: 96,
    seed,
    trend: trendByBias[bias],
  });
  const color = biasColors[bias][tone];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 320 96"
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
    >
      <path d={area} fill={color} fillOpacity={tone === "dark" ? 0.14 : 0.1} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
