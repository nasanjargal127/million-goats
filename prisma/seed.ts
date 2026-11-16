// Seeds one SAMPLE event with a seat map so the booking flow can be tried, and
// the Trading Lab (4 rooms × 25 seats) that /lab books through QPay.
// Replace the sample event's title, date, venue and price before launch.
// Run: pnpm db:seed (idempotent — re-running keeps existing seats and orders).
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { LAB_EVENT_SLUG, ROOM_IDS, ROOM_NAMES, SEATS_PER_ROOM } from "../src/lib/lab/seats";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

const sample = {
  slug: "trading-seminar",
  title: "Трейдинг семинар (жишээ)",
  description:
    "Техник шинжилгээ, эрсдэлийн менежмент, трейдерийн сэтгэлзүйн талаарх нэг өдрийн семинар. Энэ бол жишээ эвент — бодит мэдээллээр солино уу.",
  venue: "[ХАЯГ], Улаанбаатар",
  startsAt: new Date("2026-12-20T02:00:00.000Z"), // 10:00 GMT+8 — sample date
  priceMnt: 50_000, // sample price
  rowCount: 8,
  seatsPerRow: 12,
  aisleAfter: 6,
};

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

async function main() {
  const event = await prisma.event.upsert({
    where: { slug: sample.slug },
    update: {},
    create: sample,
  });

  const rows = Array.from({ length: event.rowCount }, (_, i) => String.fromCharCode(65 + i));
  const seats = rows.flatMap((row) =>
    Array.from({ length: event.seatsPerRow }, (_, i) => ({
      eventId: event.id,
      row,
      number: i + 1,
    })),
  );
  const { count } = await prisma.seat.createMany({ data: seats, skipDuplicates: true });
  console.log(`Event "${event.title}" ready (${count} new seats).`);

  await seedLab();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
