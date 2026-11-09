import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
const auth = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
vi.mock("@/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
import { PasswordResetRequest } from "./password-reset-request";
import { PasswordRecovery } from "./password-recovery";
let eventHandler: (event: string, session: unknown) => void;
beforeEach(() => {
  vi.resetAllMocks();
  auth.onAuthStateChange.mockImplementation((handler) => {
    eventHandler = handler;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  auth.getUser.mockResolvedValue({ data: { user: { id: "fixture" } }, error: null });
  auth.updateUser.mockResolvedValue({ error: null });
  auth.signOut.mockResolvedValue({ error: null });
});
afterEach(cleanup);
describe("password recovery UI with isolated provider mock", () => {
  it("requests a same-origin link and uses an enumeration-safe response", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<PasswordResetRequest />);
    fireEvent.change(screen.getByLabelText("Account email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("If an eligible account exists"),
    );
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com", {
      redirectTo: `${window.location.origin}/account/recovery`,
    });
  });
  it("does not render raw provider errors", async () => {
    auth.resetPasswordForEmail.mockRejectedValue(new Error("token=private"));
    render(<PasswordResetRequest />);
    fireEvent.change(screen.getByLabelText("Account email"), {
      target: { value: "person@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send recovery link" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Recovery is unavailable"),
    );
    expect(screen.queryByText(/private/)).not.toBeInTheDocument();
  });
  it("rejects a normal session as a recovery flow", () => {
    render(<PasswordRecovery />);
    act(() => eventHandler("SIGNED_IN", { user: { id: "fixture" } }));
    expect(screen.getByRole("button", { name: "Update password" })).toBeDisabled();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
  it("verifies the recovery session before updating and revokes sessions after", async () => {
    render(<PasswordRecovery />);
    act(() => eventHandler("PASSWORD_RECOVERY", { user: { id: "fixture" } }));
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new long password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new long password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("sessions signed out"),
    );
    expect(auth.getUser).toHaveBeenCalledOnce();
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "new long password" });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "global" });
  });
  it("does not update with an expired session", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: "expired" } });
    render(<PasswordRecovery />);
    act(() => eventHandler("PASSWORD_RECOVERY", { user: { id: "fixture" } }));
    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new long password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm new password"), {
      target: { value: "new long password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("no longer valid"));
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
});
