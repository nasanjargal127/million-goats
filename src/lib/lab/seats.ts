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
 * Суудлын байрлал. x, z нь танхимын төвөөс ширээ хүртэлх зай
 * (-z тал нь том дэлгэцтэй урд хана), rot нь суугаа хүний харах чиг (Y тэнхлэгээр):
 * 0 = урд хана руу, PI = арын хана руу, PI/2 = зүүн, -PI/2 = баруун хана руу.
 * Байрлалыг өөрчлөх бол зөвхөн энэ хэсгийг (ROOM_LAYOUTS) засна.
 */
type Spot = { x: number; z: number; rot: number };

const WALL = 5.6;
const SIDE_Z = [-5.4, -3.6, -1.8, 0, 1.8, 3.6];
const ISLAND_Z = -0.6;

/** n байрлал, хоорондоо `step` зайтай, 0 дээр төвлөрсөн. */
function spread(n: number, step: number) {
  return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * step);
}

/** Зүүн хана руу харсан 6 суудал. */
const leftWall: Spot[] = SIDE_Z.map((z) => ({ x: -WALL, z, rot: Math.PI / 2 }));
/** Баруун хана руу харсан 6 суудал (арын хананаас урагш дугаарлана). */
const rightWall: Spot[] = [...SIDE_Z].reverse().map((z) => ({ x: WALL, z, rot: -Math.PI / 2 }));
/** Арын хана руу харсан n суудал (6 хүртэл). */
const backWall = (n: number): Spot[] => spread(n, 1.8).map((x) => ({ x, z: WALL, rot: Math.PI }));
/** Голын арал: нүүр тулж суух perSide + perSide суудал (5 хүртэл). */
const island = (perSide: number): Spot[] => [
  ...spread(perSide, 1.7).map((x) => ({ x, z: ISLAND_Z - 0.45, rot: Math.PI })),
  ...spread(perSide, 1.7).map((x) => ({ x, z: ISLAND_Z + 0.45, rot: 0 })),
];

/** Танхим бүрийн суудал, дугаарын дарааллаар (1-ээс эхэлнэ). */
const ROOM_LAYOUTS: Record<RoomId, readonly Spot[]> = {
  // Tokyo — 27: зүүн 6 (1–6), ар 5 (7–11), баруун 6 (12–17), арал 5 + 5 (18–27)
  A: [...leftWall, ...backWall(5), ...rightWall, ...island(5)],
  // London — 28: зүүн 6 (1–6), ар 6 (7–12), баруун 6 (13–18), арал 5 + 5 (19–28)
  B: [...leftWall, ...backWall(6), ...rightWall, ...island(5)],
  // New York — 18: зүүн 6 (1–6), ар 6 (7–12), баруун 6 (13–18)
  C: [...leftWall, ...backWall(6), ...rightWall],
  // Sydney — 10: арал 5 + 5 (1–10)
  D: island(5),
};

/** Танхим бүрийн суудлын тоо. */
export const ROOM_SEAT_COUNT = Object.fromEntries(
  ROOM_IDS.map((room) => [room, ROOM_LAYOUTS[room].length]),
) as Record<RoomId, number>;
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
  ROOM_LAYOUTS[room].map((spot, i) => ({ id: `${room}-${i + 1}`, room, number: i + 1, ...spot })),
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
