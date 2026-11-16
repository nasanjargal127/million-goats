import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Нэвтрэх",
  robots: { index: false },
};

export default function SignInPage() {
  return (
    <AuthShell title="Нэвтрэх" subtitle="Million Goats бүртгэлээрээ нэвтэрнэ үү.">
      <AuthForm mode="sign-in" googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
