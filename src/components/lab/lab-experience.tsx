"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { reserveLabSeatAction } from "@/app/lab/actions";
import { formatMnt } from "@/lib/format";
import { DICT } from "@/lib/lab/i18n";
import {
  dueText,
  installmentPartMnt,
  LAB_PACKAGE_IDS,
  LAB_PACKAGES,
  type LabChoice,
  type LabPackageId,
  LOWEST_PACKAGE_PRICE_MNT,
  labChoiceDueNow,
  labChoicePrice,
  type PaymentParts,
  PREMIUM_INSTALLMENTS,
  PSYCHOLOGIST_ADDON_MNT,
  TEACHERS,
  teacherIsPsychologist,
} from "@/lib/lab/packages";
import {
  availableIn,
  ROOM_IDS,
  ROOM_NAMES,
  ROOM_SEAT_COUNT,
  ROOM_SIZE,
  type RoomId,
  SEAT_BY_ID,
  seatsOf,
  TELEGRAM_URL,
  TOTAL_SEATS,
} from "@/lib/lab/seats";
import { useLab } from "@/lib/lab/store";
import { site } from "@/lib/site";
import { SectionTitle } from "../brand";

/** Online booking details from the database; null until the Lab event is set up. */
export type LabBooking = {
  holdMinutes: number;
  signedIn: boolean;
  /** The 6-month Premium can still be paid in 2 parts (4 parts is always offered). */
  twoParts: boolean;
  /** Packages whose discount has not ended yet (see LAB_PACKAGES[id].discount). */
  discounted: LabPackageId[];
} | null;

const LabScene = dynamic(() => import("./lab-scene"), {
  ssr: false,
  loading: () => <SceneLoading />,
});

function SceneLoading() {
  const lang = useLab((s) => s.lang);
  return (
    <div className="flex h-full items-center justify-center text-mg-on-dark-muted text-sm">
      {DICT[lang].loading}
    </div>
  );
}

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const subscribeNever = () => () => {};

function SeatMap({ room }: { room: RoomId }) {
  const selected = useLab((s) => s.seat);
  const hovered = useLab((s) => s.hovered);
  const pickSeat = useLab((s) => s.pickSeat);
  const setHovered = useLab((s) => s.setHovered);
  const taken = useLab((s) => s.taken);
  const t = DICT[useLab((s) => s.lang)];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-76 rounded-xl border border-white/10 bg-white/3">
      {/* Big screen on the front wall */}
      <div className="absolute top-1.5 left-1/2 h-1 w-3/5 -translate-x-1/2 rounded-full bg-mg-sky/80 shadow-[0_0_10px_rgba(85,162,255,0.8)]" />
      {seatsOf(room).map((seat) => {
        // Place the marker at the chair (0.8 units behind the desk).
        const left = ((seat.x + Math.sin(seat.rot) * 0.8) / ROOM_SIZE + 0.5) * 100;
        const top = ((seat.z + Math.cos(seat.rot) * 0.8) / ROOM_SIZE + 0.5) * 100;
        const isSelected = seat.id === selected;
        const isTaken = taken.has(seat.id);
        const state = isTaken
          ? "cursor-not-allowed border-[#2A3550] bg-[#2A3550] text-[#7D89A3] line-through"
          : isSelected
            ? "border-white bg-white text-mg-navy shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            : seat.id === hovered
              ? "border-mg-sky bg-mg-sky/40 text-white"
              : "border-mg-sky/60 bg-mg-blue/20 text-[#CFE2FF] hover:bg-mg-blue/50";
        return (
          <button
            key={seat.id}
            type="button"
            disabled={isTaken}
            aria-pressed={isSelected}
            aria-label={`${ROOM_NAMES[seat.room]}, ${t.seat} ${seat.number}${isTaken ? ` (${t.sold})` : ""}`}
            onClick={() => pickSeat(seat.id)}
            onPointerEnter={() => !isTaken && setHovered(seat.id)}
            onPointerLeave={() => setHovered(null)}
            style={{ left: `${left}%`, top: `${top}%` }}
            className={`absolute size-6.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-md border font-semibold text-[11px] transition ${state}`}
          >
            {seat.number}
          </button>
        );
      })}
    </div>
  );
}

