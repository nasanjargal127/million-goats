// Seeds the Trading Lab (4 rooms: 27 + 28 + 18 + 10 = 83 seats, see
// src/lib/lab/seats.ts) that /lab books through QPay and
// the merch shop's T-shirt with its designs and sizes (/merch).
// Run: pnpm db:seed (idempotent — re-running keeps existing seats and orders;
// it only adds seats, never removes ones a room no longer has).
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  LAB_EVENT_SLUG,
  ROOM_IDS,
  ROOM_NAMES,
  ROOM_SEAT_COUNT,
  SEATS,
  TOTAL_SEATS,
} from "../src/lib/lab/seats";
import { MERCH_DESIGNS } from "../src/lib/merch-shirt";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

/** Price of one Trading Lab seat in MNT (₮). */
const LAB_PRICE_MNT = 5_400_000;

const lab = {
  slug: LAB_EVENT_SLUG,
  title: "Trading Lab",
  description: `Мэргэжлийн трейдерүүдийн танхим — ${ROOM_IDS.length} танхим, ${TOTAL_SEATS} суудал.`,
  venue: "[ХАЯГ], Улаанбаатар",
  startsAt: null,
  priceMnt: LAB_PRICE_MNT,
  rowCount: ROOM_IDS.length,
  // Rooms differ in size; the Lab draws its own map, so this is only the largest room.
  seatsPerRow: Math.max(...Object.values(ROOM_SEAT_COUNT)),
  listed: false, // booked from /lab, not listed on /events
};

async function seedLab() {
  if (LAB_PRICE_MNT <= 0) throw new Error("Set LAB_PRICE_MNT in prisma/seed.ts first.");
  const event = await prisma.event.upsert({
    where: { slug: lab.slug },
    update: {},
    create: lab,
  });
  // Lab seats use the room name as the row: "Tokyo" 7 is shown as "Tokyo-7".
  const seats = SEATS.map((seat) => ({
    eventId: event.id,
    row: ROOM_NAMES[seat.room],
    number: seat.number,
  }));
  const { count } = await prisma.seat.createMany({ data: seats, skipDuplicates: true });
  console.log(`Event "${event.title}" ready (${count} new seats).`);
}

/** Merch: the T-shirt, priced in MNT (₮). */
const MERCH = {
  slug: "traders-dept-tee",
  name: "Million Goats футболк",
  description:
    "Million Goats-ын албан ёсны футболк. Урд талд лого, ар талд таны сонгосон загварын хэвлэл.",
  priceMnt: 99_000,
  imagePath: "/merch/million-goats-tee.webp",
};
const MERCH_SIZES = ["S", "M", "L", "XL", "XXL"];

async function seedMerch() {
  const product = await prisma.product.upsert({
    where: { slug: MERCH.slug },
    update: {},
    create: MERCH,
  });
  const { count } = await prisma.productVariant.createMany({
    data: MERCH_DESIGNS.flatMap((design) =>
      MERCH_SIZES.map((size, i) => ({
        productId: product.id,
        design: design.key,
        size,
        sortOrder: i,
      })),
    ),
    skipDuplicates: true,
  });
  console.log(`Product "${product.name}" ready (${count} new design × size variants).`);
}

async function main() {
  await seedLab();
  await seedMerch();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
