import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { passwordUpdateSchema } from "@/features/auth/recovery-policy";
export function PasswordRecovery() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "Open a valid recovery link from your email to continue. Expired or previously used links need to be requested again.",
  );
  const lock = useRef(false);
  useEffect(() => {
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setMessage("Recovery session received. Choose a new password.");
        }
        if (event === "SIGNED_OUT") {
          setReady(false);
        }
      });
      return () => data.subscription.unsubscribe();
    } catch {
      setMessage("Account recovery requires a configured authentication backend.");
      return undefined;
    }
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready || lock.current) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const parsed = passwordUpdateSchema.safeParse({
      password: f.get("password"),
      confirmation: f.get("confirmation"),
    });
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((i) => i.message).join(" "));
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      const verified = await supabase.auth.getUser();
      if (verified.error || !verified.data.user) {
        setReady(false);
        setMessage("Recovery session is no longer valid. Request a new link.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (error) {
        setMessage(
          "Password update failed. Check the password requirements or request a new recovery link.",
        );
        return;
      }
      form.reset();
      setReady(false);
      setMessage("Password updated. Signing out existing sessions…");
      try {
        const result = await supabase.auth.signOut({ scope: "global" });
        setMessage(
          result.error
            ? "Password updated, but session revocation failed. Sign out from your account and retry before using shared devices."
            : "Password updated and sessions signed out. You can now sign in with the new password.",
        );
      } catch {
        setMessage(
          "Password updated, but session revocation could not be confirmed. Sign out from your account and retry.",
        );
      }
    } catch {
      setMessage("Authentication service unavailable. No password update was confirmed.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <section className="surface-card mx-auto max-w-md p-8">
        <p className="eyebrow">Account / Recovery</p>
        <h1 className="mt-3 text-2xl font-semibold">A fresh start.</h1>
        <p className="my-4 text-sm leading-7 text-muted-foreground">
          Your authentication provider verifies the recovery session before accepting a new
          password.
        </p>
        <form onSubmit={submit} className="space-y-5">
          <fieldset disabled={!ready || busy} className="contents">
            <label className="block text-sm">
              New password
              <Input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
                className="mt-2"
              />
            </label>
            <label className="block text-sm">
              Confirm new password
              <Input
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                className="mt-2"
              />
            </label>
            <Button type="submit" className="w-full">
              {busy ? "Updating…" : "Update password"}
            </Button>
          </fieldset>
          <p role="status" className="text-sm leading-6">
            {message}
          </p>
        </form>
        <div className="mt-7 flex flex-wrap justify-between gap-4 text-xs font-medium text-primary">
          <Link to="/account/forgot-password">Request another link</Link>
          <Link to="/sign-in">Back to sign in</Link>
        </div>
      </section>
    </AppShell>
  );
}
