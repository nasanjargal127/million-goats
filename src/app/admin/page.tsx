import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, FilterLink } from "@/components/admin-nav";
import { BrandDot } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatEventDate, formatMnt } from "@/lib/format";
import { dueText } from "@/lib/lab/packages";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import {
  installmentCount,
  invoicePartMnt,
  isManualOrder,
  MONEY_STATUSES,
  partsPaidBeforeLast,
  QPAY_FEE_RATE,
  saleMoney,
  summarizeSales,
} from "@/lib/sales";

export const metadata: Metadata = {
  title: "Админ · Борлуулалт",
  robots: { index: false },
};

const KINDS = {
  all: { label: "Бүгд", where: {} },
  lab: { label: "Trading Lab", where: { kind: "SEAT" } },
  merch: { label: "Merch", where: { kind: "MERCH" } },
} satisfies Record<string, { label: string; where: Prisma.OrderWhereInput }>;

const SHOWS = {
  paid: { label: "Төлөгдсөн", where: { status: { in: [...MONEY_STATUSES] } } },
  all: { label: "Бүх захиалга", where: {} },
} satisfies Record<string, { label: string; where: Prisma.OrderWhereInput }>;

type Kind = keyof typeof KINDS;
type Show = keyof typeof SHOWS;

const pick = <T extends string>(value: unknown, options: Record<T, unknown>, fallback: T) =>
  typeof value === "string" && value in options ? (value as T) : fallback;

const feePercent = `${QPAY_FEE_RATE * 100}%`;

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-mg-line bg-white p-5">
      <span className="text-mg-muted text-sm">{label}</span>
      <span className="font-bold text-2xl text-mg-navy">{value}</span>
      {note && <span className="text-mg-muted text-xs">{note}</span>}
    </div>
  );
}

