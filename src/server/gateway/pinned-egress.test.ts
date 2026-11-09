// @vitest-environment node
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import type { IncomingMessage, ClientRequest } from "node:http";
import type { RequestOptions, request as HttpsRequest } from "node:https";
import { describe, expect, it, vi } from "vitest";
import { createPinnedEgress } from "./pinned-egress.server";

const endpoint = "https://mcp.vendor.com/mcp";
function fixture({
  status = 200,
  headers = { "content-type": "application/json" },
  chunks = [Buffer.from('{"ok":true}')],
  hang = false,
}: { status?: number; headers?: Record<string, string>; chunks?: Buffer[]; hang?: boolean } = {}) {
  const requests: RequestOptions[] = [];
  const bodies: unknown[] = [];
  const resolve = vi.fn(async () => [{ address: "8.8.8.8", family: 4 }]);
  const request = vi.fn((options: RequestOptions, callback: (res: IncomingMessage) => void) => {
    requests.push(options);
    const req = new EventEmitter() as ClientRequest;
    const stream = new PassThrough() as unknown as IncomingMessage;
    stream.statusCode = status;
    stream.headers = headers;
    req.destroy = vi.fn((error?: Error) => {
      if (error) req.emit("error", error);
      stream.destroy();
      req.emit("close");
      return req;
    });
    req.end = ((body?: unknown) => {
      bodies.push(body);
      queueMicrotask(() => {
        callback(stream);
        if (!hang && !stream.destroyed) {
          for (const chunk of chunks) (stream as unknown as PassThrough).write(chunk);
          (stream as unknown as PassThrough).end();
        }
      });
      return req;
    }) as ClientRequest["end"];
    stream.on("end", () => req.emit("close"));
    return req;
  });
  const gateway = createPinnedEgress(
    { endpoints: [endpoint] },
    { resolve, request: request as unknown as typeof HttpsRequest },
  );
  return { gateway, resolve, request, requests, bodies };
}
describe("worker egress through isolated HTTPS fixture", () => {
  it("pins numeric destination while preserving TLS identity and Host", async () => {
    const f = fixture();
    const response = await f.gateway.fetch(endpoint);
    expect(await response.json()).toEqual({ ok: true });
    expect(f.requests[0]).toMatchObject({
      hostname: "8.8.8.8",
      servername: "mcp.vendor.com",
      port: 443,
      rejectUnauthorized: true,
      agent: false,
      minVersion: "TLSv1.2",
      headers: { host: "mcp.vendor.com", "accept-encoding": "identity" },
    });
  });
  it("revalidates DNS for every request and blocks a rebinding answer", async () => {
    const f = fixture();
    await (await f.gateway.fetch(endpoint)).text();
    f.resolve.mockResolvedValue([{ address: "127.0.0.1", family: 4 }]);
    await expect(f.gateway.fetch(endpoint)).rejects.toThrow("disallowed");
    expect(f.request).toHaveBeenCalledTimes(1);
  });
  it("rejects unknown endpoints before DNS or secrets", async () => {
    const f = fixture();
    await expect(f.gateway.fetch("https://other.vendor.com/mcp")).rejects.toThrow("allowlisted");
    expect(f.resolve).not.toHaveBeenCalled();
  });
  it("sends bounded JSON POSTs once, without retry", async () => {
    const f = fixture();
    await (
      await f.gateway.fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: '{"test":1}',
      })
    ).text();
    expect(f.bodies).toEqual(['{"test":1}']);
    expect(f.request).toHaveBeenCalledOnce();
  });
  it.each(["host", "authorization", "cookie", "x-forwarded-for"])(
    "rejects caller-controlled %s",
    async (name) => {
      const f = fixture();
      await expect(
        f.gateway.fetch(endpoint, { headers: { [name]: "attacker-controlled" } }),
      ).rejects.toThrow("header");
      expect(f.request).not.toHaveBeenCalled();
    },
  );
  it("rejects request sizes and unsupported methods before resolving", async () => {
    const f = fixture();
    await expect(
      f.gateway.fetch(endpoint, { method: "POST", body: "a".repeat(65537) }),
    ).rejects.toThrow("oversized");
    await expect(f.gateway.fetch(endpoint, { method: "PUT" })).rejects.toThrow("method");
    expect(f.resolve).not.toHaveBeenCalled();
  });
  it.each([301, 302, 307, 308])("rejects redirect %s without following", async (status) => {
    const f = fixture({ status, headers: { location: "https://127.0.0.1" } });
    await expect(f.gateway.fetch(endpoint)).rejects.toThrow("redirects");
    expect(f.request).toHaveBeenCalledOnce();
  });
  it("rejects compressed and unsupported content", async () => {
    for (const headers of [
      { "content-type": "text/html" },
      { "content-type": "application/json", "content-encoding": "gzip" },
    ]) {
      const f = fixture({ headers });
      await expect(f.gateway.fetch(endpoint)).rejects.toThrow();
    }
  });
  it("bounds declared and actual bytes", async () => {
    const declared = fixture({
      headers: { "content-type": "application/json", "content-length": "1048577" },
    });
    await expect(declared.gateway.fetch(endpoint)).rejects.toThrow("byte limit");
    const streamed = fixture({ chunks: [Buffer.alloc(1048577)] });
    const response = await streamed.gateway.fetch(endpoint);
    await expect(response.text()).rejects.toThrow("byte limit");
  });
  it("preserves SSE framing without interpreting content", async () => {
    const f = fixture({
      headers: { "content-type": "text/event-stream" },
      chunks: [Buffer.from('event: message\ndata: {"result":"fixture"}\n\n')],
    });
    expect(await (await f.gateway.fetch(endpoint)).text()).toContain("event: message");
  });
  it("does not expose secret headers in responses", async () => {
    const f = fixture({
      headers: {
        "content-type": "application/json",
        "set-cookie": "secret",
        authorization: "secret",
        "mcp-session-id": "session",
      },
    });
    const r = await f.gateway.fetch(endpoint);
    expect(r.headers.get("set-cookie")).toBeNull();
    expect(r.headers.get("authorization")).toBeNull();
    expect(r.headers.get("mcp-session-id")).toBe("session");
    await r.text();
  });
  it("only resolves server credentials after DNS authorization", async () => {
    const f = fixture();
    const authorization = vi.fn(async () => "Bearer private-token");
    const gateway = createPinnedEgress(
      { endpoints: [endpoint], authorization },
      { resolve: f.resolve, request: f.request as unknown as typeof HttpsRequest },
    );
    await (await gateway.fetch(endpoint)).text();
    expect(f.requests[0]?.headers).toMatchObject({ authorization: "Bearer private-token" });
    f.resolve.mockResolvedValue([{ address: "10.0.0.1", family: 4 }]);
    await expect(gateway.fetch(endpoint)).rejects.toThrow();
    expect(authorization).toHaveBeenCalledOnce();
  });
  it("cancels before sending when caller aborts", async () => {
    const f = fixture();
    const c = new AbortController();
    c.abort();
    await expect(f.gateway.fetch(endpoint, { signal: c.signal })).rejects.toThrow();
    expect(f.request).not.toHaveBeenCalled();
  });
  it("sanitizes secret-store failures", async () => {
    const f = fixture();
    const gateway = createPinnedEgress(
      {
        endpoints: [endpoint],
        authorization: async () => {
          throw new Error("private-secret-value");
        },
      },
      { resolve: f.resolve, request: f.request as unknown as typeof HttpsRequest },
    );
    await expect(gateway.fetch(endpoint)).rejects.toThrow("Server credential lookup failed");
    expect(f.request).not.toHaveBeenCalled();
  });
  it("rejects credentials containing header injection", async () => {
    const f = fixture();
    const gateway = createPinnedEgress(
      { endpoints: [endpoint], authorization: async () => "Bearer token\r\nHost: internal" },
      { resolve: f.resolve, request: f.request as unknown as typeof HttpsRequest },
    );
    await expect(gateway.fetch(endpoint)).rejects.toThrow("credential format");
    expect(f.request).not.toHaveBeenCalled();
  });
  it("checks endpoint readiness without making a remote request", async () => {
    const f = fixture();
    await f.gateway.assertEndpointAllowed(endpoint);
    expect(f.resolve).toHaveBeenCalledWith("mcp.vendor.com");
    expect(f.request).not.toHaveBeenCalled();
  });
  it("rejects an invalid upstream status without throwing from the response callback", async () => {
    const f = fixture({ status: 999 });
    await expect(f.gateway.fetch(endpoint)).rejects.toThrow("Invalid upstream HTTP status");
  });
});
