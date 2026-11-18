// The 8-week Trading Lab programme: every week each of the 4 teachers gives
// one lecture. Teachers, their order and levels come from `team` in content.ts.

export const PROGRAM_WEEKS = [
  "12.01–12.07",
  "12.08–12.14",
  "12.15–12.21",
  "12.22–12.28",
  "12.29–01.04",
  "01.05–01.11",
  "01.12–01.18",
  "01.19–01.25",
] as const;

/** One topic per week, keyed by team member id. */
export const PROGRAM_TOPICS: Record<string, readonly string[]> = {
  namuunzul: [
    "Forex зах зээлийн үндэс ба арилжааны ойлголт",
    "Trading Platform ба Candlestick Analysis",
    "Dow Theory ба Market Structure",
    "Support, Resistance ба Price Action",
    "Fibonacci ба Volume Analysis",
    "Technical Indicators ба Multi-Timeframe",
    "Risk Management ба Trading Psychology",
    "Trading Strategy ба Practical Trading",
  ],
  temuujin: [
    "Мэргэжлийн трейдерийн сэтгэлгээ ба ханш хөдлөх механизм",
    "Market Structure ба Multi-Timeframe (гүнзгий)",
    "Liquidity, Supply ба Demand Zone",
    "Entry Model ба Confluence",
    "Advanced Risk ба Trade Management",
    "Strategy Development ба Backtesting",
    "Live Market Analysis Lab",
    "Trading Plan Defense ба мэргэжлийн зам",
  ],
  altangerel: [
    "Шийдвэр ба үр дүн, хүлээлт",
    "Дөрвөн мэдрэмж, ЗОГС дохио, хоёр өөр хүсэл",
    "Зургаан алдаа, эрсдэлийн хувь, дүрмийн мөр",
    "Биеийн мэдрэмжийг эрт таних, таван стратеги",
    "Бичмэл төлөвлөгөө, гурван хязгаар, Leverage",
    "Нөхөх хүсэл ба хэт итгэл, цувааны протокол",
    "Хэт итгэл, хэв маяг, үнэт зүйл, сэдэл",
    "Том алдагдал, дахилт, тусламж, нэг хуудас төлөвлөгөө",
  ],
  munkhsaikhan: [
    "Fundamental Analysis-ийн үндэс",
    "Central Banks ба Monetary Policy",
    "Macroeconomic Indicators",
    "News Trading ба мэдээний эрсдэл",
    "Intermarket Analysis",
    "Market Sentiment ба COT тайлан",
    "Fundamental Bias тогтоох",
    "Нэгтгэл: макрогоос арилжаа хүртэл",
  ],
};

export const PROGRAM_NOTE =
  "Долоо хоног бүр 4 багш тус бүр 1 лекц орно. Арилжаа нь эрсдэлтэй — сургалт нь боловсролын зорилготой.";

/** The full syllabus shown under the schedule. To update it, replace the file and its page count. */
export const PROGRAM_PDF = {
  href: "/program/million-goats-hutulbur.pdf",
  fileName: "Million Goats хөтөлбөр.pdf",
  pages: 29,
};

/** Weekly class times (Ulaanbaatar time). Teacher names come from `team` by id. */
export const CLASS_SCHEDULE: {
  day: string;
  /** Label above the weekday, as on the printed schedule. */
  ordinal: string;
  time: string;
  duration: string;
  title: string;
  /** Module code from the syllabus (М1–М4); none for the community meeting. */
  module?: string;
  teacher?: string;
  highlight?: boolean;
}[] = [
  {
    day: "Даваа",
    ordinal: "1 дэх өдөр",
    time: "11:00 – 12:30",
    duration: "90 минут",
    module: "М3",
    title: "Трейдингийн сэтгэл зүй",
    teacher: "altangerel",
  },
  {
    day: "Мягмар",
    ordinal: "2 дахь өдөр",
    time: "18:00 – 19:30",
    duration: "90 минут",
    module: "М4",
    title: "Фундаментал шинжилгээ",
    teacher: "munkhsaikhan",
  },
  {
    day: "Лхагва",
    ordinal: "3 дахь өдөр",
    time: "12:00 – 13:30",
    duration: "90 минут",
    module: "М1",
    title: "Анхан шат",
    teacher: "namuunzul",
  },
  {
    day: "Пүрэв",
    ordinal: "4 дэх өдөр",
    time: "15:00 – 16:30",
    duration: "90 минут",
    module: "М2",
    title: "Дунд ба гүнзгийрүүлсэн шат",
    teacher: "temuujin",
  },
  {
    day: "Баасан",
    ordinal: "5 дахь өдөр",
    time: "12:00 – 00:00",
    duration: "12 цаг",
    title: "Community meeting",
    highlight: true,
  },
];

export const CLASS_LOCATION = "Улаанбаатарын Их Сургууль, 4 давхар";
