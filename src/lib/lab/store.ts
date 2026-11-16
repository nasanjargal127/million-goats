import { create } from "zustand";
import { type RoomId, SEAT_BY_ID } from "./seats";

export type Lang = "mn" | "en";

type LabState = {
  lang: Lang;
  room: RoomId | null;
  seat: string | null;
  hovered: string | null;
  /** Ids of seats that are sold or held, loaded from the database. */
  taken: ReadonlySet<string>;
  setLang: (lang: Lang) => void;
  setRoom: (room: RoomId | null) => void;
  setHovered: (id: string | null) => void;
  setTaken: (ids: readonly string[]) => void;
  /** Суудал дээр дарах: өөр танхимынх бол тэр танхим руу орно, сул бол сонгоно. */
  pickSeat: (id: string) => void;
};

export const useLab = create<LabState>((set, get) => ({
  lang: "mn",
  room: null,
  seat: null,
  hovered: null,
  taken: new Set(),
  setLang: (lang) => set({ lang }),
  setRoom: (room) => {
    if (room !== get().room) set({ room, seat: null });
  },
  setHovered: (hovered) => set({ hovered }),
  setTaken: (ids) => {
    const taken = new Set(ids);
    const seat = get().seat;
    // Drop a selection that has just been taken by someone else.
    set({ taken, seat: seat && taken.has(seat) ? null : seat });
  },
  pickSeat: (id) => {
    const seat = SEAT_BY_ID.get(id);
    if (!seat) return;
    if (seat.room !== get().room) {
      set({ room: seat.room, seat: null });
    } else if (!get().taken.has(id)) {
      set({ seat: get().seat === id ? null : id });
    }
  },
}));
