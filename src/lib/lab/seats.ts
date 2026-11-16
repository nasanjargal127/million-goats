export const ROOM_IDS = ["A", "B", "C", "D"] as const;
export type RoomId = (typeof ROOM_IDS)[number];

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
const SEAT_PRICE_USD = 1500;
export const TELEGRAM_URL = "https://t.me/+97695286878";

/**
 * Зарагдсан суудлууд. Суудал зарагдах бүрд энд ID-г нь нэмнэ.
 * Формат: "<танхим>-<дугаар>", жишээ нь "A-7", "C-25".
 */
const SOLD_SEATS: readonly string[] = [];

export type Seat = {
  id: string;
  room: RoomId;
  number: number;
  x: number;
  z: number;
  rot: number;
  sold: boolean;
};

const sold = new Set(SOLD_SEATS);

export const SEATS: readonly Seat[] = ROOM_IDS.flatMap((room) =>
  SEAT_LAYOUT.map((spot, i) => {
    const id = `${room}-${i + 1}`;
    return {
      id,
      room,
      number: i + 1,
      ...spot,
      sold: sold.has(id),
    };
  }),
);

export const SEAT_BY_ID = new Map(SEATS.map((s) => [s.id, s]));

export const TOTAL_SEATS = SEATS.length;

export function seatsOf(room: RoomId) {
  return SEATS.filter((s) => s.room === room);
}

export function availableIn(room: RoomId) {
  return SEATS.filter((s) => s.room === room && !s.sold).length;
}

export const PRICE_LABEL = `$${SEAT_PRICE_USD.toLocaleString("en-US")}`;
