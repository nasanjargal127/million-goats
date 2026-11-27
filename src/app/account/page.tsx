import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BrandDot } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isAdmin } from "@/lib/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatEventDate, formatMnt } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Миний бүртгэл",
  robots: { index: false },
};

async function AccountView() {
  const session = await getSession();
  if (!session) redirect("/sign-in?next=/account");

  const [orders, admin] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }),
    isAdmin(session.user.id),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-mg-navy bg-[radial-gradient(ellipse_70%_90%_at_100%_100%,rgba(0,104,255,0.32),transparent_70%)] p-6 text-white sm:p-8">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="m-0 font-bold text-[clamp(26px,3.5vw,40px)] uppercase tracking-[-0.01em]">
            {session.user.name || "Миний бүртгэл"}
          </h1>
          <span className="truncate text-mg-on-dark">{session.user.email}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {admin && (
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-md border border-mg-blue bg-linear-to-b from-[#0b2a6e] to-[#051540] px-5 font-semibold text-white transition hover:from-[#0f3588] hover:to-[#071c55]"
            >
              Админ
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-bold text-[26px] uppercase tracking-[-0.01em]">
          Миний захиалгууд
          <BrandDot />
        </h2>
        {orders.length === 0 ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-mg-line bg-white p-8">
            <p className="m-0 text-mg-body">Одоогоор захиалга алга.</p>
            <Link
              href="/lab"
              className="inline-flex min-h-12 items-center rounded-md bg-mg-blue px-5 font-semibold text-white transition hover:brightness-110"
            >
              Trading Lab үзэх
            </Link>
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {orders.map((o) => {
              const s = ORDER_STATUS_LABEL[o.status];
              return (
                <li key={o.id}>
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-mg-line bg-white px-6 py-5 text-mg-navy transition-colors hover:border-mg-blue"
                  >
                    <div className="flex min-w-0 flex-[1_1_240px] flex-col gap-1">
                      <span className="font-bold text-lg">
                        {o.kind === "MERCH" ? "Merch" : o.event?.title}
                      </span>
                      <span className="text-mg-muted text-sm">
                        {o.kind === "MERCH"
                          ? o.itemLabel
                          : [
                              formatEventDate(o.event?.startsAt ?? null),
                              o.seatLabels.join(", "),
                              o.itemLabel,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                      </span>
                    </div>
                    <span className="font-bold">{formatMnt(o.amountMnt)}</span>
                    <span className={`rounded-full px-3 py-1.5 font-bold text-xs ${s.className}`}>
                      {s.text}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto max-w-5xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-white" />}>
            <AccountView />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
