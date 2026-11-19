"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { buyMerchAction, type MerchFormState } from "@/app/merch/actions";
import { formatMnt } from "@/lib/format";
import { Select } from "./ui/select";

type Size = { id: string; size: string };

const field =
  "min-h-12 w-full rounded-lg border border-white/10 bg-mg-card px-4 text-base text-white placeholder:text-white/35 focus:border-mg-blue";

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
  const firstSize = sizes[0]?.id ?? "";

  if (!signedIn) {
    return (
      <Link
        href="/sign-in?next=/merch"
        className="inline-flex min-h-12 items-center justify-center rounded-md bg-mg-blue px-6 font-semibold text-white transition hover:brightness-110"
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
        <legend className="mb-3 font-semibold text-sm text-white/85">Хэмжээ</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <label key={s.id} className="cursor-pointer">
              <input
                type="radio"
                name="variantId"
                aria-label={`Хэмжээ ${s.size}`}
                value={s.id}
                defaultChecked={s.id === firstSize}
                required
                className="peer sr-only"
              />
              <span className="flex min-h-12 min-w-14 flex-col items-center justify-center rounded-lg border border-white/10 bg-mg-card px-3 font-bold text-white transition hover:border-mg-blue/60 peer-checked:border-mg-blue peer-checked:bg-mg-blue peer-checked:text-white peer-checked:shadow-[0_8px_24px_rgba(0,104,255,0.35)] peer-focus-visible:outline-2 peer-focus-visible:outline-mg-sky">
                {s.size}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="merch-qty" className="font-semibold text-sm text-white/85">
          Тоо ширхэг
        </label>
        <Select
          id="merch-qty"
          name="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          wrapperClassName="max-w-32"
        >
          {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="merch-phone" className="font-semibold text-sm text-white/85">
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

      <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl bg-mg-card bg-[radial-gradient(ellipse_80%_100%_at_100%_100%,rgba(0,104,255,0.3),transparent_70%)] p-5 text-white ring-1 ring-white/5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-mg-on-dark">Нийт дүн</span>
          <span className="font-bold text-2xl" aria-live="polite">
            {formatMnt(priceMnt * quantity)}
          </span>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 cursor-pointer rounded-md border-0 bg-mg-blue font-bold text-base text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Түр хүлээнэ үү…" : "QPay-ээр төлөх"}
        </button>
        <p className="m-0 text-mg-on-dark-muted text-xs">
          Нэхэмжлэх {holdMinutes} минутын дотор төлөгдөөгүй бол цуцлагдана.
        </p>
      </div>

      <p role="alert" className="m-0 font-medium text-[#ff7a59] empty:hidden">
        {state.error}
      </p>
    </form>
  );
}
