"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { DICT } from "@/lib/lab/i18n";
import {
  availableIn,
  PRICE_LABEL,
  ROOM_IDS,
  ROOM_NAMES,
  ROOM_SIZE,
  type RoomId,
  SEAT_BY_ID,
  SEATS_PER_ROOM,
  seatsOf,
  TELEGRAM_URL,
  TOTAL_SEATS,
} from "@/lib/lab/seats";
import { useLab } from "@/lib/lab/store";
import { site } from "@/lib/site";
import { HighlightTitle } from "../brand";

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
  const t = DICT[useLab((s) => s.lang)];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-76 rounded-xl border border-white/10 bg-white/3">
      {/* Big screen on the front wall */}
      <div className="absolute top-1.5 left-1/2 h-1 w-3/5 -translate-x-1/2 rounded-full bg-mg-mint/70" />
      {seatsOf(room).map((seat) => {
        // Place the marker at the chair (0.8 units behind the desk).
        const left = ((seat.x + Math.sin(seat.rot) * 0.8) / ROOM_SIZE + 0.5) * 100;
        const top = ((seat.z + Math.cos(seat.rot) * 0.8) / ROOM_SIZE + 0.5) * 100;
        const isSelected = seat.id === selected;
        const state = seat.sold
          ? "cursor-not-allowed border-[#2A3550] bg-[#2A3550] text-[#7D89A3] line-through"
          : isSelected
            ? "border-mg-orange bg-mg-orange text-mg-navy"
            : seat.id === hovered
              ? "border-mg-mint bg-mg-mint/25 text-white"
              : "border-mg-sky/60 bg-mg-blue/20 text-[#CFE2FF] hover:bg-mg-blue/50";
        return (
          <button
            key={seat.id}
            type="button"
            disabled={seat.sold}
            aria-pressed={isSelected}
            aria-label={`${ROOM_NAMES[seat.room]}, ${t.seat} ${seat.number}${seat.sold ? ` (${t.sold})` : ""}`}
            onClick={() => pickSeat(seat.id)}
            onPointerEnter={() => !seat.sold && setHovered(seat.id)}
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
    ["bg-mg-orange", t.selected],
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

function RoomPanel({ room }: { room: RoomId }) {
  const lang = useLab((s) => s.lang);
  const seatId = useLab((s) => s.seat);
  const setRoom = useLab((s) => s.setRoom);
  const t = DICT[lang];
  const seat = seatId ? SEAT_BY_ID.get(seatId) : undefined;
  const href = seat
    ? `${TELEGRAM_URL}?text=${encodeURIComponent(t.message(ROOM_NAMES[seat.room], seat.number, PRICE_LABEL))}`
    : undefined;

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
        <h2 className="m-0 font-black text-2xl uppercase">{ROOM_NAMES[room]}</h2>
        <span className="font-semibold text-mg-mint text-sm">
          {availableIn(room)}/{SEATS_PER_ROOM} {t.free}
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
            <div className="flex items-baseline justify-between">
              <p className="m-0 font-semibold text-base">
                {ROOM_NAMES[seat.room]} · {t.seat} {seat.number}
              </p>
              <p className="m-0 font-bold text-mg-mint text-xl">{PRICE_LABEL}</p>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-mg-blue px-6 font-semibold text-base text-white transition hover:brightness-110"
            >
              <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.9 4.6 18.8 19.3c-.2 1-.8 1.3-1.7.8l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.8 8.8-7.9c.4-.3-.1-.5-.6-.2L6.7 13.3 2.1 11.9c-1-.3-1-1 .2-1.5L20.5 3.4c.8-.3 1.6.2 1.4 1.2z" />
              </svg>
              {t.book}
            </a>
          </>
        ) : (
          <p className="m-0 text-mg-on-dark-muted text-sm">
            {availableIn(room) > 0 ? t.pickSeat : t.soldOut}
          </p>
        )}
      </div>
    </aside>
  );
}

function Overview() {
  const lang = useLab((s) => s.lang);
  const setRoom = useLab((s) => s.setRoom);
  const t = DICT[lang];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-mg-navy via-mg-navy/85 to-transparent px-5 pt-20 pb-6 text-white sm:px-8 sm:pb-8">
      <HighlightTitle
        as="h1"
        className="text-[clamp(36px,6vw,72px)]"
        lines={[
          { text: "Trading", className: "bg-white text-mg-navy" },
          { text: "Lab", className: "bg-mg-orange text-mg-navy", indent: true },
        ]}
      />
      <p className="m-0 mt-4 text-base text-white/80 sm:text-lg">{t.tagline}</p>
      <p className="m-0 mt-1 font-semibold text-mg-mint text-sm sm:text-base">
        {t.stats(ROOM_IDS.length, TOTAL_SEATS, PRICE_LABEL)}
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
            className="cursor-pointer rounded-xl border border-white/15 bg-mg-navy/70 px-4 py-3 text-left backdrop-blur transition hover:border-mg-blue hover:bg-mg-blue/20"
          >
            <span className="block font-bold text-base text-white">{ROOM_NAMES[id]}</span>
            <span className="block text-mg-mint text-xs">
              {availableIn(id)}/{SEATS_PER_ROOM} {t.free}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function LabExperience() {
  const lang = useLab((s) => s.lang);
  const room = useLab((s) => s.room);
  const setLang = useLab((s) => s.setLang);
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
          <span className="rounded-md bg-mg-orange px-2 py-1 font-black text-mg-navy text-xs uppercase tracking-widest">
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

      {room ? <RoomPanel room={room} /> : <Overview />}
    </main>
  );
}
