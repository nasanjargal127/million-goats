import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LabExperience } from "@/components/lab/lab-experience";
import { getSession } from "@/lib/auth";
import { getEventWithSeats, HOLD_MINUTES } from "@/lib/booking";
import { installmentsOpen } from "@/lib/lab/packages";
import { fromDbSeat, LAB_EVENT_SLUG, ROOM_IDS, TOTAL_SEATS } from "@/lib/lab/seats";
import { pageMetadata } from "@/lib/seo";

const description = `Million Goats Trading Lab — ${ROOM_IDS.length} танхим, ${TOTAL_SEATS} суудал. 3D танхимаас суудлаа сонгоод Pro эсвэл Premium багцаа QPay-ээр төлж баталгаажуулаарай.`;

export const metadata: Metadata = pageMetadata({
  path: "/lab",
  title: "Trading Lab — суудал захиалга",
  socialTitle: "Million Goats Trading Lab",
  description,
});

/** Loads live seat status and the visitor's session; both are per request. */
async function LabWithBooking() {
  await connection();
  const [event, session] = await Promise.all([getEventWithSeats(LAB_EVENT_SLUG), getSession()]);

  const taken = (event?.seats ?? []).flatMap((s) => {
    const id = s.taken ? fromDbSeat(s.row, s.number) : null;
    return id ? [id] : [];
  });

  return (
    <LabExperience
      taken={taken}
      booking={
        event
          ? {
              holdMinutes: HOLD_MINUTES,
              signedIn: Boolean(session),
              installments: installmentsOpen(),
            }
          : null
      }
    />
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<main className="h-dvh w-full bg-mg-navy" />}>
      <LabWithBooking />
    </Suspense>
  );
}
