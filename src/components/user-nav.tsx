import Link from "next/link";
import { getSession } from "@/lib/auth";

const pill =
  "inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 font-semibold text-sm text-white transition lg:text-[15px]";

/** Header account control. Reads the session cookie, so render it inside <Suspense>. */
export async function UserNav() {
  const session = await getSession();

  if (!session) {
    return (
      <Link href="/sign-in" className={`${pill} bg-mg-blue hover:brightness-110`}>
        Нэвтрэх
      </Link>
    );
  }

  const name = session.user.name || session.user.email;
  return (
    <Link
      href="/account"
      aria-label={`Миний бүртгэл (${name})`}
      className={`${pill} border border-white/25 pl-1.5 hover:border-white`}
    >
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-mg-blue font-bold text-sm uppercase"
      >
        {name.slice(0, 1)}
      </span>
      <span className="hidden max-w-36 truncate sm:inline">{name}</span>
    </Link>
  );
}

export function UserNavFallback() {
  return <span aria-hidden="true" className="inline-block h-11 w-24 rounded-[10px] bg-white/10" />;
}
