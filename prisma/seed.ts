// Seeds one SAMPLE event with a seat map so the booking flow can be tried.
// Replace title, date, venue and price with real values before launch.
// Run: pnpm db:seed (idempotent — re-running keeps existing seats and orders).
import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
