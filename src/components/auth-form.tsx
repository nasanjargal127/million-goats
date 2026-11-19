"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

/** Only allow same-site relative redirects after sign-in. */
function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

const errorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Имэйл эсвэл нууц үг буруу байна.",
  INVALID_EMAIL: "Имэйл хаяг буруу байна.",
  PASSWORD_TOO_SHORT: "Нууц үг хэт богино байна.",
  USER_ALREADY_EXISTS: "Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Энэ имэйлээр бүртгэл аль хэдийн үүссэн байна.",
};

const inputClass =
  "min-h-12 w-full rounded-lg border border-mg-line bg-white px-4 text-base text-mg-navy placeholder:text-[#7D89A3] focus:border-mg-blue";

export function AuthForm({
  mode,
  googleEnabled,
}: {
  mode: "sign-in" | "sign-up";
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signUp = mode === "sign-up";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setPending(true);
    setError(null);

    const { error } = signUp
      ? await authClient.signUp.email({ name: String(form.get("name")), email, password })
      : await authClient.signIn.email({ email, password });

    if (error) {
      setPending(false);
      setError(errorMessages[error.code ?? ""] ?? "Алдаа гарлаа. Дахин оролдоно уу.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function onGoogle() {
    setPending(true);
    await authClient.signIn.social({ provider: "google", callbackURL: next });
  }

  const otherHref = `${signUp ? "/sign-in" : "/sign-up"}?next=${encodeURIComponent(next)}`;

  return (
    <div className="flex flex-col gap-6">
      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={onGoogle}
            disabled={pending}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-md border border-mg-line bg-white font-semibold text-base text-mg-navy transition hover:border-mg-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3a7.2 7.2 0 0 1-10.8-3.8h-4v3.1A12 12 0 0 0 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"
              />
              <path
                fill="#EA4335"
                d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z"
              />
            </svg>
            Google-ээр {signUp ? "бүртгүүлэх" : "нэвтрэх"}
          </button>
          <div className="flex items-center gap-3 text-mg-muted text-sm">
            <span className="h-px flex-1 bg-mg-line" />
            эсвэл
            <span className="h-px flex-1 bg-mg-line" />
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {signUp && (
          <div className="flex flex-col gap-2">
            <label htmlFor="auth-name" className="font-medium text-sm">
              Нэр
            </label>
            <input id="auth-name" name="name" required autoComplete="name" className={inputClass} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="auth-email" className="font-medium text-sm">
            Имэйл хаяг
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@example.com"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="auth-password" className="font-medium text-sm">
            Нууц үг
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={signUp ? "new-password" : "current-password"}
            aria-describedby={signUp ? "auth-password-hint" : undefined}
            className={inputClass}
          />
          {signUp && (
            <span id="auth-password-hint" className="text-mg-muted text-xs">
              Хамгийн багадаа 8 тэмдэгт.
            </span>
          )}
        </div>

        <p role="alert" className="m-0 text-[#B32600] text-sm empty:hidden">
          {error}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="min-h-12 cursor-pointer rounded-md border-0 bg-mg-blue font-semibold text-base text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Түр хүлээнэ үү…" : signUp ? "Бүртгүүлэх" : "Нэвтрэх"}
        </button>
      </form>

      <p className="m-0 text-center text-mg-body text-sm">
        {signUp ? "Бүртгэлтэй юу? " : "Бүртгэлгүй юу? "}
        <Link href={otherHref} className="font-semibold text-mg-link hover:text-mg-navy">
          {signUp ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Link>
      </p>
    </div>
  );
}
