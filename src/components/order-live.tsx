"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const POLL_MS = 5_000;

/** Polls the order status while payment is pending and refreshes the page when it changes. */
export function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        if (res.ok) {
          const { status } = (await res.json()) as { status: string };
          if (status !== "PENDING") {
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
  }, [orderId, router]);

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
