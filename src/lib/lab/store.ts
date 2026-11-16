import { create } from "zustand";
import { type RoomId, SEAT_BY_ID } from "./seats";

export type Lang = "mn" | "en";

type LabState = {
  lang: Lang;
  room: RoomId | null;
  seat: string | null;
  hovered: string | null;
  setLang: (lang: Lang) => void;
  setRoom: (room: RoomId | null) => void;
  setHovered: (id: string | null) => void;
  /** Суудал дээр дарах: өөр танхимынх бол тэр танхим руу орно, сул бол сонгоно. */
  pickSeat: (id: string) => void;
};

export const useLab = create<LabState>((set, get) => ({
  lang: "mn",
  room: null,
  seat: null,
  hovered: null,
  setLang: (lang) => set({ lang }),
  setRoom: (room) => {
    if (room !== get().room) set({ room, seat: null });
  },
  setHovered: (hovered) => set({ hovered }),
  pickSeat: (id) => {
    const seat = SEAT_BY_ID.get(id);
    if (!seat) return;
    if (seat.room !== get().room) {
      set({ room: seat.room, seat: null });
    } else if (!seat.sold) {
      set({ seat: get().seat === id ? null : id });
    }
  },
}));
