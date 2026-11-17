import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { LabExperience } from "@/components/lab/lab-experience";
import { getSession } from "@/lib/auth";
import { getEventWithSeats, HOLD_MINUTES } from "@/lib/booking";
import { installmentsOpen } from "@/lib/lab/packages";
import { fromDbSeat, LAB_EVENT_SLUG } from "@/lib/lab/seats";

const description =
  "Million Goats Trading Lab — 4 танхим, 100 суудал. 3D танхимаас суудлаа сонгоод Pro эсвэл Premium багцаа QPay-ээр төлж баталгаажуулаарай.";

export const metadata: Metadata = {
  title: "Trading Lab",
  description,
  alternates: { canonical: "/lab" },
  openGraph: { title: "Million Goats Trading Lab", description },
  twitter: { title: "Million Goats Trading Lab", description },
};

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
