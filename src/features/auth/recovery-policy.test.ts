import { describe, expect, it } from "vitest";
import { recoveryEmailSchema, recoveryRedirect, passwordUpdateSchema } from "./recovery-policy";
describe("recovery policy", () => {
  it("normalizes valid email addresses", () =>
    expect(recoveryEmailSchema.parse("  person@example.com  ")).toBe("person@example.com"));
  it("rejects malformed email", () =>
    expect(recoveryEmailSchema.safeParse("not email").success).toBe(false));
  it("requires matching passwords and minimum length", () => {
    expect(
      passwordUpdateSchema.safeParse({ password: "short", confirmation: "short" }).success,
    ).toBe(false);
    expect(
      passwordUpdateSchema.safeParse({
        password: "long enough password",
        confirmation: "different",
      }).success,
    ).toBe(false);
    expect(
      passwordUpdateSchema.safeParse({
        password: "long enough password",
        confirmation: "long enough password",
      }).success,
    ).toBe(true);
  });
  it("uses only the app origin and fixed recovery path", () =>
    expect(recoveryRedirect("https://app.vendor.com/anything?next=https://evil.com")).toBe(
      "https://app.vendor.com/account/recovery",
    ));
  it("rejects non-web and embedded credentials", () => {
    expect(() => recoveryRedirect("javascript:alert(1)")).toThrow();
    expect(() => recoveryRedirect("https://user:pass@app.vendor.com")).toThrow();
  });
});
