import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin-nav";
import { CancelOrderButton, ManualBookingForm } from "@/components/admin-seats";
import { BrandDot } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/lib/admin";
import { getLabSeatBoard } from "@/lib/admin-seats";
import { formatEventDate } from "@/lib/format";
import { ROOM_IDS, ROOM_NAMES } from "@/lib/lab/seats";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { isManualOrder } from "@/lib/sales";

export const metadata: Metadata = {
  title: "Админ · Суудал",
  robots: { index: false },
};

async function SeatsView() {
  await requireAdmin("/admin/seats");
  const seats = await getLabSeatBoard();

  return (
    <div className="flex flex-col gap-8">
      <AdminNav current="seats" />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-bold text-[clamp(28px,3.5vw,40px)] uppercase tracking-[-0.01em]">
          Суудал
          <BrandDot />
        </h1>
        <p className="m-0 text-mg-body">
          Trading Lab-ийн суудлууд: хэн суусныг харах, захиалга цуцлах, сурагчийг гараар нэмэх.
        </p>
      </div>

      {!seats ? (
        <p className="m-0 rounded-2xl border border-mg-line bg-white p-8 text-mg-body">
          Trading Lab эвент өгөгдлийн санд алга.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="m-0 font-bold text-mg-navy text-xl">Гараар нэмэх</h2>
            <p className="m-0 text-mg-body text-sm">
              Банкаар эсвэл бэлнээр төлсөн сурагчийг бүртгэлтэй email-ээр нь нэмнэ. Захиалга
              төлөгдсөнд тооцогдож, борлуулалтад QPay шимтгэлгүй орно.
            </p>
            <ManualBookingForm
              freeSeats={seats
                .filter((s) => !s.order)
                .map(({ id, room, number }) => ({ id, room, number }))}
            />
          </section>

          {ROOM_IDS.map((room) => {
            const inRoom = seats.filter((s) => s.room === room);
            const taken = inRoom.filter((s) => s.order);
            return (
              <section key={room} className="flex flex-col gap-3">
                <h2 className="m-0 flex items-baseline gap-3 font-bold text-mg-navy text-xl">
                  {ROOM_NAMES[room]}
                  <span className="font-medium text-base text-mg-muted">
                    {taken.length}/{inRoom.length} захиалагдсан
                  </span>
                </h2>
                {taken.length === 0 ? (
                  <p className="m-0 rounded-2xl border border-mg-line bg-white px-5 py-4 text-mg-body text-sm">
                    Бүх суудал сул.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-mg-line bg-white">
                    <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                      <thead className="bg-mg-surface text-mg-muted text-xs uppercase tracking-wide">
                        <tr>
                          <th className="w-20 px-4 py-3 font-semibold">Суудал</th>
                          <th className="px-4 py-3 font-semibold">Сурагч</th>
                          <th className="px-4 py-3 font-semibold">Багц</th>
                          <th className="px-4 py-3 font-semibold">Огноо</th>
                          <th className="px-4 py-3 font-semibold">Төлөв</th>
                          <th className="px-4 py-3">
                            <span className="sr-only">Үйлдэл</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {taken.map(({ id, number, order }) => {
                          if (!order) return null;
                          const status = ORDER_STATUS_LABEL[order.status];
                          return (
                            <tr key={id} className="border-mg-line border-t align-top">
                              <td className="px-4 py-3 font-bold text-mg-navy">{number}</td>
                              <td className="px-4 py-3">
                                <span className="block font-semibold text-mg-navy">
                                  {order.user.name || "—"}
                                </span>
                                <span className="block text-mg-muted">{order.user.email}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="flex flex-wrap items-center gap-1.5">
                                  {isManualOrder(order) && (
                                    <span className="rounded-md bg-mg-navy px-2 py-0.5 font-bold text-white text-xs">
                                      Гараар
                                    </span>
                                  )}
                                  <span className="text-mg-navy">
                                    {order.itemLabel ?? "Багцгүй суудал"}
                                  </span>
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-mg-body">
                                {formatEventDate(
                                  order.paidAt ?? order.depositPaidAt ?? order.createdAt,
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-bold text-xs ${status.className}`}
                                >
                                  {status.text}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <CancelOrderButton
                                  orderId={order.id}
                                  seat={`${ROOM_NAMES[room]} ${number}`}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}

export default function AdminSeatsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[20px] bg-white" />}>
            <SeatsView />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
