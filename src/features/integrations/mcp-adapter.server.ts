import { collectDiscoveryPages } from "./discovery.server";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { authorizeTool, validateEndpoint, type ToolGrant } from "./policy";
import { boundedToolResult, validateToolArguments } from "./validation.server";

/** Worker-only building block, NOT wired to hosted execution.
 * The operator must inject a gateway fetch which enforces public DNS/IP pinning,
 * exact endpoint allowlists, no redirects, response byte limits and quotas.
 * No default global fetch is allowed. Credentials are supplied by secret storage.
 */
export interface TrustedEgress {
  fetch: typeof fetch;
  assertEndpointAllowed: (endpoint: string) => Promise<void>;
}
export class McpAdapter {
  private client = new Client(
    { name: "technology-universe", version: "0.1.0" },
    { capabilities: {} },
  );
  private transport: StreamableHTTPClientTransport | undefined;
  async connect(endpoint: string, gateway: TrustedEgress, signal: AbortSignal) {
    signal.throwIfAborted();
    if (this.transport) throw new Error("Close the existing connection before reconnecting.");
    const normalized = validateEndpoint(endpoint);
    await gateway.assertEndpointAllowed(normalized);
    const transport = new StreamableHTTPClientTransport(new URL(normalized), {
      fetch: async (input, init) => {
        const target = input instanceof Request ? input.url : String(input);
        if (target !== normalized) throw new Error("Cross-endpoint requests are blocked.");
        const response = await gateway.fetch(input, { ...init, redirect: "error" });
        if (response.status >= 300 && response.status < 400)
          throw new Error("Redirects are blocked.");
        return response;
      },
      requestInit: { redirect: "error" },
      reconnectionOptions: {
        maxRetries: 0,
        initialReconnectionDelay: 1000,
        maxReconnectionDelay: 1000,
        reconnectionDelayGrowFactor: 1,
      },
    });
    this.transport = transport;
    try {
      await this.client.connect(transport, { timeout: 15000, signal });
      return {
        server: this.client.getServerVersion(),
        capabilities: this.client.getServerCapabilities(),
        protocolVersion: transport.protocolVersion,
      };
    } catch (error) {
      await this.close();
      throw error;
    }
  }
  async discover(signal: AbortSignal) {
    if (!this.transport) throw new Error("Connect before discovery.");
    const boundedSignal = AbortSignal.any([signal, AbortSignal.timeout(30000)]);
    const capabilities = this.client.getServerCapabilities();
    const options = { timeout: 15000, signal: boundedSignal };
    const tools = capabilities?.tools
      ? await collectDiscoveryPages(async (cursor) => {
          const page = await this.client.listTools(cursor === undefined ? {} : { cursor }, options);
          return { items: page.tools, nextCursor: page.nextCursor };
        }, boundedSignal)
      : [];
    const resources = capabilities?.resources
      ? await collectDiscoveryPages(async (cursor) => {
          const page = await this.client.listResources(
            cursor === undefined ? {} : { cursor },
            options,
          );
          return { items: page.resources, nextCursor: page.nextCursor };
        }, boundedSignal)
      : [];
    const prompts = capabilities?.prompts
      ? await collectDiscoveryPages(async (cursor) => {
          const page = await this.client.listPrompts(
            cursor === undefined ? {} : { cursor },
            options,
          );
          return { items: page.prompts, nextCursor: page.nextCursor };
        }, boundedSignal)
      : [];
    return { tools: { tools }, resources: { resources }, prompts: { prompts } };
  }

  async invoke(
    name: string,
    schema: unknown,
    args: Record<string, unknown>,
    grant: ToolGrant,
    signal: AbortSignal,
  ) {
    signal.throwIfAborted();
    authorizeTool(grant);
    validateToolArguments(schema, args);
    return boundedToolResult(
      await this.client.callTool({ name, arguments: args }, undefined, { timeout: 15000, signal }),
    );
  }
  async close() {
    await this.client.close();
    this.transport = undefined;
  }
}
