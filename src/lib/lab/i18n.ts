import type { Lang } from "./store";

const mn = {
  tagline: "Мэргэжлийн трейдерүүдийн танхим",
  stats: (rooms: number, seats: number, price: string | null) =>
    `${rooms} танхим · ${seats} суудал${price ? ` · ${price} / суудал` : ""}`,
  pickRoom: "Танхимаа сонгоно уу",
  seat: "Суудал",
  free: "сул",
  available: "Сул",
  sold: "Захиалагдсан",
  selected: "Сонгосон",
  back: "Бүх танхим",
  pickSeat: "Сул суудал дээр дарж сонгоно уу",
  price: "Үнэ",
  book: "QPay-ээр төлөх",
  booking: "Түр хүлээнэ үү…",
  signInToBook: "Захиалахын тулд нэвтрэх",
  holdNote: (minutes: number) =>
    `Төлбөр хийх хүртэл суудал ${minutes} минут таны нэр дээр хадгалагдана.`,
  bookingClosed: "Онлайн захиалга удахгүй нээгдэнэ.",
  ask: "Telegram-аар асуух",
  soldOut: "Дууссан",
  loading: "3D танхим ачаалж байна…",
  noWebgl: "Таны төхөөрөмж 3D харагдацыг дэмжихгүй байна. Доорх зураглалаас суудлаа сонгоно уу.",
  message: (room: string, seat: number) =>
    `Сайн байна уу! Trading Lab-ийн ${room} танхимын ${seat}-р суудлын талаар асуух зүйл байна.`,
};

const en: typeof mn = {
  tagline: "A room built for serious traders",
  stats: (rooms, seats, price) =>
    `${rooms} rooms · ${seats} seats${price ? ` · ${price} per seat` : ""}`,
  pickRoom: "Choose a room",
  seat: "Seat",
  free: "free",
  available: "Available",
  sold: "Taken",
  selected: "Selected",
  back: "All rooms",
  pickSeat: "Tap an available seat to select it",
  price: "Price",
  book: "Pay with QPay",
  booking: "Please wait…",
  signInToBook: "Sign in to book",
  holdNote: (minutes) => `The seat is held for you for ${minutes} minutes while you pay.`,
  bookingClosed: "Online booking opens soon.",
  ask: "Ask on Telegram",
  soldOut: "Sold out",
  loading: "Loading the 3D lab…",
  noWebgl: "Your device does not support the 3D view. Pick your seat from the map below.",
  message: (room, seat) =>
    `Hello! I have a question about seat ${seat} in the ${room} room of the Trading Lab.`,
};

export const DICT: Record<Lang, typeof mn> = { mn, en };
