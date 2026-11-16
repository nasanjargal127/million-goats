"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { reserveSeatsAction } from "@/app/events/[slug]/actions";
import { formatMnt } from "@/lib/format";

type Seat = { id: string; row: string; number: number; taken: boolean };

export function SeatPicker({
  eventId,
  seats,
  seatsPerRow,
  aisleAfter,
  priceMnt,
  maxSeats,
  signedIn,
  signInHref,
}: {
  eventId: string;
  seats: Seat[];
  seatsPerRow: number;
  aisleAfter: number | null;
  priceMnt: number;
  maxSeats: number;
  signedIn: boolean;
  signInHref: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const byRow = new Map<string, Seat[]>();
    for (const s of seats) byRow.set(s.row, [...(byRow.get(s.row) ?? []), s]);
    return [...byRow.entries()];
  }, [seats]);

  const labelOf = (s: Seat) => `${s.row}-${s.number}`;
  const selectedSeats = seats.filter((s) => selected.includes(s.id));

  function toggle(seat: Seat) {
    setError(null);
    if (selected.includes(seat.id)) {
      setSelected(selected.filter((id) => id !== seat.id));
    } else if (selected.length >= maxSeats) {
      setError(`Нэг удаад ${maxSeats} хүртэл суудал сонгоно.`);
    } else {
      setSelected([...selected, seat.id]);
    }
  }

  function pay() {
    startTransition(async () => {
      const result = await reserveSeatsAction(eventId, selected);
      // On success the action redirects to the order page.
      if (result?.error) setError(result.error);
    });
  }

  const columns = seatsPerRow + (aisleAfter ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-[20px] border border-mg-line bg-white p-4 sm:p-6">
        <div className="mx-auto flex w-max flex-col items-center gap-2">
          <div className="mb-4 w-full rounded-b-[40px] bg-mg-navy py-2 text-center font-bold text-white text-xs uppercase tracking-[0.3em]">
            Тайз
          </div>
          {rows.map(([row, rowSeats]) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 text-center font-bold text-mg-muted text-sm">{row}</span>
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${columns}, 2.25rem)` }}
              >
                {rowSeats.map((seat) => {
                  const isSelected = selected.includes(seat.id);
                  const state = seat.taken ? "захиалагдсан" : isSelected ? "сонгосон" : "сул";
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={seat.taken || pending}
                      aria-pressed={isSelected}
                      aria-label={`${seat.row} эгнээ, ${seat.number}-р суудал, ${state}`}
                      onClick={() => toggle(seat)}
                      style={
                        aisleAfter && seat.number === aisleAfter + 1
                          ? { gridColumnStart: seat.number + 1 }
                          : undefined
                      }
                      className={`h-9 rounded-t-lg rounded-b-sm border font-semibold text-xs transition ${
                        seat.taken
                          ? "cursor-not-allowed border-transparent bg-[#C9D2E3] text-[#6B768C]"
                          : isSelected
                            ? "cursor-pointer border-mg-orange bg-mg-orange text-mg-navy"
                            : "cursor-pointer border-mg-blue/40 bg-[#E3EEFF] text-mg-navy hover:border-mg-blue hover:bg-mg-blue hover:text-white"
                      }`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
              <span className="w-5 text-center font-bold text-mg-muted text-sm">{row}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="m-0 flex list-none flex-wrap gap-5 p-0 text-mg-body text-sm">
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-4 rounded-sm border border-mg-blue/40 bg-[#E3EEFF]"
          />
          Сул
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-4 rounded-sm bg-mg-orange" />
          Сонгосон
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-4 rounded-sm bg-[#C9D2E3]" />
          Захиалагдсан
        </li>
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-mg-navy p-5 text-white sm:p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-mg-on-dark-muted text-sm">
            {selectedSeats.length > 0
              ? `Сонгосон: ${selectedSeats.map(labelOf).join(", ")}`
              : "Суудлаа сонгоно уу"}
          </span>
          <span className="font-bold text-2xl" aria-live="polite">
            {formatMnt(selectedSeats.length * priceMnt)}
          </span>
        </div>
        {signedIn ? (
          <button
            type="button"
            onClick={pay}
            disabled={selected.length === 0 || pending}
            className="min-h-13 cursor-pointer rounded-xl border-0 bg-mg-orange px-7 font-bold text-base text-mg-navy transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Түр хүлээнэ үү…" : "QPay-ээр төлөх"}
          </button>
        ) : (
          <Link
            href={signInHref}
            className="inline-flex min-h-13 items-center rounded-xl bg-mg-blue px-7 font-semibold text-white transition hover:brightness-110"
          >
            Захиалахын тулд нэвтрэх
          </Link>
        )}
      </div>

      <p role="alert" className="m-0 font-medium text-[#B32600] empty:hidden">
        {error}
      </p>
    </div>
  );
}
