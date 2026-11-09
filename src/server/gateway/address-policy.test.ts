// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { approvedEndpoint, isPublicAddress, resolvePublicTarget } from "./address-policy.server";

describe("public address policy", () => {
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.1.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "0.0.0.0",
    "100.64.0.1",
    "192.0.0.1",
    "192.0.2.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "240.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "fc00::1",
    "fdff::1",
    "fe80::1",
    "ff02::1",
    "::ffff:127.0.0.1",
    "::ffff:8.8.8.8",
    "64:ff9b::808:808",
    "2002:0808:0808::1",
    "2001:db8::1",
    "2001::1",
    "3fff::1",
    "fe80::1%eth0",
    "bad address",
  ])("rejects non-public/transition address %s", (value) =>
    expect(isPublicAddress(value)).toBe(false),
  );
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111", "2001:4860:4860::8888"])(
    "accepts ordinary unicast %s",
    (value) => expect(isPublicAddress(value)).toBe(true),
  );
  it("requires exact operator endpoint permission", () => {
    expect(() =>
      approvedEndpoint("https://vendor.com/other", new Set(["https://vendor.com/mcp"])),
    ).toThrow("allowlisted");
    expect(() =>
      approvedEndpoint("http://vendor.com/mcp", new Set(["http://vendor.com/mcp"])),
    ).toThrow();
  });
  it("rejects mixed public/private DNS answers", async () => {
    await expect(
      resolvePublicTarget(
        new URL("https://vendor.com/mcp"),
        async () => [
          { address: "8.8.8.8", family: 4 },
          { address: "10.0.0.1", family: 4 },
        ],
        new AbortController().signal,
      ),
    ).rejects.toThrow("disallowed");
  });
  it("rejects empty, excessive and mislabelled answers", async () => {
    for (const answers of [
      [],
      Array(33).fill({ address: "8.8.8.8", family: 4 }),
      [{ address: "8.8.8.8", family: 6 }],
    ])
      await expect(
        resolvePublicTarget(
          new URL("https://vendor.com/mcp"),
          async () => answers,
          new AbortController().signal,
        ),
      ).rejects.toThrow();
  });
  it("cancels a hanging DNS query", async () => {
    const controller = new AbortController();
    const work = resolvePublicTarget(
      new URL("https://vendor.com/mcp"),
      () => new Promise(() => {}),
      controller.signal,
    );
    controller.abort();
    await expect(work).rejects.toThrow("cancelled");
  });
  it("does not resolve an already cancelled request", async () => {
    const resolve = vi.fn();
    const controller = new AbortController();
    controller.abort();
    await expect(
      resolvePublicTarget(new URL("https://vendor.com/mcp"), resolve, controller.signal),
    ).rejects.toThrow();
    expect(resolve).not.toHaveBeenCalled();
  });
});
