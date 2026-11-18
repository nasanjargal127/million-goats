// Site copy and navigation.

export const navLinks = [
  { href: "/#about", label: "Бидний тухай" },
  { href: "/#team", label: "Манай баг" },
  { href: "/program", label: "Хөтөлбөр" },
  { href: "/lab", label: "Trading Lab" },
  { href: "/merch", label: "Merch" },
] as const;

// TODO: add real profile URLs; entries without an href render as plain text.
export const socialLinks: { label: string; href?: string }[] = [
  { label: "Facebook", href: "https://www.facebook.com/milliongoats" },
  { label: "Instagram", href: "https://www.instagram.com/milliongoats" },
  { label: "YouTube", href: "https://www.youtube.com/@milliongoat" },
];

export type TeamMember = {
  /** Used in links, e.g. /program#namuunzul. */
  id: string;
  name: string;
  /** Short name the community knows them by, shown as a badge. */
  nickname?: string;
  /** The level or subject they teach; also the column title on /program. */
  role: string;
  photo: string;
  /** Vertical focus of the portrait crop (CSS object-position y). */
  focus: string;
  /** Education and experience, one line each. */
  points: string[];
  /** Certifications, shown as chips. */
  tags?: string[];
};

/** In programme order: 1 Анхан шат … 4 Фундаментал шинжилгээ. */
export const team: TeamMember[] = [
  {
    id: "namuunzul",
    name: "О. Намуунзул",
    role: "Анхан шат",
    photo: "/team/namuunzul.webp",
    focus: "38%",
    points: [
      "2019 оноос хойш арилжаа хийж байгаа",
      "Мэргэжлээрээ 4 жилийн турш брокерийн болон prop firm байгууллагад ажиллаж байсан",
      "СЭЗИС — Мэдээллийн систем; одоо СЭЗИС-д UI/UX багш",
    ],
    tags: ["7+ жилийн туршлага"],
  },
  {
    id: "temuujin",
    name: "Т. Тэмүүжин",
    nickname: "NIJU",
    role: "Дунд ба гүнзгий шат",
    photo: "/team/temuujin.webp",
    focus: "42%",
    points: ["2017 оноос хойш арилжаа хийж буй, 9+ жилийн туршлагатай ахлах трейдер"],
    tags: ["9+ жилийн туршлага"],
  },
  {
    id: "altangerel",
    name: "З. Алтангэрэл",
    role: "Трейдингийн сэтгэл зүй",
    photo: "/team/altangerel.webp",
    focus: "30%",
    points: ["Сэтгэл судлалын докторант", "ШУТИС — Бизнесийн удирдлага", "МУБИС — Сэтгэл судлал"],
    tags: ["EMDR", "MBCT", "NLP Practitioner & Coach", "Hypnosis", "CTAA & CPD"],
  },
  {
    id: "munkhsaikhan",
    name: "Б. Мөнхсайхан",
    nickname: "MC",
    role: "Фундаментал шинжилгээ",
    photo: "/team/munkhsaikhan.webp",
    focus: "42%",
    points: [
      "San Francisco State University — Эдийн засаг, санхүү",
      "Berkeley College — Эдийн засаг, санхүү",
      "SFSU-ийн Эдийн засгийн тэнхимийн Academic Honors",
    ],
    tags: ["FTMO Bronze", "FTMO Silver"],
  },
];
