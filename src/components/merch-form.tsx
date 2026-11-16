"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { buyMerchAction, type MerchFormState } from "@/app/merch/actions";
import { formatMnt } from "@/lib/format";

type Size = { id: string; size: string; stock: number | null };

const field =
  "min-h-12 w-full rounded-xl border border-mg-line bg-white px-4 text-base text-mg-navy placeholder:text-[#7D89A3] focus:border-mg-blue";

export function MerchForm({
  sizes,
  priceMnt,
  maxQuantity,
  holdMinutes,
  signedIn,
}: {
  sizes: Size[];
  priceMnt: number;
  maxQuantity: number;
  holdMinutes: number;
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState<MerchFormState, FormData>(buyMerchAction, {
    error: null,
  });
  const [quantity, setQuantity] = useState(1);
  const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const firstAvailable = sizes.find((s) => s.stock === null || s.stock > 0)?.id ?? "";

  if (!signedIn) {
    return (
      <Link
        href="/sign-in?next=/merch"
        className="inline-flex min-h-13 items-center justify-center rounded-xl bg-mg-blue px-7 font-semibold text-white transition hover:brightness-110"
      >
        Захиалахын тулд нэвтрэх
      </Link>
    );
  }

  return (
    // Submit via onSubmit rather than the form `action` prop: React resets a form
    // after an action, which would wipe the buyer's entries on a validation error.
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="flex flex-col gap-6"
    >
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 font-semibold text-sm">Хэмжээ</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const soldOut = s.stock !== null && s.stock <= 0;
            return (
              <label key={s.id} className={soldOut ? "cursor-not-allowed" : "cursor-pointer"}>
                <input
                  type="radio"
                  name="variantId"
                  aria-label={`Хэмжээ ${s.size}${soldOut ? ", дууссан" : ""}`}
                  value={s.id}
                  defaultChecked={s.id === firstAvailable}
                  disabled={soldOut}
                  required
                  className="peer sr-only"
                />
                <span className="flex min-h-12 min-w-14 flex-col items-center justify-center rounded-xl border border-mg-line bg-white px-3 font-bold text-mg-navy transition peer-checked:border-mg-navy peer-checked:bg-mg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-mg-sky peer-disabled:bg-mg-surface peer-disabled:text-[#8A94A8] peer-disabled:line-through">
                  {s.size}
                  {s.stock !== null && s.stock > 0 && s.stock <= 5 && (
                    <span className="font-medium text-[11px] no-underline">{s.stock} үлдсэн</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="merch-qty" className="font-semibold text-sm">
          Тоо ширхэг
        </label>
        <select
          id="merch-qty"
          name="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className={`${field} max-w-32`}
        >
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 font-semibold text-sm">Хүлээн авах</legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["DELIVERY", "Хүргэлтээр", "Улаанбаатар хотод"],
              ["PICKUP", "Очиж авах", "Бэлэн болмогц холбогдоно"],
            ] as const
          ).map(([value, title, hint]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="fulfillment"
                aria-label={title}
                value={value}
                checked={fulfillment === value}
                onChange={() => setFulfillment(value)}
                className="peer sr-only"
              />
              <span className="flex h-full flex-col gap-1 rounded-xl border border-mg-line bg-white p-4 transition peer-checked:border-mg-blue peer-checked:bg-[#E3EEFF] peer-focus-visible:outline-2 peer-focus-visible:outline-mg-sky">
                <span className="font-bold">{title}</span>
                <span className="text-mg-muted text-xs">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="merch-phone" className="font-semibold text-sm">
          Утасны дугаар
        </label>
        <input
          id="merch-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="9911 2233"
          className={field}
        />
      </div>

      {fulfillment === "DELIVERY" && (
        <div className="flex flex-col gap-2">
          <label htmlFor="merch-address" className="font-semibold text-sm">
            Хүргэлтийн хаяг
          </label>
          <textarea
            id="merch-address"
            name="address"
            required
            rows={3}
            maxLength={500}
            autoComplete="street-address"
            placeholder="Дүүрэг, хороо, байр, орц, тоот"
            className={`${field} py-3`}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-mg-navy p-5 text-white">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-mg-on-dark">Нийт дүн</span>
          <span className="font-bold text-2xl" aria-live="polite">
            {formatMnt(priceMnt * quantity)}
          </span>
        </div>
        <button
          type="submit"
          disabled={pending || !firstAvailable}
          className="min-h-13 cursor-pointer rounded-xl border-0 bg-mg-orange font-bold text-base text-mg-navy transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!firstAvailable ? "Дууссан" : pending ? "Түр хүлээнэ үү…" : "QPay-ээр төлөх"}
        </button>
        <p className="m-0 text-mg-on-dark-muted text-xs">
          Төлбөр хийх хүртэл бараа {holdMinutes} минут таны нэр дээр хадгалагдана.
        </p>
      </div>

      <p role="alert" className="m-0 font-medium text-[#B32600] empty:hidden">
        {state.error}
      </p>
    </form>
  );
}
