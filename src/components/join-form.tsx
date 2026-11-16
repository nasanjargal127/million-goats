"use client";

import { type FormEvent, useState } from "react";

// TODO: connect to a real email/newsletter provider. Until then the form only
// validates input and tells the visitor that sign-up is not open yet.
export function JoinForm() {
  const [status, setStatus] = useState<"idle" | "pending">("idle");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;
    setStatus("pending");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 rounded-3xl bg-mg-navy p-6 sm:p-8"
    >
      <p className="m-0 font-bold text-[22px]">Хамт олонд нэгдэх</p>
      <label htmlFor="join-email" className="font-medium text-mg-on-dark text-sm">
        Имэйл хаяг
      </label>
      <input
        id="join-email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="name@example.com"
        className="min-h-13 w-full rounded-xl border border-white/25 bg-mg-card px-4 text-[17px] text-white placeholder:text-[#7D89A3]"
      />
      <label className="flex items-start gap-2.5 text-mg-on-dark text-sm leading-normal">
        <input type="checkbox" name="notify" className="mt-0.5 size-4.5 shrink-0 accent-mg-blue" />
        Шинэ мэдээ, Trading Lab-ийн мэдээллийг имэйлээр авах
      </label>
      <button
        type="submit"
        className="min-h-13.5 cursor-pointer rounded-xl border-0 bg-mg-orange font-bold text-[17px] text-mg-navy transition hover:brightness-110"
      >
        Нэгдэх
      </button>
      <p role="status" className="m-0 min-h-0 text-mg-mint text-sm empty:hidden">
        {status === "pending" ? "Баярлалаа! Бүртгэл удахгүй нээгдэнэ." : ""}
      </p>
      <p className="m-0 text-[#8A94A8] text-xs leading-normal">
        Арилжаа нь эрсдэлтэй. Манай контент нь боловсролын зорилготой бөгөөд хөрөнгө оруулалтын
        зөвлөгөө биш.
      </p>
    </form>
  );
}
