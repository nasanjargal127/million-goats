"use client";

import { useActionState, useState } from "react";
import {
  type AdminSeatState,
  addManualBookingAction,
  cancelSeatOrderAction,
} from "@/app/admin/seats/actions";
import { Select } from "@/components/ui/select";
import { formatMnt } from "@/lib/format";
import {
  LAB_PACKAGE_IDS,
  LAB_PACKAGES,
  type LabPackageId,
  PSYCHOLOGIST_ADDON_MNT,
  TEACHERS,
  teacherIsPsychologist,
} from "@/lib/lab/packages";
import { ROOM_IDS, ROOM_NAMES, type RoomId } from "@/lib/lab/seats";

const IDLE: AdminSeatState = { error: null, done: null };

const field =
  "min-h-12 w-full rounded-xl border border-mg-line bg-white px-4 text-base text-mg-navy focus:border-mg-blue";
const labelText = "mb-1.5 block font-semibold text-mg-navy text-sm";

/** Books a free Lab seat for an existing account by email, as already paid. */
export function ManualBookingForm({
  freeSeats,
}: {
  freeSeats: { id: string; room: RoomId; number: number }[];
}) {
  const [state, action, pending] = useActionState(addManualBookingAction, IDLE);
  const [pkg, setPkg] = useState<LabPackageId>("PRO");
  const [teacher, setTeacher] = useState("");
  const pro = pkg === "PRO";
  const offerPsychologist = pro && !teacherIsPsychologist(teacher || null);

  return (
    <form
      action={action}
      className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-end gap-4 rounded-2xl border border-mg-line bg-white p-5 sm:p-6"
    >
      <label className="block">
        <span className={labelText}>Сурагчийн email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="off"
          placeholder="name@example.com"
          className={field}
        />
      </label>

      <label className="block">
        <span className={labelText}>Суудал</span>
        <Select tone="light" name="seat" required defaultValue="">
          <option value="" disabled>
            Сул суудал сонгох
          </option>
          {ROOM_IDS.map((room) => (
            <optgroup key={room} label={ROOM_NAMES[room]}>
              {freeSeats
                .filter((s) => s.room === room)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {ROOM_NAMES[room]} · {s.number}
                  </option>
                ))}
            </optgroup>
          ))}
        </Select>
      </label>

      <label className="block">
        <span className={labelText}>Багц</span>
        <Select
          tone="light"
          name="package"
          value={pkg}
          onChange={(e) => setPkg(e.target.value as LabPackageId)}
        >
          {LAB_PACKAGE_IDS.map((id) => (
            <option key={id} value={id}>
              {LAB_PACKAGES[id].name} · {LAB_PACKAGES[id].text.mn.period} ·{" "}
              {formatMnt(LAB_PACKAGES[id].priceMnt)}
            </option>
          ))}
        </Select>
      </label>

      {pro && (
        <label className="block">
          <span className={labelText}>Багш</span>
          <Select
            tone="light"
            name="teacher"
            required
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
          >
            <option value="" disabled>
              Багш сонгох
            </option>
            {TEACHERS.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name} · {t.role}
              </option>
            ))}
          </Select>
        </label>
      )}

      {offerPsychologist && (
        <label className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border border-mg-line px-4 text-mg-navy text-sm">
          <input type="checkbox" name="psychologist" className="size-4 accent-mg-blue" />
          Сэтгэлзүйч нэмэх
          <span className="ml-auto font-semibold text-mg-link">
            +{formatMnt(PSYCHOLOGIST_ADDON_MNT)}
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 cursor-pointer rounded-xl border-0 bg-mg-blue px-6 font-semibold text-base text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Нэмж байна…" : "Нэмэх"}
      </button>

      {(state.error || state.done) && (
        <p
          role="status"
          className={`col-span-full m-0 rounded-xl px-4 py-3 font-medium text-sm ${
            state.error ? "bg-[#FFE6DE] text-[#B32600]" : "bg-[#DBFFF7] text-mg-mint-text"
          }`}
        >
          {state.error ?? state.done}
        </p>
      )}
    </form>
  );
}

/** Cancels the order holding a seat, after the admin confirms. */
export function CancelOrderButton({ orderId, seat }: { orderId: string; seat: string }) {
  const [state, action, pending] = useActionState(cancelSeatOrderAction.bind(null, orderId), IDLE);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        const ok = window.confirm(
          `${seat} суудлын захиалгыг цуцлах уу? Суудал сул болно. Төлсөн мөнгийг буцаах бол гараар шилжүүлнэ.`,
        );
        if (!ok) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <button
        type="submit"
        disabled={pending}
        className="min-h-9 cursor-pointer rounded-lg border border-[#B32600]/30 bg-white px-3 font-semibold text-[#B32600] text-sm transition hover:border-[#B32600] hover:bg-[#FFE6DE] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Цуцалж байна…" : "Цуцлах"}
      </button>
      {state.error && <span className="text-[#B32600] text-xs">{state.error}</span>}
    </form>
  );
}
