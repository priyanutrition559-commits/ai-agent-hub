import { describe, expect, it } from "vitest";
import { cataloguePage } from "./catalogue-view";
import { connectors } from "./catalogue";
describe("catalogue view", () => {
  it("paginates without changing source metadata", () => {
    const before = connectors.map((c) => c.id);
    const first = cataloguePage("", "All categories", "featured", 1);
    const second = cataloguePage("", "All categories", "featured", 2);
    expect(first.items).toHaveLength(6);
    expect(second.items).toHaveLength(3);
    expect(new Set([...first.items, ...second.items].map((c) => c.id)).size).toBe(9);
    expect(connectors.map((c) => c.id)).toEqual(before);
  });
  it("sorts deterministically", () => {
    const result = cataloguePage("", "All categories", "name-asc", 1);
    expect(result.items[0]?.name).toBe("Custom MCP");
    expect(cataloguePage("", "All categories", "name-desc", 1).items[0]?.name).toBe("Vercel");
  });
  it("clamps page after filtering", () => {
    const result = cataloguePage("github", "All categories", "featured", 99);
    expect(result.page).toBe(1);
    expect(result.items[0]?.id).toBe("github");
  });
  it("returns honest empty state", () => {
    const result = cataloguePage("no match", "Design", "featured", 1);
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });
  it("bounds invalid page parameters", () => {
    expect(cataloguePage("", "All categories", "featured", NaN, 0).items).toHaveLength(1);
    expect(cataloguePage("", "All categories", "featured", Infinity, NaN).page).toBe(1);
  });
});
