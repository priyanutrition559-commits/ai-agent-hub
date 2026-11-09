/** Node worker only. Never import from a TanStack route or the hosted Cloudflare entry. */
import { request as httpsRequest } from "node:https";
import { Readable } from "node:stream";
import type { TrustedEgress } from "@/features/integrations/mcp-adapter.server";
import {
  approvedEndpoint,
  resolvePublicTarget,
  systemResolver,
  type Resolver,
} from "./address-policy.server";

const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const DEADLINE_MS = 15000;
const requestHeaders = new Set([
  "accept",
  "content-type",
  "mcp-session-id",
  "mcp-protocol-version",
  "last-event-id",
]);
const responseHeaders = ["content-type", "mcp-session-id", "retry-after"];

export interface EgressOptions {
  /** Operator-owned configuration, never an arbitrary user-submitted allowlist. */
  endpoints: readonly string[];
  /** Resolves a server-owned secret only AFTER endpoint and DNS authorization. Never logged. */
  authorization?: (endpoint: string) => Promise<string | undefined>;
}
/** Injection is for isolated tests; a production worker uses the defaults. */
export interface EgressDependencies {
  resolve: Resolver;
  request: typeof httpsRequest;
}

export function createPinnedEgress(
  options: EgressOptions,
  dependencies: EgressDependencies = { resolve: systemResolver, request: httpsRequest },
): TrustedEgress {
  // Copy configuration so mutation by callers cannot broaden authorization later.
  const allowlist = new Set(
    options.endpoints.map((endpoint) => {
      const url = new URL(endpoint);
      return approvedEndpoint(endpoint, new Set([url.href])).href;
    }),
  );
  async function authorize(endpoint: string, signal: AbortSignal) {
    const url = approvedEndpoint(endpoint, allowlist);
    const address = await resolvePublicTarget(url, dependencies.resolve, signal);
    return { url, address };
  }
  return {
    async assertEndpointAllowed(endpoint) {
      await authorize(endpoint, AbortSignal.timeout(DEADLINE_MS));
    },
    fetch: async (input, init) => {
      if (input instanceof Request) throw new Error("Gateway accepts URL inputs only.");
      const method = (init?.method ?? "GET").toUpperCase();
      if (!["GET", "POST", "DELETE"].includes(method))
        throw new Error("Unsupported MCP HTTP method.");
      if (init?.body !== undefined && init.body !== null && typeof init.body !== "string")
        throw new Error("Only bounded JSON string bodies are supported.");
      const body = typeof init?.body === "string" ? init.body : undefined;
      if (
        (method !== "POST" && body !== undefined) ||
        (body && Buffer.byteLength(body) > MAX_REQUEST_BYTES)
      )
        throw new Error("Invalid or oversized request body.");
      const headers = new Headers(init?.headers);
      for (const [name, value] of headers) {
        if (!requestHeaders.has(name) || value.length > 8192)
          throw new Error("Request header is not permitted.");
      }
      if (
        body !== undefined &&
        headers.get("content-type")?.split(";")[0]?.trim() !== "application/json"
      )
        throw new Error("POST body must use application/json.");
      const controller = new AbortController();
      const signal = AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(DEADLINE_MS),
        ...(init?.signal ? [init.signal] : []),
      ]);
      const { url, address } = await authorize(String(input), signal);
      // Secret providers must honor their own timeout. Race with the overall deadline.
      let removeAbort = () => {};
      const credential = options.authorization
        ? await Promise.race([
            options.authorization(url.href),
            new Promise<never>((_resolve, reject) => {
              const abort = () => reject(new Error("Credential lookup cancelled or timed out."));
              if (signal.aborted) {
                abort();
                return;
              }
              signal.addEventListener("abort", abort, { once: true });
              removeAbort = () => signal.removeEventListener("abort", abort);
            }),
          ])
            .catch(() => {
              throw new Error("Server credential lookup failed or timed out.");
            })
            .finally(() => removeAbort())
        : undefined;
      if (credential !== undefined) {
        if (!/^Bearer [\x21-\x7e]+$/.test(credential) || credential.length > 8192)
          throw new Error("Invalid server-side credential format.");
        headers.set("authorization", credential);
      }
      signal.throwIfAborted();
      // This is the pin: the connection destination is numeric, so no second DNS
      // lookup occurs. TLS identity/SNI and HTTP Host remain the approved hostname.
      headers.set("host", url.host);
      headers.set("accept-encoding", "identity");
      if (body !== undefined) headers.set("content-length", String(Buffer.byteLength(body)));
      return new Promise<Response>((resolve, reject) => {
        const req = dependencies.request(
          {
            protocol: "https:",
            hostname: address.address,
            family: address.family,
            port: 443,
            servername: url.hostname,
            path: url.pathname,
            method,
            headers: Object.fromEntries(headers),
            agent: false,
            rejectUnauthorized: true,
            minVersion: "TLSv1.2",
            maxHeaderSize: 16 * 1024,
          },
          (res) => {
            const fail = (message: string) => {
              res.destroy();
              req.destroy();
              reject(new Error(message));
            };
            const status = res.statusCode ?? 502;
            if (!Number.isInteger(status) || status < 200 || status > 599) {
              fail("Invalid upstream HTTP status.");
              return;
            }
            if (status >= 300 && status < 400) {
              fail("Gateway redirects are forbidden.");
              return;
            }
            if (res.headers["content-encoding"] && res.headers["content-encoding"] !== "identity") {
              fail("Compressed responses are not supported.");
              return;
            }
            const declared = res.headers["content-length"];
            if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_RESPONSE_BYTES)) {
              fail("Response exceeds the byte limit.");
              return;
            }
            const safeHeaders = new Headers();
            for (const name of responseHeaders) {
              const value = res.headers[name];
              if (typeof value === "string") safeHeaders.set(name, value);
            }
            if ([204, 205].includes(status)) {
              res.resume();
              resolve(new Response(null, { status, headers: safeHeaders }));
              return;
            }
            const type = safeHeaders.get("content-type")?.split(";")[0]?.trim().toLowerCase();
            if (type !== "application/json" && type !== "text/event-stream") {
              fail("Unsupported response content type.");
              return;
            }
            let bytes = 0;
            const source = Readable.toWeb(res, {
              strategy: { highWaterMark: 64 * 1024, size: (chunk: Uint8Array) => chunk.byteLength },
            }) as ReadableStream<Uint8Array>;
            const bounded = source.pipeThrough(
              new TransformStream<Uint8Array, Uint8Array>({
                transform(chunk, sink) {
                  bytes += chunk.byteLength;
                  if (bytes > MAX_RESPONSE_BYTES) {
                    sink.error(new Error("Response exceeds the byte limit."));
                    res.destroy();
                    req.destroy();
                    return;
                  }
                  sink.enqueue(chunk);
                },
              }),
            );
            resolve(new Response(bounded, { status, headers: safeHeaders }));
          },
        );
        const abort = () => {
          req.destroy(new Error("Gateway request cancelled or timed out."));
        };
        signal.addEventListener("abort", abort, { once: true });
        req.once("close", () => signal.removeEventListener("abort", abort));
        // Never forward low-level errors: DNS/TLS/HTTP diagnostics may contain secrets.
        req.once("error", () => reject(new Error("Gateway request failed or timed out.")));
        if (signal.aborted) {
          abort();
          return;
        }
        req.end(body);
      });
    },
  };
}
