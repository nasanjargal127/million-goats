// Trading Lab packages offered when a seat is booked. Prices live here (not in
// the database) and are applied on the server when the order is created.

import { team } from "../content";
import type { Lang } from "./store";

export const LAB_PACKAGE_IDS = ["PRO", "PREMIUM_2M", "PREMIUM"] as const;
export type LabPackageId = (typeof LAB_PACKAGE_IDS)[number];

/** Pro's optional add-on. */
export const PSYCHOLOGIST_ADDON_MNT = 75_000;

/**
 * Pro members pick one teacher whose classes they join: the team from
 * content.ts, in its display order. The name is what the order stores.
 */
export const TEACHERS = team.map(({ name, role, psychologist }) => ({
  name,
  role,
  psychologist: psychologist === true,
}));

/** True when the chosen Pro teacher is the psychologist, so the add-on is not offered. */
export function teacherIsPsychologist(name: string | null) {
  return TEACHERS.some((t) => t.name === name && t.psychologist);
}

/** What both Premium packages include; they differ only in length and price. */
const PREMIUM_FEATURES: Record<Lang, string[]> = {
  mn: [
    "Хамт олон",
    "Million Goats Hub-д ширээ",
    "Заал",
    "Merch",
    "Бүх багшийн хичээл",
    "Сэтгэлзүйч",
  ],
  en: [
    "Community",
    "A desk at the Million Goats Hub",
    "Gym",
    "Merch",
    "Classes with every teacher",
    "Psychologist",
  ],
};

type PackageText = {
  tagline: string;
  /** How long the booking price covers, shown under the price. */
  period: string;
  features: string[];
  /** Price warning shown on the card, e.g. what later months cost. */
  notice?: string;
};

export const LAB_PACKAGES: Record<
  LabPackageId,
  {
    name: string;
    /** Charged at booking (the first month for Pro). */
    priceMnt: number;
    /**
     * A time-limited discount, display only: priceMnt is charged either way.
     * Until endsAt the card shows originalPriceMnt crossed out and the `until` note.
     */
    discount?: {
      originalPriceMnt: number;
      endsAt: Date;
      until: Record<Lang, string>;
    };
    text: Record<Lang, PackageText>;
  }
> = {
  PRO: {
    name: "Pro",
    priceMnt: 654_000,
    text: {
      mn: {
        tagline: "Өөрийн оффисоо бүтээ",
        period: "1 сар",
        features: [
          "Million Goats Hub-д өөрийн ширээтэй болно",
          "Merch",
          "4 багшийн нэгийг сонгон хичээлд нь суух",
        ],
        notice: "2 дахь сараас эхлэн сарын төлбөр 555,000₮ болно.",
      },
      en: {
        tagline: "Build your own office",
        period: "1 month",
        features: [
          "Your own desk at the Million Goats Hub",
          "Merch",
          "Join the classes of one of 4 teachers",
        ],
        notice: "From the 2nd month, Pro costs 555,000₮ per month.",
      },
    },
  },
  PREMIUM_2M: {
    name: "Premium",
    priceMnt: 1_480_000,
    text: {
      mn: { tagline: "Бүгдийг нэг дороос", period: "2 сар", features: PREMIUM_FEATURES.mn },
      en: { tagline: "Everything in one place", period: "2 months", features: PREMIUM_FEATURES.en },
    },
  },
  PREMIUM: {
    name: "Premium",
    priceMnt: 5_550_000,
    discount: {
      originalPriceMnt: 11_100_000,
      endsAt: new Date("2026-12-01T00:00:00+08:00"),
      until: {
        mn: "50% хямдрал зөвхөн 12-р сарын 1-ээс өмнө",
        en: "50% off only until Dec 1",
      },
    },
    text: {
      mn: { tagline: "Бүгдийг нэг дороос", period: "6 сар", features: PREMIUM_FEATURES.mn },
      en: { tagline: "Everything in one place", period: "6 months", features: PREMIUM_FEATURES.en },
    },
  },
};

/**
 * The 6-month Premium can be paid in parts instead of all at once; the total
 * stays the Premium price and each part is an equal share of it (the last part
 * takes any remainder). The first part is paid at booking and holds the seat.
 * If a later part is not paid by its deadline, the seat is released and the
 * parts already paid are not refunded. The 2-month Premium is always paid in full.
 *
 * - 2 parts: offered until twoPartsOpenUntil; the balance is due by twoPartsBalanceDueAt.
 * - 4 parts: always offered; part n is due within 30 × (n − 1) days of booking.
 */
export const PREMIUM_INSTALLMENTS = {
  twoPartsOpenUntil: new Date("2026-12-01T00:00:00+08:00"),
  twoPartsBalanceDueAt: new Date("2027-01-01T00:00:00+08:00"),
  fourPartsEveryDays: 30,
};

/** 1 = paid in full; 2 or 4 = paid in that many parts. */
export type PaymentParts = 1 | 2 | 4;
export type InstallmentParts = Exclude<PaymentParts, 1>;

