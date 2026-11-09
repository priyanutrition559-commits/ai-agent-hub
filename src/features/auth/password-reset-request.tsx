import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useHydrated } from "@/hooks/use-hydrated";
import { recoveryEmailSchema, recoveryRedirect } from "./recovery-policy";
export function PasswordResetRequest() {
  const hydrated = useHydrated();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const locked = useRef(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (locked.current) return;
    const parsed = recoveryEmailSchema.safeParse(new FormData(e.currentTarget).get("email"));
    if (!parsed.success) {
      setMessage("Enter a valid email address.");
      return;
    }
    locked.current = true;
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: recoveryRedirect(window.location.origin),
      });
      setMessage(
        error
          ? "Unable to request recovery right now. Please wait and retry, or check backend configuration."
          : "If an eligible account exists, a recovery email will be sent. Check your inbox and spam folder.",
      );
    } catch {
      setMessage(
        "Recovery is unavailable. Configure Lovable Cloud email and redirect settings, then retry.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={!hydrated || busy} className="contents">
        <label className="block text-sm font-medium" htmlFor="recovery-email">
          Account email
        </label>
        <Input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          aria-describedby="recovery-help"
        />
        <p id="recovery-help" className="text-xs leading-6 text-muted-foreground">
          The recovery link returns to this app. Delivery depends on your configured authentication
          provider.
        </p>
        <Button className="w-full" type="submit">
          {busy ? "Requesting…" : "Send recovery link"}
        </Button>
      </fieldset>
      <p role="status" className="text-sm leading-6">
        {message}
      </p>
      <Link className="block text-center text-xs font-medium text-primary" to="/sign-in">
        Back to sign in
      </Link>
    </form>
  );
}
