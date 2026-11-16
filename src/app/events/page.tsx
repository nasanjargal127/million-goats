import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { HighlightTitle } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/db";
import { formatEventDate, formatMnt } from "@/lib/format";

export const metadata: Metadata = {
  title: "Эвент",
  description:
    "Million Goats-ын семинар, сургалт, эвентүүд. Суудлаа сонгоод QPay-ээр баталгаажуулаарай.",
  alternates: { canonical: "/events" },
};

async function EventList() {
  await connection();
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { startsAt: "asc" },
    include: { _count: { select: { seats: { where: { status: "SOLD" } } } } },
  });
  const totals = await prisma.seat.groupBy({ by: ["eventId"], _count: true });
  const totalBy = new Map(totals.map((t) => [t.eventId, t._count]));

  if (events.length === 0) {
    return (
      <p className="m-0 rounded-[20px] border border-mg-line bg-white p-8 text-mg-body">
        Одоогоор нээлттэй эвент алга байна.
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
      {events.map((e) => {
        const total = totalBy.get(e.id) ?? 0;
        const left = total - e._count.seats;
        return (
          <li key={e.id} className="flex min-w-0 flex-[1_1_360px]">
            <article className="flex w-full flex-col gap-4 rounded-[20px] border border-mg-line bg-white p-6 transition-colors hover:border-mg-blue">
              <div className="flex items-center justify-between gap-3 text-mg-muted text-sm">
                <span>{formatEventDate(e.startsAt)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 font-bold text-xs ${left > 0 ? "bg-[#DBFFF7] text-mg-mint-text" : "bg-[#FFE6DE] text-[#B32600]"}`}
                >
                  {left > 0 ? `${left} суудал үлдсэн` : "Дүүрсэн"}
                </span>
              </div>
              <h2 className="m-0 font-bold text-2xl">{e.title}</h2>
              <p className="m-0 line-clamp-3 text-mg-body leading-relaxed">{e.description}</p>
              <p className="m-0 text-mg-muted text-sm">{e.venue}</p>
              <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                <span className="font-bold text-xl">{formatMnt(e.priceMnt)}</span>
                <Link
                  href={`/events/${e.slug}`}
                  className="inline-flex min-h-12 items-center rounded-[10px] bg-mg-blue px-5 font-semibold text-white transition hover:brightness-110"
                >
                  Суудал сонгох
                </Link>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

export default function EventsPage() {
  return (
    <>
      <SiteHeader current="/events" />
      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden bg-mg-navy px-4 py-14 text-white sm:px-[clamp(16px,4vw,64px)]">
          <div
            aria-hidden="true"
            className="absolute top-0 -right-25 h-full w-160 bg-linear-to-r from-mg-blue/0 to-mg-blue/60 [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
          />
          <div className="relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6">
            <HighlightTitle
              as="h1"
              className="text-[clamp(34px,5vw,68px)]"
              lines={[
                { text: "Эвент ба", className: "bg-white text-mg-navy" },
                { text: "семинар", className: "bg-mg-orange text-mg-navy", indent: true },
              ]}
            />
            <p className="m-0 max-w-105 text-[17px] text-white/80 leading-relaxed">
              Суудлаа зураглал дээрээс сонгоод QPay-ээр төлж баталгаажуулаарай.
            </p>
          </div>
        </section>
        <div className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
          <div className="mx-auto max-w-7xl">
            <Suspense fallback={<div className="h-72 animate-pulse rounded-[20px] bg-white" />}>
              <EventList />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
