import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/sign-in")({ component: Account });
function Account() {
  const [email, setEmail] = useState<string | null>(null);
  const [mode, setMode] = useState("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        setEmail(session?.user.email ?? null),
      );
      return () => data.subscription.unsubscribe();
    } catch {
      setMessage("Authentication requires Lovable Cloud configuration.");
      return undefined;
    }
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    const credentials = { email: String(f.get("email")), password: String(f.get("password")) };
    try {
      const result =
        mode === "signup"
          ? await supabase.auth.signUp(credentials)
          : await supabase.auth.signInWithPassword(credentials);
      if (result.error)
        setMessage(
          "Authentication failed. Check your details, confirmation email and backend configuration.",
        );
      else
        setMessage(
          mode === "signup"
            ? "If registration is permitted, check your email to confirm your account."
            : "Signed in successfully.",
        );
    } catch {
      setMessage("Authentication service unavailable. Configure Lovable Cloud and retry.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      setMessage(error ? "Sign-out failed. Please retry." : "Signed out.");
    } catch {
      setMessage("Sign-out failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-md rounded-xl border p-7">
        <h1 className="text-2xl font-semibold">
          {email ? "Your account" : mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Authentication is handled by your configured Lovable Cloud backend.
        </p>
        {email ? (
          <div className="mt-6 space-y-4">
            <p>{email}</p>
            <Button disabled={busy} onClick={signOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-5">
            <label className="block text-sm">
              Email
              <Input name="email" type="email" autoComplete="email" required className="mt-2" />
            </label>
            <label className="block text-sm">
              Password
              <Input
                name="password"
                type="password"
                minLength={8}
                maxLength={128}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                className="mt-2"
              />
            </label>
            <Button disabled={busy} type="submit" className="w-full">
              {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setMessage("");
              }}
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </Button>
          </form>
        )}
        <p role="status" className="mt-5 text-sm">
          {message}
        </p>
      </div>
    </AppShell>
  );
}
