// Site copy and demo content. Bracketed values such as [ОГНОО] are placeholders
// for facts we don't have yet — replace them before launch.

export const navLinks = [
  { href: "/#about", label: "Бидний тухай" },
  { href: "/#services", label: "Сургалт" },
  { href: "/analysis", label: "Шинжилгээ" },
  { href: "/#live", label: "Live" },
  { href: "/#join", label: "Хамт олон" },
] as const;

// TODO: add real profile URLs; entries without an href render as plain text.
export const socialLinks: { label: string; href?: string }[] = [
  { label: "Facebook" },
  { label: "Instagram" },
  { label: "YouTube" },
  { label: "Discord" },
];

export type ServiceIcon = "live" | "chart" | "education" | "community";

export const services: {
  icon: ServiceIcon;
  title: string;
  body: string;
  cta: string;
  href: string;
}[] = [
  {
    icon: "live",
    title: "Live техник шинжилгээ",
    body: "Туршлагатай трейдерүүдтэй хамт зах зээлийг шууд дамжуулалтаар задлан шинжилнэ.",
    cta: "Хуваарь харах",
    href: "/#live",
  },
  {
    icon: "chart",
    title: "Өдрийн чарт",
    body: "Гол валютын хос, алт, индексийн өдөр тутмын шинжилгээ, чухал түвшингүүд.",
    cta: "Шинжилгээ унших",
    href: "/analysis",
  },
  {
    icon: "education",
    title: "Сургалт ба менторшип",
    body: "Анхан шатнаас мэргэжлийн түвшин хүртэлх бүтэцтэй хөтөлбөр, хувийн зөвлөгөө.",
    cta: "Хөтөлбөр үзэх",
    href: "/#services",
  },
  {
    icon: "community",
    title: "Хамт олон",
    body: "Ижил зорилготой трейдерүүдтэй санаа солилцож, сахилга бат, сэтгэлзүйгээ хамтдаа хөгжүүл.",
    cta: "Нэгдэх",
    href: "/#join",
  },
];

export const liveSessions = [
  {
    month: "[САР]",
    day: "[Ө]",
    title: "Live technical analysis with Niju Trader",
    meta: "[ЦАГ] (GMT+8) · Forex · Бүх түвшин",
  },
  {
    month: "[САР]",
    day: "[Ө]",
    title: "Алтны долоо хоногийн тойм — XAUUSD",
    meta: "[ЦАГ] (GMT+8) · Түүхий эд · Дунд шат",
  },
  {
    month: "[САР]",
    day: "[Ө]",
    title: "Эрсдэлийн менежмент ба трейдерийн сэтгэлзүй",
    meta: "[ЦАГ] (GMT+8) · Сургалт · Анхан шат",
  },
];

export type Bias = "bullish" | "bearish" | "neutral";
export type Category = "fx" | "gold" | "index" | "crypto";
export type Timeframe = "H1" | "H4" | "D1";

export type Analysis = {
  id: string;
  symbol: string;
  category: Category;
  timeframe: Timeframe;
  bias: Bias;
  date: string;
  summary: string;
  seed: number;
};

export const categoryLabels: Record<Category, string> = {
  fx: "Forex",
  gold: "Алт",
  index: "Индекс",
  crypto: "Крипто",
};

// Demo analyses — illustrative only, not trading signals.
export const analyses: Analysis[] = [
  {
    id: "gbpjpy",
    symbol: "GBPJPY",
    category: "fx",
    timeframe: "H4",
    bias: "bullish",
    date: "[ОГНОО]",
    summary: "Гол дэмжлэгийн бүсээс эргэн өссөн. Дараагийн эсэргүүцлийн түвшинг ажиглана.",
    seed: 3,
  },
  {
    id: "eurusd",
    symbol: "EURUSD",
    category: "fx",
    timeframe: "D1",
    bias: "bearish",
    date: "[ОГНОО]",
    summary: "Өдрийн чарт дээр доошлох бүтэц хадгалагдаж байна. Эвдрэлийн баталгааг хүлээнэ.",
    seed: 11,
  },
  {
    id: "xauusd",
    symbol: "XAUUSD",
    category: "gold",
    timeframe: "H1",
    bias: "neutral",
    date: "[ОГНОО]",
    summary: "Хүрээн дотор хэлбэлзэж байна. Аль нэг талд гарах хүртэл арилжаанд орохгүй.",
    seed: 5,
  },
  {
    id: "nas100",
    symbol: "NAS100",
    category: "index",
    timeframe: "H4",
    bias: "bullish",
    date: "[ОГНОО]",
    summary: "Өсөх сувгийн доод хилээс дэмжлэг авсан. Сувгийн дээд хилийг ажиглана.",
    seed: 3,
  },
  {
    id: "usdjpy",
    symbol: "USDJPY",
    category: "fx",
    timeframe: "H4",
    bias: "bearish",
    date: "[ОГНОО]",
    summary: "Эсэргүүцлийн бүсээс татагдсан. Дараагийн дэмжлэг хүртэлх хөдөлгөөнийг ажиглана.",
    seed: 11,
  },
];
