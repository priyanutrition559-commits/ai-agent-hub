import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PasswordResetRequest } from "@/features/auth/password-reset-request";
export const Route = createFileRoute("/account/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recover your account | Technology Universe" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPassword,
});
function ForgotPassword() {
  return (
    <AppShell>
      <section className="surface-card mx-auto max-w-md p-7 md:p-9">
        <KeyRound className="mb-6 text-primary" size={27} />
        <p className="eyebrow">Account recovery</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">Let’s get you back in.</h1>
        <p className="mb-7 mt-3 text-sm leading-7 text-muted-foreground">
          Request a secure password reset link. We won’t reveal whether an email is registered.
        </p>
        <PasswordResetRequest />
      </section>
    </AppShell>
  );
}
