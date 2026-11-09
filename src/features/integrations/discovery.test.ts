// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { collectDiscoveryPages, discoveryLimits } from "./discovery.server";
const signal = () => new AbortController().signal;
describe("bounded paginated discovery", () => {
  it("collects all pages in order", async () => {
    const fetchPage = vi.fn(async (cursor: string | undefined) =>
      cursor === undefined ? { items: ["first"], nextCursor: "next" } : { items: ["second"] },
    );
    expect(await collectDiscoveryPages(fetchPage, signal())).toEqual(["first", "second"]);
    expect(fetchPage.mock.calls.map(([cursor]) => cursor)).toEqual([undefined, "next"]);
  });
  it("rejects cursor loops rather than returning partial tools", async () => {
    const fetchPage = vi.fn(async () => ({ items: ["tool"], nextCursor: "repeat" }));
    await expect(collectDiscoveryPages(fetchPage, signal())).rejects.toThrow("repeated");
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
  it("caps pages even with unique cursors", async () => {
    let count = 0;
    const fetchPage = vi.fn(async () => ({ items: [], nextCursor: String(++count) }));
    await expect(collectDiscoveryPages(fetchPage, signal())).rejects.toThrow("page limit");
    expect(fetchPage).toHaveBeenCalledTimes(discoveryLimits.pages);
  });
  it("caps cumulative record count", async () => {
    await expect(
      collectDiscoveryPages(async () => ({ items: Array(201).fill("tool") }), signal()),
    ).rejects.toThrow("metadata limits");
  });
  it("caps UTF-8 bytes, not just string length", async () => {
    await expect(
      collectDiscoveryPages(async () => ({ items: ["😀".repeat(70000)] }), signal()),
    ).rejects.toThrow("metadata limits");
  });
  it("rejects long cursors", async () => {
    await expect(
      collectDiscoveryPages(async () => ({ items: [], nextCursor: "a".repeat(1025) }), signal()),
    ).rejects.toThrow("cursor");
  });
  it("does not fetch when already cancelled", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchPage = vi.fn(async () => ({ items: [] }));
    await expect(collectDiscoveryPages(fetchPage, controller.signal)).rejects.toThrow();
    expect(fetchPage).not.toHaveBeenCalled();
  });
  it("rejects results arriving after cancellation", async () => {
    const controller = new AbortController();
    await expect(
      collectDiscoveryPages(async () => {
        controller.abort();
        return { items: ["late"] };
      }, controller.signal),
    ).rejects.toThrow();
  });
});
