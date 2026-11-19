"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import type { BalanceState } from "@/app/orders/[id]/actions";

const POLL_MS = 5_000;

/** Polls the order status while a payment is open and refreshes the page when it changes. */
export function OrderStatusPoller({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        if (res.ok) {
          const next = (await res.json()) as { status: string };
          if (next.status !== status) {
            router.refresh();
            return;
          }
        }
      } catch {
        // Network blip: try again on the next tick.
      }
      if (!stopped) timer = setTimeout(tick, POLL_MS);
    }

    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [orderId, status, router]);

  return null;
}

/** mm:ss until the seat hold expires. */
export function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const end = new Date(expiresAt).getTime();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setLeft(Math.max(0, end - Date.now()));
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [end]);

  if (left === null) return <span className="tabular-nums">--:--</span>;
  const m = Math.floor(left / 60_000);
  const s = Math.floor((left % 60_000) / 1_000);
  return (
    <span className="tabular-nums">
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

/** Installment orders: asks for the balance invoice, then the page shows its QR code. */
export function PayBalanceButton({
  action,
  label,
}: {
  action: (prev: BalanceState, form: FormData) => Promise<BalanceState>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 cursor-pointer items-center rounded-md border-0 bg-mg-blue px-6 font-bold text-base text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Түр хүлээнэ үү…" : label}
      </button>
      <p role="alert" className="m-0 font-medium text-[#FF7A52] text-sm empty:hidden">
        {state.error}
      </p>
    </form>
  );
}
