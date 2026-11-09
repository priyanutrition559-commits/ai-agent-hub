// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { McpAdapter, type TrustedEgress } from "./mcp-adapter.server";
import type { ToolGrant } from "./policy";

// Local protocol fixture, never a catalogue connection or fabricated UI record.
function fixture() {
  const methods: string[] = [];
  const gateway: TrustedEgress = {
    assertEndpointAllowed: vi.fn(async () => {}),
    fetch: vi.fn(async (_input, init) => {
      const request = JSON.parse(String(init?.body ?? "{}"));
      methods.push(request.method);
      if (request.id === undefined) return new Response(null, { status: 202 });
      let result: unknown;
      switch (request.method) {
        case "initialize":
          result = {
            protocolVersion: "2025-11-25",
            capabilities: { tools: {}, resources: {}, prompts: {} },
            serverInfo: { name: "test-fixture", version: "1.0.0" },
          };
          break;
        case "tools/list":
          result = {
            tools: [
              {
                name: "lookup",
                description: "Test fixture",
                inputSchema: {
                  type: "object",
                  properties: { query: { type: "string" } },
                  required: ["query"],
                },
              },
            ],
          };
          break;
        case "resources/list":
          result = { resources: [] };
          break;
        case "prompts/list":
          result = { prompts: [] };
          break;
        case "tools/call":
          result = { content: [{ type: "text", text: "Fixture result" }] };
          break;
        default:
          throw new Error("Unexpected fixture method");
      }
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }), {
        headers: { "Content-Type": "application/json" },
      });
    }),
  };
  return { gateway, methods };
}
const grant: ToolGrant = {
  ownerId: "owner",
  actorId: "owner",
  enabled: true,
  connectorEnabled: true,
  agentAllowed: true,
  requiredScopes: ["read"],
  grantedScopes: ["read"],
  risk: "read",
  approvalMatchesCall: false,
};
describe("official SDK protocol adapter against isolated fixture", () => {
  it("initializes, negotiates, discovers, invokes and closes", async () => {
    const { gateway, methods } = fixture();
    const adapter = new McpAdapter();
    const signal = new AbortController().signal;
    try {
      const connected = await adapter.connect("https://mcp.vendor.com/mcp", gateway, signal);
      expect(connected.protocolVersion).toBe("2025-11-25");
      expect(connected.server?.name).toBe("test-fixture");
      const discovered = await adapter.discover(signal);
      expect(discovered.tools.tools[0]?.name).toBe("lookup");
      expect(discovered.resources.resources).toEqual([]);
      const result = await adapter.invoke("lookup", { type: "object" }, {}, grant, signal);
      expect(result.trust).toBe("untrusted-external-data");
      expect(methods).toContain("notifications/initialized");
      expect(methods).toContain("tools/call");
    } finally {
      await adapter.close();
    }
  });
  it("denies sensitive invocation before any outbound call; allows approved call", async () => {
    const { gateway, methods } = fixture();
    const adapter = new McpAdapter();
    const signal = new AbortController().signal;
    try {
      await adapter.connect("https://mcp.vendor.com/mcp", gateway, signal);
      await expect(
        adapter.invoke("lookup", { type: "object" }, {}, { ...grant, risk: "sensitive" }, signal),
      ).rejects.toThrow("approval");
      expect(methods).not.toContain("tools/call");
      await adapter.invoke(
        "lookup",
        { type: "object" },
        {},
        { ...grant, risk: "sensitive", approvalMatchesCall: true },
        signal,
      );
      expect(methods.filter((m) => m === "tools/call")).toHaveLength(1);
    } finally {
      await adapter.close();
    }
  });
  it("rejects an endpoint denied by the gateway without fetching", async () => {
    const { gateway } = fixture();
    gateway.assertEndpointAllowed = async () => {
      throw new Error("Not allowlisted");
    };
    const adapter = new McpAdapter();
    await expect(
      adapter.connect("https://mcp.vendor.com/mcp", gateway, new AbortController().signal),
    ).rejects.toThrow("Not allowlisted");
    expect(gateway.fetch).not.toHaveBeenCalled();
  });
  it("fails closed on server errors without automatic retry", async () => {
    const { gateway } = fixture();
    gateway.fetch = vi.fn(async () => new Response(null, { status: 503 }));
    const adapter = new McpAdapter();
    await expect(
      adapter.connect("https://mcp.vendor.com/mcp", gateway, new AbortController().signal),
    ).rejects.toThrow();
    expect(gateway.fetch).toHaveBeenCalledTimes(1);
  });
  it("rejects redirect responses", async () => {
    const { gateway } = fixture();
    gateway.fetch = vi.fn(
      async () => new Response(null, { status: 302, headers: { Location: "http://127.0.0.1" } }),
    );
    const adapter = new McpAdapter();
    await expect(
      adapter.connect("https://mcp.vendor.com/mcp", gateway, new AbortController().signal),
    ).rejects.toThrow("Redirects are blocked");
  });
});
