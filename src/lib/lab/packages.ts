// Trading Lab packages offered when a seat is booked. Prices live here (not in
// the database) and are applied on the server when the order is created.

import type { Lang } from "./store";

export const LAB_PACKAGE_IDS = ["PRO", "PREMIUM"] as const;
export type LabPackageId = (typeof LAB_PACKAGE_IDS)[number];

/** Pro's optional add-on. */
export const PSYCHOLOGIST_ADDON_MNT = 75_000;

/** Pro members pick one teacher whose classes they join. Rename here. */
export const TEACHERS = ["Багш 1", "Багш 2", "Багш 3", "Багш 4"] as const;

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
  PREMIUM: {
    name: "Premium",
    priceMnt: 5_550_000,
    text: {
      mn: {
        tagline: "Бүгдийг нэг дороос",
        period: "6 сар",
        features: [
          "Хамт олон",
          "Million Goats Hub-д ширээ",
          "Заал",
          "Merch",
          "Бүх багшийн хичээл",
          "Сэтгэлзүйч",
        ],
      },
      en: {
        tagline: "Everything in one place",
        period: "6 months",
        features: [
          "Community",
          "A desk at the Million Goats Hub",
          "Gym",
          "Merch",
          "Classes with every teacher",
          "Psychologist",
        ],
      },
    },
  },
};

/**
 * Premium can be paid in two parts: the first by firstDueAt, the rest by
 * balanceDueAt (midnight in Ulaanbaatar). The total stays the Premium price.
 * Until the balance is paid the seat is held; after balanceDueAt it is released
 * and the first part is not refunded.
 */
export const PREMIUM_INSTALLMENTS = {
  firstMnt: 2_775_000,
  /** The two-part option is offered until this moment. */
  firstDueAt: new Date("2026-12-01T00:00:00+08:00"),
  balanceDueAt: new Date("2027-01-01T00:00:00+08:00"),
};

/** The two deadlines as shown to visitors. */
export const INSTALLMENT_DUE_TEXT: Record<Lang, { first: string; balance: string }> = {
  mn: { first: "12-р сарын 1-ээс өмнө", balance: "1-р сарын 1-ээс өмнө" },
  en: { first: "before Dec 1", balance: "before Jan 1" },
};

export function installmentsOpen(now = new Date()) {
  return now < PREMIUM_INSTALLMENTS.firstDueAt;
}

export const LOWEST_PACKAGE_PRICE_MNT = Math.min(
  ...LAB_PACKAGE_IDS.map((id) => LAB_PACKAGES[id].priceMnt),
);

/**
 * What the visitor picked with their seat. Teacher and add-on apply to Pro only;
 * paying in two parts (installments) to Premium only.
 */
export type LabChoice = {
  labPackage: LabPackageId;
  teacher: string | null;
  withPsychologist: boolean;
  installments: boolean;
};

/** Checks untrusted input from the booking form; null when it is not a valid choice. */
export function parseLabChoice(input: unknown): LabChoice | null {
  if (typeof input !== "object" || input === null) return null;
  const { labPackage, teacher, withPsychologist, installments } = input as Record<string, unknown>;
  if (labPackage === "PREMIUM") {
    return {
      labPackage,
      teacher: null,
      withPsychologist: false,
      installments: installments === true,
    };
  }
  if (labPackage === "PRO") {
    if (!TEACHERS.some((name) => name === teacher)) return null;
    return {
      labPackage,
      teacher: teacher as string,
      withPsychologist: withPsychologist === true,
      installments: false,
    };
  }
  return null;
}

export function labChoicePrice(choice: LabChoice) {
  const base = LAB_PACKAGES[choice.labPackage].priceMnt;
  return choice.withPsychologist ? base + PSYCHOLOGIST_ADDON_MNT : base;
}

/** What is paid at booking: the first part when paying in installments, else everything. */
export function labChoiceDueNow(choice: LabChoice) {
  return choice.installments ? PREMIUM_INSTALLMENTS.firstMnt : labChoicePrice(choice);
}

/** Snapshot stored on the order, e.g. "Pro багц · Багш 2 · Сэтгэлзүйч". */
export function labChoiceLabel(choice: LabChoice) {
  return [
    `${LAB_PACKAGES[choice.labPackage].name} багц`,
    choice.teacher,
    choice.withPsychologist ? "Сэтгэлзүйч" : null,
    choice.installments ? "2 хувааж төлөх" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
