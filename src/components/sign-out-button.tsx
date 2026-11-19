"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className="min-h-11 cursor-pointer rounded-md border border-mg-line bg-white px-4 font-semibold text-mg-navy hover:border-mg-blue disabled:opacity-60"
    >
      Гарах
    </button>
  );
}
