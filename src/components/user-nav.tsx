import Link from "next/link";
import { getSession } from "@/lib/auth";

const pill =
  "inline-flex min-h-11 items-center gap-2 rounded-md px-4 font-semibold text-sm text-white transition lg:min-h-9";

/** Header account control. Reads the session cookie, so render it inside <Suspense>. */
export async function UserNav() {
  const session = await getSession();

  if (!session) {
    return (
      <Link
        href="/sign-in"
        className={`${pill} border border-mg-blue bg-linear-to-b from-[#0b2a6e] to-[#051540] hover:from-[#0f3588] hover:to-[#071c55]`}
      >
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
        className="flex size-8 items-center justify-center rounded-md bg-mg-blue lg:size-7 font-bold text-sm uppercase"
      >
        {name.slice(0, 1)}
      </span>
      <span className="hidden max-w-36 truncate sm:inline">{name}</span>
    </Link>
  );
}

export function UserNavFallback() {
  return (
    <span aria-hidden="true" className="inline-block h-11 w-24 rounded-md bg-white/10 lg:h-9" />
  );
}
