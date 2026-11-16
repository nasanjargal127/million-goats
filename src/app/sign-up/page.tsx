import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
import { googleEnabled } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Бүртгүүлэх",
  robots: { index: false },
};

export default function SignUpPage() {
  return (
    <AuthShell title="Бүртгүүлэх" subtitle="Шинэ бүртгэл үүсгээд суудлаа захиалаарай.">
      <AuthForm mode="sign-up" googleEnabled={googleEnabled} />
    </AuthShell>
  );
}
