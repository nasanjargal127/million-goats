export const ROOM_IDS = ["A", "B", "C", "D"] as const;
export type RoomId = (typeof ROOM_IDS)[number];

/** Танхимын нэр. Суудлын ID үсгээ хэвээр хадгална: "A-7" = Tokyo-ийн 7-р суудал. */
export const ROOM_NAMES: Record<RoomId, string> = {
  A: "Tokyo",
  B: "London",
  C: "New York",
  D: "Sydney",
};

/** Танхимын хэмжээ (3D нэгжээр, дөрвөлжин). */
export const ROOM_SIZE = 13;

/**
 * Нэг танхимын суудлын байрлал. x, z нь танхимын төвөөс ширээ хүртэлх зай
 * (-z тал нь том дэлгэцтэй урд хана), rot нь суугаа хүний харах чиг (Y тэнхлэгээр):
 * 0 = урд хана руу, PI = арын хана руу, PI/2 = зүүн, -PI/2 = баруун хана руу.
 * Байрлалыг өөрчлөх бол зөвхөн энэ хэсгийг засна.
 */
type Spot = { x: number; z: number; rot: number };

const WALL = 5.6;
const SIDE_Z = [-5, -3.2, -1.4, 0.4, 2.2, 4];
const BACK_X = [-3.6, -1.8, 0, 1.8, 3.6];
const CENTER_X = [-2.85, -0.95, 0.95, 2.85];
const CENTER_Z = -0.6;

const SEAT_LAYOUT: readonly Spot[] = [
  // Зүүн хана руу харсан 6 суудал (1–6)
  ...SIDE_Z.map((z) => ({ x: -WALL, z, rot: Math.PI / 2 })),
  // Арын хана руу харсан 5 суудал (7–11)
  ...BACK_X.map((x) => ({ x, z: WALL, rot: Math.PI })),
  // Баруун хана руу харсан 6 суудал (12–17)
  ...[...SIDE_Z].reverse().map((z) => ({ x: WALL, z, rot: -Math.PI / 2 })),
  // Голын арал: нүүр тулж суух 4 + 4 суудал (18–25)
  ...CENTER_X.map((x) => ({ x, z: CENTER_Z - 0.45, rot: Math.PI })),
  ...CENTER_X.map((x) => ({ x, z: CENTER_Z + 0.45, rot: 0 })),
];

export const SEATS_PER_ROOM = SEAT_LAYOUT.length;
export const TELEGRAM_URL = "https://t.me/+97695286878";

/** Slug of the database event that holds the Lab's seats (see prisma/seed.ts). */
export const LAB_EVENT_SLUG = "trading-lab";

/**
 * In the database a Lab seat is stored with the room name as its row, so order
 * labels read naturally: "A-7" here is row "Tokyo", number 7 → "Tokyo-7".
 */
export function toDbSeat(id: string) {
  const seat = SEAT_BY_ID.get(id);
  return seat ? { row: ROOM_NAMES[seat.room], number: seat.number } : null;
}

const ROOM_BY_NAME = new Map(ROOM_IDS.map((id) => [ROOM_NAMES[id], id]));

/** Inverse of toDbSeat: database row + number → Lab seat id, e.g. "Tokyo", 7 → "A-7". */
export function fromDbSeat(row: string, number: number) {
  const room = ROOM_BY_NAME.get(row);
  return room ? `${room}-${number}` : null;
}

export type Seat = {
  id: string;
  room: RoomId;
  number: number;
  x: number;
  z: number;
  rot: number;
};

export const SEATS: readonly Seat[] = ROOM_IDS.flatMap((room) =>
  SEAT_LAYOUT.map((spot, i) => ({ id: `${room}-${i + 1}`, room, number: i + 1, ...spot })),
);

export const SEAT_BY_ID = new Map(SEATS.map((s) => [s.id, s]));

export const TOTAL_SEATS = SEATS.length;

export function seatsOf(room: RoomId) {
  return SEATS.filter((s) => s.room === room);
}

/** Free seats in a room, given the ids of seats that are sold or held. */
export function availableIn(room: RoomId, taken: ReadonlySet<string>) {
  return SEATS.filter((s) => s.room === room && !taken.has(s.id)).length;
}
