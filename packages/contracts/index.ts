/** Platform-neutral wire contracts. No credentials, DOM or server imports. */
export type ConnectionState =
  | "configuration_required"
  | "disconnected"
  | "connecting"
  | "connected"
  | "reauthorization_required"
  | "failed";
export interface ConnectionSummary {
  id: string;
  provider: string;
  state: ConnectionState;
  enabled: boolean;
  protocolVersion: string | null;
  lastHealthCheck: string | null;
}
export interface UntrustedTextResult {
  trust: "untrusted-external-data";
  content: { type: "text"; text: string }[];
  isError: boolean;
}
/** A2A will have separate adapters and authorization, not an MCP transport. */
export type InteroperabilityProtocol = "mcp" | "a2a";
