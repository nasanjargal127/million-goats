import type { Lang } from "./store";

const mn = {
  tagline: "Мэргэжлийн трейдерүүдийн танхим",
  stats: (rooms: number, seats: number, price: string) =>
    `${rooms} танхим · ${seats} суудал · ${price} / суудал`,
  pickRoom: "Танхимаа сонгоно уу",
  seat: "Суудал",
  free: "сул",
  available: "Сул",
  sold: "Зарагдсан",
  selected: "Сонгосон",
  back: "Бүх танхим",
  pickSeat: "Сул суудал дээр дарж сонгоно уу",
  price: "Үнэ",
  book: "Telegram-аар захиалах",
  soldOut: "Дууссан",
  loading: "3D танхим ачаалж байна…",
  noWebgl: "Таны төхөөрөмж 3D харагдацыг дэмжихгүй байна. Доорх зураглалаас суудлаа сонгоно уу.",
  message: (room: string, seat: number, price: string) =>
    `Сайн байна уу! Trading Lab-ийн ${room} танхимын ${seat}-р суудлыг (${price}) захиалмаар байна.`,
};

const en: typeof mn = {
  tagline: "A room built for serious traders",
  stats: (rooms, seats, price) => `${rooms} rooms · ${seats} seats · ${price} per seat`,
  pickRoom: "Choose a room",
  seat: "Seat",
  free: "free",
  available: "Available",
  sold: "Sold",
  selected: "Selected",
  back: "All rooms",
  pickSeat: "Tap an available seat to select it",
  price: "Price",
  book: "Book via Telegram",
  soldOut: "Sold out",
  loading: "Loading the 3D lab…",
  noWebgl: "Your device does not support the 3D view. Pick your seat from the map below.",
  message: (room, seat, price) =>
    `Hello! I would like to book seat ${seat} in the ${room} room of the Trading Lab (${price}).`,
};

export const DICT: Record<Lang, typeof mn> = { mn, en };