async function SalesView({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  await requireAdmin("/admin");
  const query = await searchParams;
  const now = Date.now();
  const kind = pick<Kind>(query.kind, KINDS, "all");
  const show = pick<Show>(query.show, SHOWS, "paid");
  const search = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const href = (next: { kind?: Kind; show?: Show; q?: string }) => {
    const params = new URLSearchParams({ kind: next.kind ?? kind, show: next.show ?? show });
    const q = next.q ?? search;
    if (q) params.set("q", q);
    return `/admin?${params}`;
  };
  // Student name or email contains the search text, ignoring case.
  const byStudent: Prisma.OrderWhereInput = search
    ? {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      }
    : {};

  const [orders, paidForTotals] = await Promise.all([
    prisma.order.findMany({
      where: { ...KINDS[kind].where, ...SHOWS[show].where, ...byStudent },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.order.findMany({
      where: {
        ...KINDS[kind].where,
        ...byStudent,
        status: { in: [...MONEY_STATUSES] },
      },
      select: {
        status: true,
        kind: true,
        amountMnt: true,
        chargedMnt: true,
        depositMnt: true,
        depositChargedMnt: true,
        depositPaidAt: true,
        installmentCount: true,
        partsPaid: true,
        partPayments: true,
        labPackage: true,
        quantity: true,
        qpayInvoiceId: true,
        depositInvoiceId: true,
      },
    }),
  ]);
  const totals = summarizeSales(paidForTotals);

  return (
    <div className="flex flex-col gap-8">
      <AdminNav current="sales" />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-bold text-[clamp(28px,3.5vw,40px)] uppercase tracking-[-0.01em]">
          Борлуулалт
          <BrandDot />
        </h1>
        <p className="m-0 text-mg-body">
          Сурагчид ямар багц, merch авсан болон орлого. Дүнгээс QPay-ийн {feePercent} шимтгэлийг
          хасч тооцсон.
        </p>
      </div>

      <search>
        <form action="/admin" className="flex flex-wrap gap-2">
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="show" value={show} />
          <label htmlFor="admin-search" className="sr-only">
            Сурагч хайх
          </label>
          <input
            id="admin-search"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Сурагчийн нэр эсвэл email"
            autoComplete="off"
            className="min-h-12 min-w-0 flex-[1_1_280px] rounded-xl border border-mg-line bg-white px-4 text-base text-mg-navy focus:border-mg-blue"
          />
          <button
            type="submit"
            className="min-h-12 cursor-pointer rounded-xl border-0 bg-mg-blue px-6 font-semibold text-base text-white transition hover:brightness-110"
          >
            Хайх
          </button>
          {search && (
            <Link
              href={href({ q: "" })}
              className="inline-flex min-h-12 items-center rounded-xl border border-mg-line bg-white px-5 font-semibold text-mg-navy hover:border-mg-blue"
            >
              Цэвэрлэх
            </Link>
          )}
        </form>
      </search>
      {search && (
        <p className="m-0 -mt-5 text-mg-body text-sm">
          “{search}” хайлтын үр дүн: доорх нийт дүн зөвхөн эдгээр сурагчийнх.
        </p>
      )}

      <section
        aria-label="Нийт дүн"
        className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3"
      >
        <Stat
          label="Нийт орлого"
          value={formatMnt(totals.received)}
          note={`${totals.orders} захиалга`}
        />
        <Stat label={`QPay шимтгэл (${feePercent})`} value={`−${formatMnt(totals.fee)}`} />
        <Stat label="Цэвэр орлого" value={formatMnt(totals.net)} />
        <Stat
          label="Багц / Merch"
          value={`${totals.pro} Pro · ${totals.premium} Premium`}
          note={`Merch: ${totals.merchItems} ширхэг`}
        />
      </section>
      {(totals.testOrders > 0 ||
        totals.refundRequired > 0 ||
        totals.balanceDue > 0 ||
        totals.balanceUnpaid > 0) && (
        <p className="m-0 text-mg-muted text-sm">
          {totals.testOrders > 0 && `Тест захиалга (${totals.testOrders}) нийт дүнд ороогүй. `}
          {totals.refundRequired > 0 &&
            `${totals.refundRequired} захиалгад буцаан олголт хийх шаардлагатай. `}
          {totals.balanceDue > 0 &&
            `${totals.balanceDue} захиалга хувааж төлж байгаа: үлдсэн төлөлтүүд хүлээгдэж байна. `}
          {totals.balanceUnpaid > 0 &&
            `${totals.balanceUnpaid} захиалгын төлөлт хугацаандаа төлөгдөөгүй тул суудал чөлөөлөгдсөн (төлсөн хэсэг нь орлогод орсон).`}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Төрөл" className="flex flex-wrap gap-2">
            {(Object.keys(KINDS) as Kind[]).map((k) => (
              <FilterLink
                key={k}
                href={href({ kind: k })}
                active={k === kind}
                label={KINDS[k].label}
              />
            ))}
          </nav>
          <nav aria-label="Төлөв" className="flex flex-wrap gap-2">
            {(Object.keys(SHOWS) as Show[]).map((s) => (
              <FilterLink
                key={s}
                href={href({ show: s })}
                active={s === show}
                label={SHOWS[s].label}
              />
            ))}
          </nav>
        </div>

        {orders.length === 0 ? (
          <p className="m-0 rounded-2xl border border-mg-line bg-white p-8 text-mg-body">
            {search
              ? `“${search}” нэртэй эсвэл email-тэй сурагчийн захиалга олдсонгүй.`
              : "Захиалга алга."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mg-line bg-white">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead className="bg-mg-surface text-mg-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-semibold">Огноо</th>
                  <th className="px-4 py-3 font-semibold">Сурагч</th>
                  <th className="px-4 py-3 font-semibold">Худалдан авалт</th>
                  <th className="px-4 py-3 text-right font-semibold">Төлсөн</th>
                  <th className="px-4 py-3 text-right font-semibold">QPay {feePercent}</th>
                  <th className="px-4 py-3 text-right font-semibold">Цэвэр</th>
                  <th className="px-4 py-3 font-semibold">Төлөв</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const money = saleMoney(o);
                  // Unpaid orders are only marked expired when someone looks at them
                  // (or, for an overdue balance, by the daily cron).
                  const lapsed = o.expiresAt.getTime() < now;
                  const status =
                    ORDER_STATUS_LABEL[
                      lapsed && o.status === "PENDING"
                        ? "EXPIRED"
                        : lapsed && o.status === "DEPOSIT_PAID"
                          ? "BALANCE_UNPAID"
                          : o.status
                    ];
                  const counted = (MONEY_STATUSES as readonly string[]).includes(o.status);
                  return (
                    <tr key={o.id} className="border-mg-line border-t align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-mg-body">
                        {formatEventDate(o.paidAt ?? o.depositPaidAt ?? o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="block font-semibold text-mg-navy">
                          {o.user.name || "—"}
                        </span>
                        <span className="block text-mg-muted">{o.user.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold text-xs ${
                              o.kind === "MERCH"
                                ? "bg-mg-blue/10 text-mg-link"
                                : "bg-mg-navy text-white"
                            }`}
                          >
                            {o.kind === "MERCH" ? "Merch" : "Lab"}
                          </span>
                          {money.test && (
                            <span className="rounded-md bg-[#FFF4DB] px-2 py-0.5 font-bold text-[#8A5A00] text-xs">
                              ТЕСТ
                            </span>
                          )}
                          {isManualOrder(o) && (
                            <span className="rounded-md border border-mg-navy px-2 py-0.5 font-bold text-mg-navy text-xs">
                              Гараар
                            </span>
                          )}
                          <span className="font-semibold text-mg-navy">
                            {o.itemLabel ?? "Багцгүй суудал"}
                          </span>
                        </span>
                        <span className="mt-1 block text-mg-muted">
                          {o.kind === "MERCH"
                            ? `Утас: ${o.contactPhone ?? "—"}`
                            : `Суудал: ${o.seatLabels.join(", ")}`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span className="block font-semibold">{formatMnt(money.received)}</span>
                        {o.depositMnt !== null && !money.test && money.received < o.amountMnt && (
                          <span className="block text-mg-muted text-xs">
                            нийт {formatMnt(o.amountMnt)}-өөс
                          </span>
                        )}
                        {o.status === "DEPOSIT_PAID" && o.depositMnt !== null && (
                          <span className="block font-semibold text-[#8A5A00] text-xs">
                            {partsPaidBeforeLast(o)}/{installmentCount(o)} төлсөн · дараагийнх{" "}
                            {formatMnt(invoicePartMnt(o))}
                            {o.balanceDueAt && ` · ${dueText(o.balanceDueAt)}`}
                          </span>
                        )}
                        {money.test && (
                          <span className="block text-mg-muted text-xs">
                            үнэ {formatMnt(o.amountMnt)}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-mg-muted">
                        {counted ? `−${formatMnt(money.fee)}` : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-bold">
                        {counted ? formatMnt(money.net) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-bold text-xs ${status.className}`}
                        >
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {orders.length === 500 && (
          <p className="m-0 text-mg-muted text-sm">Сүүлийн 500 захиалгыг харуулж байна.</p>
        )}
      </section>
    </div>
  );
}

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[20px] bg-white" />}>
            <SalesView searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
