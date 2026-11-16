// Deterministic demo chart data. Charts on the site are illustrative only —
// swap these for real market data when a data source is connected.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number, mean: number, sd: number) {
  const u = 1 - rand();
  const v = rand();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export type Candle = {
  x: number;
  bodyY: number;
  bodyH: number;
  wickTop: number;
  wickBottom: number;
  up: boolean;
};

export function makeCandles(opts: {
  count: number;
  width: number;
  height: number;
  seed: number;
  trend: number;
  pad?: number;
}): { candles: Candle[]; bodyWidth: number } {
  const { count, width, height, seed, trend, pad = 6 } = opts;
  const rand = mulberry32(seed);
  const raw: { o: number; c: number; h: number; l: number }[] = [];
  let price = 100;
  for (let i = 0; i < count; i++) {
    const o = price;
    const c = o + gaussian(rand, trend, 1.6);
    const h = Math.max(o, c) + Math.abs(gaussian(rand, 0, 0.9));
    const l = Math.min(o, c) - Math.abs(gaussian(rand, 0, 0.9));
    raw.push({ o, c, h, l });
    price = c;
  }
  const max = Math.max(...raw.map((r) => r.h));
  const min = Math.min(...raw.map((r) => r.l));
  const y = (v: number) => pad + ((max - v) / (max - min)) * (height - 2 * pad);
  const step = width / count;
  const candles = raw.map((r, i) => {
    const top = Math.min(y(r.o), y(r.c));
    return {
      x: i * step + step / 2,
      bodyY: top,
      bodyH: Math.max(Math.abs(y(r.o) - y(r.c)), 1.5),
      wickTop: y(r.h),
      wickBottom: y(r.l),
      up: r.c >= r.o,
    };
  });
  return { candles, bodyWidth: step * 0.56 };
}
