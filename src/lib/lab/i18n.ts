import type { Lang } from "./store";

const mn = {
  tagline: "Мэргэжлийн трейдерүүдийн танхим",
  stats: (rooms: number, seats: number, price: string | null) =>
    `${rooms} танхим · ${seats} суудал${price ? ` · ${price}-өөс` : ""}`,
  pickRoom: "Танхимаа сонгоно уу",
  seat: "Суудал",
  free: "сул",
  available: "Сул",
  sold: "Захиалагдсан",
  selected: "Сонгосон",
  back: "Бүх танхим",
  pickSeat: "Сул суудал дээр дарж сонгоно уу",
  pickPackage: "Багцаа сонгоно уу",
  pickLength: "Хугацаа",
  pickTeacher: "Багшаа сонгоно уу",
  addPsychologist: "Сэтгэлзүйч нэмэх",
  merchNote: "Merch-ийн размераа Hub дээр ирэхдээ сонгоно.",
  total: "Нийт",
  howToPay: "Төлөх хэлбэр",
  payInFull: "Нэг дор",
  payInParts: (parts: number) => `${parts} хувааж`,
  nthPart: (n: number) => `${n}-р төлөлт`,
  now: "Одоо",
  withinDays: (days: number) => `${days} хоногийн дотор`,
  installmentRule:
    "Дараагийн төлөлтөө хугацаандаа төлөөгүй бол суудал чөлөөлөгдөж, төлсөн төлбөр буцаагдахгүй.",
  dueNow: "Одоо төлөх",
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
    `${rooms} rooms · ${seats} seats${price ? ` · from ${price}` : ""}`,
  pickRoom: "Choose a room",
  seat: "Seat",
  free: "free",
  available: "Available",
  sold: "Taken",
  selected: "Selected",
  back: "All rooms",
  pickSeat: "Tap an available seat to select it",
  pickPackage: "Choose a package",
  pickLength: "Length",
  pickTeacher: "Choose your teacher",
  addPsychologist: "Add a psychologist",
  merchNote: "Pick your merch size when you come to the Hub.",
  total: "Total",
  howToPay: "How to pay",
  payInFull: "In full",
  payInParts: (parts) => `In ${parts} parts`,
  nthPart: (n) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} payment`,
  now: "Now",
  withinDays: (days) => `within ${days} days`,
  installmentRule:
    "If a payment is not made in time, the seat is released and what was paid is not refunded.",
  dueNow: "Due now",
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