function Legend() {
  const t = DICT[useLab((s) => s.lang)];
  const items = [
    ["bg-mg-blue", t.available],
    ["bg-white", t.selected],
    ["bg-[#2A3550]", t.sold],
  ] as const;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-mg-on-dark-muted text-xs">
      {items.map(([dot, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span aria-hidden="true" className={`size-2.5 rounded-full ${dot}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function TelegramIcon() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.9 4.6 18.8 19.3c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.7 13.3 2.1 11.9c-1-.3-1-1 .2-1.5L20.5 3.4c.8-.3 1.6.2 1.4 1.2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 size-3.5 shrink-0 text-mg-sky"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5l3.2 3L13 4.5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3.5 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 1.8 15 14H1z" />
      <path d="M8 6.2v3.6M8 11.9v.1" />
    </svg>
  );
}

/**
 * 6-month Premium only: pay everything now, in 2 parts (until the 2-part
 * deadline) or in 4 parts (part n within 30 × (n − 1) days of booking).
 */
function InstallmentPicker({
  parts,
  setParts,
  twoParts,
  total,
}: {
  parts: PaymentParts;
  setParts: (parts: PaymentParts) => void;
  twoParts: boolean;
  total: number;
}) {
  const lang = useLab((s) => s.lang);
  const t = DICT[lang];
  const options: PaymentParts[] = twoParts ? [1, 2, 4] : [1, 4];
  const part = installmentPartMnt(total, parts);
  const schedule = Array.from({ length: parts }, (_, i) => ({
    label: t.nthPart(i + 1),
    amount: i + 1 < parts ? part : total - part * (parts - 1),
    when:
      parts === 2
        ? dueText(
            i === 0
              ? PREMIUM_INSTALLMENTS.twoPartsOpenUntil
              : PREMIUM_INSTALLMENTS.twoPartsBalanceDueAt,
            lang,
          )
        : i === 0
          ? t.now
          : t.withinDays(PREMIUM_INSTALLMENTS.fourPartsEveryDays * i),
  }));

  return (
    <div className="flex flex-col gap-2 border-white/10 border-t p-3.5">
      <p className="m-0 font-semibold text-sm">{t.howToPay}</p>
      <div className={`grid gap-1.5 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setParts(value)}
            aria-pressed={parts === value}
            className={`min-h-10 cursor-pointer rounded-lg border px-2 font-semibold text-sm transition ${
              parts === value
                ? "border-mg-blue bg-mg-blue text-white"
                : "border-white/15 text-mg-on-dark hover:border-mg-sky"
            }`}
          >
            {value === 1 ? t.payInFull : t.payInParts(value)}
          </button>
        ))}
      </div>
      {parts > 1 && (
        <>
          <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
            {schedule.map(({ label, amount, when }) => (
              <li key={label} className="flex items-baseline justify-between gap-3">
                <span>
                  {label}
                  <span className="block text-mg-on-dark-muted text-xs">{when}</span>
                </span>
                <span className="font-semibold text-white">{formatMnt(amount)}</span>
              </li>
            ))}
          </ul>
          <span className="flex gap-2 rounded-lg border border-[#FFC24D]/40 bg-[#FFC24D]/10 px-2.5 py-2 font-medium text-[#FFD27A] text-xs">
            <WarningIcon />
            {t.installmentRule}
          </span>
        </>
      )}
    </div>
  );
}

