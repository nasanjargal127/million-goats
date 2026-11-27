import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav, FilterLink } from "@/components/admin-nav";
import { RoleSelect } from "@/components/admin-users";
import { BrandDot } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Prisma } from "@/generated/prisma/client";
import { isEnvAdmin, requireAdmin, userIdsFromEnv } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatEventDate } from "@/lib/format";
import { MONEY_STATUSES } from "@/lib/sales";

export const metadata: Metadata = {
  title: "Админ · Хэрэглэгчид",
  robots: { index: false },
};

const LIMIT = 500;

const paidOrder: Prisma.OrderWhereInput = { status: { in: [...MONEY_STATUSES] } };

const SHOWS = {
  all: { label: "Бүгд", where: {} },
  buyers: { label: "Худалдан авалт хийсэн", where: { orders: { some: paidOrder } } },
  none: { label: "Худалдан аваагүй", where: { orders: { none: paidOrder } } },
  admins: {
    label: "Админ",
    // A getter: ADMIN_USER_IDS is read on every request, like everywhere else.
    get where(): Prisma.UserWhereInput {
      return { OR: [{ role: "ADMIN" }, { id: { in: [...userIdsFromEnv("ADMIN_USER_IDS")] } }] };
    },
  },
} satisfies Record<string, { label: string; where: Prisma.UserWhereInput }>;

type Show = keyof typeof SHOWS;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-mg-line bg-white p-5">
      <span className="text-mg-muted text-sm">{label}</span>
      <span className="font-bold text-2xl text-mg-navy">{value}</span>
    </div>
  );
}

async function UsersView({
  searchParams,
}: {
  searchParams: PageProps<"/admin/users">["searchParams"];
}) {
  const session = await requireAdmin("/admin/users");
  const query = await searchParams;
  const show: Show =
    typeof query.show === "string" && query.show in SHOWS ? (query.show as Show) : "all";
  const search = typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const href = (next: { show?: Show; q?: string }) => {
    const params = new URLSearchParams({ show: next.show ?? show });
    const q = next.q ?? search;
    if (q) params.set("q", q);
    return `/admin/users?${params}`;
  };
  const bySearch: Prisma.UserWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
  const where: Prisma.UserWhereInput = { AND: [SHOWS[show].where, bySearch] };

  const [users, matching, total, buyers] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        _count: { select: { orders: { where: paidOrder } } },
      },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
    }),
    prisma.user.count({ where }),
    prisma.user.count(),
    prisma.user.count({ where: SHOWS.buyers.where }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <AdminNav current="users" />
      <div className="flex flex-col gap-2">
        <h1 className="m-0 font-bold text-[clamp(28px,3.5vw,40px)] uppercase tracking-[-0.01em]">
          Хэрэглэгчид
          <BrandDot />
        </h1>
        <p className="m-0 text-mg-body">
          Сайтад бүртгүүлсэн бүх хүн, худалдан авалт хийсэн эсэхээс үл хамааран.
        </p>
      </div>

      <section
        aria-label="Нийт дүн"
        className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3"
      >
        <Stat label="Нийт бүртгэл" value={String(total)} />
        <Stat label="Худалдан авалт хийсэн" value={String(buyers)} />
        <Stat label="Худалдан аваагүй" value={String(total - buyers)} />
      </section>

      <search>
        <form action="/admin/users" className="flex flex-wrap gap-2">
          <input type="hidden" name="show" value={show} />
          <label htmlFor="users-search" className="sr-only">
            Хэрэглэгч хайх
          </label>
          <input
            id="users-search"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Нэр эсвэл email"
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

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Шүүлтүүр" className="flex flex-wrap gap-2">
            {(Object.keys(SHOWS) as Show[]).map((s) => (
              <FilterLink
                key={s}
                href={href({ show: s })}
                active={s === show}
                label={SHOWS[s].label}
              />
            ))}
          </nav>
          <span className="text-mg-muted text-sm">{matching} хэрэглэгч</span>
        </div>

        {users.length === 0 ? (
          <p className="m-0 rounded-2xl border border-mg-line bg-white p-8 text-mg-body">
            {search ? `“${search}” нэртэй эсвэл email-тэй хэрэглэгч олдсонгүй.` : "Хэрэглэгч алга."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-mg-line bg-white">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-mg-surface text-mg-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Нэр</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Бүртгүүлсэн</th>
                  <th className="px-4 py-3 font-semibold">Худалдан авалт</th>
                  <th className="px-4 py-3 font-semibold">Эрх</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="border-mg-line border-t align-top">
                    <td className="px-4 py-3 text-mg-muted">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-mg-navy">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-mg-body">{u.email}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-mg-body">
                      {formatEventDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {u._count.orders > 0 ? (
                        <Link
                          href={`/admin?${new URLSearchParams({ kind: "all", show: "paid", q: u.email })}`}
                          className="font-semibold text-mg-link hover:underline"
                        >
                          {u._count.orders} захиалга
                        </Link>
                      ) : (
                        <span className="text-mg-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.id === session.user.id || isEnvAdmin(u.id) ? (
                        <span
                          className="font-semibold text-mg-navy"
                          title={
                            u.id === session.user.id
                              ? "Өөрийнхөө эрхийг өөрчлөх боломжгүй"
                              : "ADMIN_USER_IDS-д бүртгэлтэй"
                          }
                        >
                          Админ{u.id === session.user.id ? " (та)" : ""}
                        </span>
                      ) : (
                        <RoleSelect userId={u.id} role={u.role} name={u.name || u.email} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {matching > LIMIT && (
          <p className="m-0 text-mg-muted text-sm">
            Сүүлд бүртгүүлсэн {LIMIT} хэрэглэгчийг харуулж байна ({matching}-аас). Хайлтаар
            нарийсгана уу.
          </p>
        )}
      </section>
    </div>
  );
}

export default function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mg-surface px-4 py-12 sm:px-[clamp(16px,4vw,64px)]">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[20px] bg-white" />}>
            <UsersView searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
