import type { Bias } from "@/lib/content";

const labels: Record<Bias, { full: string; short: string; icon: string }> = {
  bullish: { full: "Өсөх хандлага", short: "Өсөх", icon: "▲" },
  bearish: { full: "Буурах хандлага", short: "Буурах", icon: "▼" },
  neutral: { full: "Хүлээх", short: "Хүлээх", icon: "◆" },
};

const styles = {
  dark: {
    bullish: "bg-mg-mint/15 text-mg-mint",
    bearish: "bg-mg-orange/20 text-[#FF7A52]",
    neutral: "bg-mg-sky/15 text-[#8EC2FF]",
  },
  light: {
    bullish: "bg-[#DBFFF7] text-mg-mint-text",
    bearish: "bg-[#FFE6DE] text-[#B32600]",
    neutral: "bg-[#E3EEFF] text-[#0047B3]",
  },
  solid: {
    bullish: "bg-mg-navy text-mg-mint",
    bearish: "bg-mg-navy text-[#FF7A52]",
    neutral: "bg-mg-navy text-[#8EC2FF]",
  },
} as const;

export function BiasTag({
  bias,
  tone = "dark",
  short = false,
}: {
  bias: Bias;
  tone?: keyof typeof styles;
  short?: boolean;
}) {
  const l = labels[bias];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 font-bold text-xs ${styles[tone][bias]}`}
    >
      <span aria-hidden="true">{l.icon}</span>
      {short ? l.short : l.full}
    </span>
  );
}