/** Pro / Premium cards; Pro also asks for a teacher and the optional psychologist. */
function PackagePicker({
  pkg,
  setPkg,
  teacher,
  setTeacher,
  psychologist,
  setPsychologist,
  parts,
  setParts,
  twoParts,
  discounted,
}: {
  pkg: LabPackageId;
  setPkg: (id: LabPackageId) => void;
  teacher: string | null;
  setTeacher: (name: string) => void;
  psychologist: boolean;
  setPsychologist: (on: boolean) => void;
  parts: PaymentParts;
  setParts: (parts: PaymentParts) => void;
  twoParts: boolean;
  discounted: LabPackageId[];
}) {
  const lang = useLab((s) => s.lang);
  const t = DICT[lang];

  return (
    <fieldset className="m-0 mt-4 flex flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0 font-semibold text-mg-on-dark-muted text-xs uppercase tracking-[0.12em]">
        {t.pickPackage}
      </legend>
      {LAB_PACKAGE_IDS.map((id) => {
        const info = LAB_PACKAGES[id];
        const text = info.text[lang];
        const active = id === pkg;
        const discount = discounted.includes(id) ? info.discount : undefined;
        return (
          <div
            key={id}
            className={`rounded-xl border transition ${
              active
                ? "border-mg-blue bg-mg-blue/15 shadow-[0_0_28px_rgba(0,104,255,0.3)]"
                : "border-white/15 hover:border-mg-sky"
            }`}
          >
            <label className="flex cursor-pointer flex-col gap-2 p-3.5">
              <span className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="lab-package"
                    value={id}
                    checked={active}
                    onChange={() => setPkg(id)}
                    className="size-4 accent-mg-blue"
                  />
                  <span>
                    <span className="block font-bold text-base uppercase leading-tight">
                      {info.name}
                    </span>
                    <span className="block text-mg-on-dark-muted text-xs">{text.tagline}</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end">
                  {discount && (
                    <span className="flex items-center gap-1.5">
                      <span className="rounded-full bg-[#FF4D6D] px-1.5 py-0.5 font-bold text-[10px] text-white leading-none">
                        −{Math.round((1 - info.priceMnt / discount.originalPriceMnt) * 100)}%
                      </span>
                      <span className="text-mg-on-dark-muted text-xs line-through">
                        {formatMnt(discount.originalPriceMnt)}
                      </span>
                    </span>
                  )}
                  <span className="font-bold text-base text-white">{formatMnt(info.priceMnt)}</span>
                  <span className="font-semibold text-mg-on-dark-muted text-xs">
                    / {text.period}
                  </span>
                </span>
              </span>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 pl-6.5 text-sm text-white/85">
                {text.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>
              {discount && (
                <span className="ml-6.5 flex items-center gap-2 rounded-lg border border-[#FF4D6D]/50 bg-[#FF4D6D]/15 px-2.5 py-2 font-semibold text-[#FF8FA3] text-xs">
                  <WarningIcon />
                  {discount.until[lang]}
                </span>
              )}
              {text.notice && (
                <span className="ml-6.5 flex gap-2 rounded-lg border border-[#FFC24D]/40 bg-[#FFC24D]/10 px-2.5 py-2 font-medium text-[#FFD27A] text-xs">
                  <WarningIcon />
                  {text.notice}
                </span>
              )}
            </label>

            {id === "PRO" && active && (
              <div className="flex flex-col gap-3 border-white/10 border-t p-3.5">
                <div>
                  <p className="m-0 mb-1.5 font-semibold text-sm">{t.pickTeacher}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEACHERS.map(({ name, role, psychologist: isPsychologist }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setTeacher(name);
                          // Her sessions come with her, so drop the paid add-on.
                          if (isPsychologist) setPsychologist(false);
                        }}
                        aria-pressed={teacher === name}
                        className={`flex min-h-12 cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-1.5 font-semibold text-sm leading-tight transition ${
                          teacher === name
                            ? "border-mg-blue bg-mg-blue text-white"
                            : "border-white/15 text-mg-on-dark hover:border-mg-sky"
                        }`}
                      >
                        {name}
                        {/* Subjects are written in Mongolian only */}
                        {lang === "mn" && (
                          <span
                            className={`mt-0.5 font-normal text-[11px] ${teacher === name ? "text-white/80" : "text-white/55"}`}
                          >
                            {role}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {!teacherIsPsychologist(teacher) && (
                  <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/15 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={psychologist}
                        onChange={(e) => setPsychologist(e.target.checked)}
                        className="size-4 accent-mg-blue"
                      />
                      {t.addPsychologist}
                    </span>
                    <span className="font-semibold text-mg-sky">
                      +{formatMnt(PSYCHOLOGIST_ADDON_MNT)}
                    </span>
                  </label>
                )}
              </div>
            )}

            {id === "PREMIUM" && active && (
              <InstallmentPicker
                parts={parts}
                setParts={setParts}
                twoParts={twoParts}
                total={info.priceMnt}
              />
            )}
          </div>
        );
      })}
      <p className="m-0 text-mg-on-dark-muted text-xs">{t.merchNote}</p>
    </fieldset>
  );
}

function BookSeat({ seatId, booking }: { seatId: string; booking: LabBooking }) {
  const router = useRouter();
  const t = DICT[useLab((s) => s.lang)];
  const [pkg, setPkg] = useState<LabPackageId>("PRO");
  const [teacher, setTeacher] = useState<string | null>(null);
  const [psychologist, setPsychologist] = useState(false);
  const [parts, setParts] = useState<PaymentParts>(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!booking) {
    return <p className="m-0 mt-3 text-mg-on-dark-muted text-sm">{t.bookingClosed}</p>;
  }

  const choice: LabChoice =
    pkg === "PRO"
      ? { labPackage: "PRO", teacher, withPsychologist: psychologist, parts: 1 }
      : {
          labPackage: pkg,
          teacher: null,
          withPsychologist: false,
          parts:
            pkg === "PREMIUM" && (parts === 4 || (parts === 2 && booking.twoParts)) ? parts : 1,
        };
  const needsTeacher = pkg === "PRO" && !teacher;

  function pay() {
    setError(null);
    startTransition(async () => {
      // On success the action redirects to the QPay payment page.
      const result = await reserveLabSeatAction(seatId, choice);
      if (result?.error) {
        setError(result.error);
        router.refresh(); // pick up seats that were just taken
      }
    });
  }

  return (
    <>
      <PackagePicker
        pkg={pkg}
        setPkg={setPkg}
        teacher={teacher}
        setTeacher={setTeacher}
        psychologist={psychologist}
        setPsychologist={setPsychologist}
        parts={parts}
        setParts={setParts}
        twoParts={booking.twoParts}
        discounted={booking.discounted}
      />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="text-mg-on-dark-muted text-sm">{t.total}</span>
        <span
          className={choice.parts > 1 ? "font-semibold text-base" : "font-bold text-2xl text-white"}
        >
          {formatMnt(labChoicePrice(choice))}
        </span>
      </div>
      {choice.parts > 1 && (
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-mg-on-dark-muted text-sm">{t.dueNow}</span>
          <span className="font-bold text-2xl text-white">
            {formatMnt(labChoiceDueNow(choice))}
          </span>
        </div>
      )}
      {booking.signedIn ? (
        <>
          <button
            type="button"
            onClick={pay}
            disabled={pending || needsTeacher}
            className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-md border-0 bg-mg-blue px-6 font-bold text-base text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? t.booking : needsTeacher ? t.pickTeacher : t.book}
          </button>
          <p className="m-0 mt-2 text-mg-on-dark-muted text-xs">
            {t.holdNote(booking.holdMinutes)}
          </p>
          <p role="alert" className="m-0 mt-2 font-medium text-[#FF7A52] text-sm empty:hidden">
            {error}
          </p>
        </>
      ) : (
        <Link
          href="/sign-in?next=/lab"
          className="mt-3 flex min-h-12 items-center justify-center rounded-xl bg-mg-blue px-6 font-semibold text-base text-white transition hover:brightness-110"
        >
          {t.signInToBook}
        </Link>
      )}
    </>
  );
}

function RoomPanel({ room, booking }: { room: RoomId; booking: LabBooking }) {
  const lang = useLab((s) => s.lang);
  const seatId = useLab((s) => s.seat);
  const setRoom = useLab((s) => s.setRoom);
  const taken = useLab((s) => s.taken);
  const t = DICT[lang];
  const seat = seatId ? SEAT_BY_ID.get(seatId) : undefined;
  const askHref = `${TELEGRAM_URL}?text=${encodeURIComponent(
    seat ? t.message(ROOM_NAMES[seat.room], seat.number) : "Trading Lab",
  )}`;

  return (
    <aside className="pointer-events-auto absolute inset-x-0 bottom-0 h-[50dvh] overflow-y-auto rounded-t-3xl border border-white/10 bg-mg-navy/90 p-4 text-white backdrop-blur lg:inset-x-auto lg:top-22 lg:right-4 lg:bottom-auto lg:h-auto lg:max-h-[calc(100dvh-7rem)] lg:w-84 lg:rounded-3xl lg:p-5">
      <button
        type="button"
        onClick={() => setRoom(null)}
        className="min-h-11 cursor-pointer text-mg-on-dark-muted text-sm transition hover:text-white"
      >
        ← {t.back}
      </button>
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 font-bold text-2xl uppercase">{ROOM_NAMES[room]}</h2>
        <span className="font-semibold text-mg-sky text-sm">
          {availableIn(room, taken)}/{ROOM_SEAT_COUNT[room]} {t.free}
        </span>
      </div>

      <div className="mt-3 flex gap-1.5">
        {ROOM_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setRoom(id)}
            aria-pressed={id === room}
            className={`h-10 flex-1 cursor-pointer rounded-lg border font-bold text-sm transition ${
              id === room
                ? "border-mg-blue bg-mg-blue text-white"
                : "border-white/15 text-mg-on-dark hover:border-mg-sky"
            }`}
          >
            {ROOM_NAMES[id]}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <SeatMap room={room} />
      </div>
      <div className="mt-3">
        <Legend />
      </div>

      <div className="mt-4 border-white/10 border-t pt-4">
        {seat ? (
          <>
            <p className="m-0 font-semibold text-base">
              {ROOM_NAMES[seat.room]} · {t.seat} {seat.number}
            </p>
            <BookSeat key={seat.id} seatId={seat.id} booking={booking} />
          </>
        ) : (
          <p className="m-0 text-mg-on-dark-muted text-sm">
            {availableIn(room, taken) > 0 ? t.pickSeat : t.soldOut}
          </p>
        )}
        <a
          href={askHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-mg-sky text-sm hover:text-white"
        >
          <TelegramIcon />
          {t.ask}
        </a>
      </div>
    </aside>
  );
}

function Overview({ booking }: { booking: LabBooking }) {
  const lang = useLab((s) => s.lang);
  const setRoom = useLab((s) => s.setRoom);
  const taken = useLab((s) => s.taken);
  const t = DICT[lang];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-mg-navy via-mg-navy/85 to-transparent px-5 pt-20 pb-6 text-white sm:px-8 sm:pb-8">
      <SectionTitle as="h1" lines={["Trading Lab"]} size="text-[clamp(36px,6vw,72px)]" />
      <p className="m-0 mt-4 text-base text-white/80 sm:text-lg">{t.tagline}</p>
      <p className="m-0 mt-1 font-semibold text-mg-sky text-sm sm:text-base">
        {t.stats(
          ROOM_IDS.length,
          TOTAL_SEATS,
          booking ? formatMnt(LOWEST_PACKAGE_PRICE_MNT) : null,
        )}
      </p>
      <p className="m-0 mt-5 font-semibold text-mg-on-dark-muted text-xs uppercase tracking-[0.12em]">
        {t.pickRoom}
      </p>
      <div className="pointer-events-auto mt-2 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
        {ROOM_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setRoom(id)}
            className="cursor-pointer rounded-lg border border-white/15 bg-mg-navy/70 px-4 py-3 text-left backdrop-blur transition hover:border-mg-blue hover:bg-mg-blue/20"
          >
            <span className="block font-bold text-base text-white">{ROOM_NAMES[id]}</span>
            <span className="block text-mg-sky text-xs">
              {availableIn(id, taken)}/{ROOM_SEAT_COUNT[id]} {t.free}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LabExperience({
  booking,
  taken,
}: {
  booking: LabBooking;
  /** Lab seat ids ("A-7") that are sold or currently held. */
  taken: string[];
}) {
  const lang = useLab((s) => s.lang);
  const room = useLab((s) => s.room);
  const setLang = useLab((s) => s.setLang);
  const setTaken = useLab((s) => s.setTaken);
  useEffect(() => setTaken(taken), [taken, setTaken]);
  const webgl = useSyncExternalStore(subscribeNever, hasWebGL, () => true);
  const t = DICT[lang];

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-mg-navy">
      {/* With a room open, shrink the canvas so the panel doesn't cover the 3D view. */}
      <div
        className={
          room
            ? "absolute inset-x-0 top-0 bottom-[50dvh] lg:right-88 lg:bottom-0"
            : "absolute inset-0"
        }
      >
        {webgl ? (
          <LabScene />
        ) : (
          <p className="mx-auto max-w-sm px-6 pt-28 text-center text-mg-on-dark-muted text-sm">
            {t.noWebgl}
          </p>
        )}
      </div>

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-mg-navy/90 to-transparent px-5 py-4 sm:px-8">
        <Link
          href="/"
          aria-label={`${site.name} нүүр`}
          className="pointer-events-auto flex items-center gap-3"
        >
          <Image
            src={site.logos.horizontalOnDark}
            alt={site.name}
            width={1200}
            height={332}
            priority
            className="h-8 w-auto sm:h-9"
          />
          <span className="rounded-md border border-mg-blue bg-linear-to-b from-[#0b2a6e] to-[#051540] px-2 py-1 font-bold text-white text-xs uppercase tracking-widest">
            Lab
          </span>
        </Link>
        <div className="pointer-events-auto flex overflow-hidden rounded-full border border-white/20 bg-mg-navy/70 p-0.5 font-semibold text-xs backdrop-blur">
          {(["mn", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`min-h-9 min-w-11 cursor-pointer rounded-full px-3 uppercase transition ${
                lang === l ? "bg-white text-mg-navy" : "text-mg-on-dark hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {room ? <RoomPanel room={room} booking={booking} /> : <Overview booking={booking} />}
    </main>
  );
}
