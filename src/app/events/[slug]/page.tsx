import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SeatPicker } from "@/components/seat-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { getEventWithSeats, HOLD_MINUTES, MAX_SEATS_PER_ORDER } from "@/lib/booking";
import { formatEventDate, formatMnt } from "@/lib/format";

async function EventDetail({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  const { slug } = await params;
  const [event, session] = await Promise.all([getEventWithSeats(slug), getSession()]);
  if (!event) notFound();

  const free = event.seats.filter((s) => !s.taken).length;

  return (
    <>
      <section className="relative overflow-hidden bg-mg-navy px-4 py-12 text-white sm:px-[clamp(16px,4vw,64px)]">
        <div
          aria-hidden="true"
          className="absolute top-0 -right-25 h-full w-160 bg-linear-to-r from-mg-blue/0 to-mg-blue/60 [clip-path:polygon(50%_0,100%_0,50%_100%,0_100%)]"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-5">
          <p className="m-0 font-semibold text-mg-mint text-sm uppercase tracking-[0.12em]">
            {formatEventDate(event.startsAt)}
          </p>
          <h1 className="m-0 font-black text-[clamp(32px,4.5vw,60px)] uppercase leading-[1.05]">
            {event.title}
          </h1>
          <p className="m-0 max-w-180 text-lg text-white/80 leading-relaxed">{event.description}</p>
          <dl className="m-0 flex flex-wrap gap-x-10 gap-y-3 text-sm">
            <div>
              <dt className="text-mg-on-dark-muted">Байршил</dt>
              <dd className="m-0 font-semibold text-base">{event.venue}</dd>
            </div>
            <div>
              <dt className="text-mg-on-dark-muted">Нэг суудал</dt>
              <dd className="m-0 font-semibold text-base">{formatMnt(event.priceMnt)}</dd>
            </div>
            <div>
              <dt className="text-mg-on-dark-muted">Сул суудал</dt>
              <dd className="m-0 font-semibold text-base">
                {free} / {event.seats.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-extrabold text-[26px] uppercase">Суудал сонгох</h2>
            <p className="m-0 text-mg-body">
              {MAX_SEATS_PER_ORDER} хүртэл суудал сонгоно. Төлбөр төлөх хүртэл суудал {HOLD_MINUTES}{" "}
              минут таны нэр дээр хадгалагдана.
            </p>
          </div>
          <SeatPicker
            eventId={event.id}
            seats={event.seats}
            seatsPerRow={event.seatsPerRow}
            aisleAfter={event.aisleAfter}
            priceMnt={event.priceMnt}
            maxSeats={MAX_SEATS_PER_ORDER}
            signedIn={Boolean(session)}
            signInHref={`/sign-in?next=${encodeURIComponent(`/events/${event.slug}`)}`}
          />
        </div>
      </div>
    </>
  );
}

export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <>
      <SiteHeader current="/events" />
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<div className="h-[60vh] animate-pulse bg-mg-navy" />}>
          <EventDetail params={params} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
