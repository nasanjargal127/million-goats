// Trading Lab packages offered when a seat is booked. Prices live here (not in
// the database) and are applied on the server when the order is created.

import type { Lang } from "./store";

export const LAB_PACKAGE_IDS = ["PRO", "PREMIUM"] as const;
export type LabPackageId = (typeof LAB_PACKAGE_IDS)[number];

/** Pro's optional add-on. */
export const PSYCHOLOGIST_ADDON_MNT = 75_000;

/** Pro members pick one teacher whose classes they join. Rename here. */
export const TEACHERS = ["Багш 1", "Багш 2", "Багш 3", "Багш 4"] as const;

type PackageText = { tagline: string; features: string[] };

export const LAB_PACKAGES: Record<
  LabPackageId,
  { name: string; priceMnt: number; text: Record<Lang, PackageText> }
> = {
  PRO: {
    name: "Pro",
    priceMnt: 654_000,
    text: {
      mn: {
        tagline: "Өөрийн оффисоо бүтээ",
        features: [
          "Million Goats Hub-д өөрийн ширээтэй болно",
          "Merch",
          "4 багшийн нэгийг сонгон хичээлд нь суух",
        ],
      },
      en: {
        tagline: "Build your own office",
        features: [
          "Your own desk at the Million Goats Hub",
          "Merch",
          "Join the classes of one of 4 teachers",
        ],
      },
    },
  },
  PREMIUM: {
    name: "Premium",
    priceMnt: 5_400_000,
    text: {
      mn: {
        tagline: "Бүгдийг нэг дороос",
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

export const LOWEST_PACKAGE_PRICE_MNT = Math.min(
  ...LAB_PACKAGE_IDS.map((id) => LAB_PACKAGES[id].priceMnt),
);

/** What the visitor picked with their seat. Teacher and add-on apply to Pro only. */
export type LabChoice = {
  labPackage: LabPackageId;
  teacher: string | null;
  withPsychologist: boolean;
};

/** Checks untrusted input from the booking form; null when it is not a valid choice. */
export function parseLabChoice(input: unknown): LabChoice | null {
  if (typeof input !== "object" || input === null) return null;
  const { labPackage, teacher, withPsychologist } = input as Record<string, unknown>;
  if (labPackage === "PREMIUM") {
    return { labPackage, teacher: null, withPsychologist: false };
  }
  if (labPackage === "PRO") {
    if (!TEACHERS.some((name) => name === teacher)) return null;
    return { labPackage, teacher: teacher as string, withPsychologist: withPsychologist === true };
  }
  return null;
}

export function labChoicePrice(choice: LabChoice) {
  const base = LAB_PACKAGES[choice.labPackage].priceMnt;
  return choice.withPsychologist ? base + PSYCHOLOGIST_ADDON_MNT : base;
}

/** Snapshot stored on the order, e.g. "Pro багц · Багш 2 · Сэтгэлзүйч". */
export function labChoiceLabel(choice: LabChoice) {
  return [
    `${LAB_PACKAGES[choice.labPackage].name} багц`,
    choice.teacher,
    choice.withPsychologist ? "Сэтгэлзүйч" : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