const DAY_MS = 24 * 60 * 60_000;
/** Ulaanbaatar is UTC+8 all year. */
const UB_OFFSET_MS = 8 * 60 * 60_000;

/** The first midnight in Ulaanbaatar after `date`, so the whole of its day still counts. */
function ubMidnightAfter(date: Date) {
  const local = date.getTime() + UB_OFFSET_MS;
  return new Date(Math.floor(local / DAY_MS) * DAY_MS + DAY_MS - UB_OFFSET_MS);
}

/** Whether a new booking may still choose this many parts. */
export function installmentsOpen(parts: InstallmentParts, now = new Date()) {
  return parts === 4 || now < PREMIUM_INSTALLMENTS.twoPartsOpenUntil;
}

/** When part `part` (2 or later) of an order booked at `bookedAt` must be paid by. */
export function installmentDueAt(parts: InstallmentParts, part: number, bookedAt: Date) {
  if (parts === 2) return PREMIUM_INSTALLMENTS.twoPartsBalanceDueAt;
  const days = PREMIUM_INSTALLMENTS.fourPartsEveryDays * (part - 1);
  return ubMidnightAfter(new Date(bookedAt.getTime() + days * DAY_MS));
}

/** Mongolian ablative suffix after a day number, e.g. 1-ээс, 2-оос, 3-аас. */
function mnFrom(day: number) {
  const last = day % 10;
  if (last === 0) return day === 20 ? "оос" : "аас";
  return (["ээс", "оос", "аас", "өөс", "аас", "аас", "оос", "аас", "өөс"] as const)[last - 1];
}

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * A deadline as shown to people, e.g. "12-р сарын 26-аас өмнө" / "before Dec 26".
 * Deadlines are midnights in Ulaanbaatar, so the named day is not included.
 */
export function dueText(due: Date, lang: Lang = "mn") {
  const local = new Date(due.getTime() + UB_OFFSET_MS);
  const month = local.getUTCMonth();
  const day = local.getUTCDate();
  return lang === "mn"
    ? `${month + 1}-р сарын ${day}-${mnFrom(day)} өмнө`
    : `before ${EN_MONTHS[month]} ${day}`;
}

/** Packages whose discount is still running. */
export function discountedPackages(now = new Date()): LabPackageId[] {
  return LAB_PACKAGE_IDS.filter((id) => {
    const discount = LAB_PACKAGES[id].discount;
    return discount !== undefined && now < discount.endsAt;
  });
}

export const LOWEST_PACKAGE_PRICE_MNT = Math.min(
  ...LAB_PACKAGE_IDS.map((id) => LAB_PACKAGES[id].priceMnt),
);

/**
 * What the visitor picked with their seat. Teacher and add-on apply to Pro only;
 * paying in parts to the 6-month Premium only.
 */
export type LabChoice = {
  labPackage: LabPackageId;
  teacher: string | null;
  withPsychologist: boolean;
  parts: PaymentParts;
};

/** Checks untrusted input from the booking form; null when it is not a valid choice. */
export function parseLabChoice(input: unknown): LabChoice | null {
  if (typeof input !== "object" || input === null) return null;
  const { labPackage, teacher, withPsychologist, parts } = input as Record<string, unknown>;
  if (labPackage === "PREMIUM") {
    return {
      labPackage,
      teacher: null,
      withPsychologist: false,
      parts: parts === 2 || parts === 4 ? parts : 1,
    };
  }
  if (labPackage === "PREMIUM_2M") {
    return { labPackage, teacher: null, withPsychologist: false, parts: 1 };
  }
  if (labPackage === "PRO") {
    if (!TEACHERS.some((t) => t.name === teacher)) return null;
    return {
      labPackage,
      teacher: teacher as string,
      // Never charge the add-on on top of choosing the psychologist herself.
      withPsychologist: withPsychologist === true && !teacherIsPsychologist(teacher as string),
      parts: 1,
    };
  }
  return null;
}

export function labChoicePrice(choice: LabChoice) {
  const base = LAB_PACKAGES[choice.labPackage].priceMnt;
  return choice.withPsychologist ? base + PSYCHOLOGIST_ADDON_MNT : base;
}

/** One part of a price paid in `parts` parts (the last part takes the remainder). */
export function installmentPartMnt(total: number, parts: PaymentParts) {
  return Math.floor(total / parts);
}

/** What is paid at booking: the first part when paying in parts, else everything. */
export function labChoiceDueNow(choice: LabChoice) {
  return installmentPartMnt(labChoicePrice(choice), choice.parts);
}

/** Snapshot stored on the order, e.g. "Pro багц · 1 сар · О. Намуунзул · Сэтгэлзүйч". */
export function labChoiceLabel(choice: LabChoice) {
  const info = LAB_PACKAGES[choice.labPackage];
  return [
    `${info.name} багц`,
    info.text.mn.period,
    choice.teacher,
    choice.withPsychologist ? "Сэтгэлзүйч" : null,
    choice.parts > 1 ? `${choice.parts} хувааж төлөх` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
