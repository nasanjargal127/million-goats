// Seeds the Trading Lab (4 rooms × 25 seats) that /lab books through QPay and
// the merch shop's T-shirt with its sizes (/merch).
// Run: pnpm db:seed (idempotent — re-running keeps existing seats and orders).
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { LAB_EVENT_SLUG, ROOM_IDS, ROOM_NAMES, SEATS_PER_ROOM } from "../src/lib/lab/seats";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

/** Price of one Trading Lab seat in MNT (₮). */
const LAB_PRICE_MNT = 5_400_000;

const lab = {
  slug: LAB_EVENT_SLUG,
  title: "Trading Lab",
  description: "Мэргэжлийн трейдерүүдийн танхим — 4 танхим, 100 суудал.",
  venue: "[ХАЯГ], Улаанбаатар",
  startsAt: null,
  priceMnt: LAB_PRICE_MNT,
  rowCount: ROOM_IDS.length,
  seatsPerRow: SEATS_PER_ROOM,
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
  const seats = ROOM_IDS.flatMap((room) =>
    Array.from({ length: SEATS_PER_ROOM }, (_, i) => ({
      eventId: event.id,
      row: ROOM_NAMES[room],
      number: i + 1,
    })),
  );
  const { count } = await prisma.seat.createMany({ data: seats, skipDuplicates: true });
  console.log(`Event "${event.title}" ready (${count} new seats).`);
}

/** Merch: price of one T-shirt in MNT (₮). Sizes start untracked (unlimited); set
 *  ProductVariant.stock to a number in Prisma Studio to start counting. */
const MERCH = {
  slug: "traders-dept-tee",
  name: "Traders Dept. футболк",
  description:
    "Million Goats-ын “Traders Dept.” хар футболк. Урд талд лого, ар талд Traders Dept. бичиг болон ямааны дүрс.",
  priceMnt: 99_000,
  imagePath: "/merch/traders-dept-tee.jpg",
};
const MERCH_SIZES = ["S", "M", "L", "XL", "XXL"];

async function seedMerch() {
  const product = await prisma.product.upsert({
    where: { slug: MERCH.slug },
    update: {},
    create: MERCH,
  });
  const { count } = await prisma.productVariant.createMany({
    data: MERCH_SIZES.map((size, i) => ({ productId: product.id, size, sortOrder: i })),
    skipDuplicates: true,
  });
  console.log(`Product "${product.name}" ready (${count} new sizes).`);
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
