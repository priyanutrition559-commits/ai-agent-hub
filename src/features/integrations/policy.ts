import { z } from "zod";

// Syntax gate only. DNS validation and connection-time IP pinning belong to the
// trusted egress gateway. This function is NOT permission to fetch a URL.
export function validateEndpoint(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a valid HTTPS endpoint URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    url.search ||
    (url.port && url.port !== "443")
  ) {
    throw new Error("Use HTTPS on port 443 without credentials, query strings or fragments.");
  }
  const host = url.hostname.toLowerCase();
  if (
    !host.includes(".") ||
    host.endsWith(".") ||
    /[:[\]]/.test(host) ||
    /^\d+(\.\d+){3}$/.test(host) ||
    /(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(host) ||
    host === "metadata.google.internal"
  ) {
    throw new Error(
      "Use a public DNS hostname. Local, private and literal IP targets are not allowed.",
    );
  }
  return url.href;
}
export const serverDraftSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    endpoint: z
      .string()
      .max(2048)
      .transform((value, ctx) => {
        try {
          return validateEndpoint(value);
        } catch (error) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: (error as Error).message });
          return z.NEVER;
        }
      }),
    transport: z.literal("streamable-http"),
    authentication: z.enum(["none", "bearer"]),
    secretReference: z
      .string()
      .max(120)
      .regex(/^[a-zA-Z0-9_/-]*$/, "Use a secret reference, never a token value."),
    scopes: z.array(z.string().trim().min(1).max(80)).max(20),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.authentication === "bearer" && !data.secretReference)
      ctx.addIssue({
        code: "custom",
        path: ["secretReference"],
        message: "A server-side secret reference is required.",
      });
    if (data.authentication === "none" && data.secretReference)
      ctx.addIssue({
        code: "custom",
        path: ["secretReference"],
        message: "No secret reference is permitted with anonymous authentication.",
      });
  });
export const agentDraftSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    description: z.string().max(500),
    provider: z.literal("lovable-gateway"),
    model: z.string().trim().min(1).max(120),
    instructions: z.string().max(8000),
    tools: z.array(z.string().uuid()).max(50),
    maxToolCalls: z.number().int().min(1).max(20),
    timeoutSeconds: z.number().int().min(5).max(120),
    budgetCents: z.number().int().min(0).max(10000),
    requireApproval: z.literal(true),
  })
  .strict();
export type ToolGrant = {
  ownerId: string;
  actorId: string;
  enabled: boolean;
  connectorEnabled: boolean;
  agentAllowed: boolean;
  requiredScopes: string[];
  grantedScopes: string[];
  // Risk is application-reviewed policy, never an MCP annotation.
  risk: "read" | "sensitive";
  approvalMatchesCall: boolean;
};
export function authorizeTool(grant: ToolGrant) {
  if (
    grant.ownerId !== grant.actorId ||
    !grant.enabled ||
    !grant.connectorEnabled ||
    !grant.agentAllowed
  )
    throw new Error("Permission denied.");
  if (grant.requiredScopes.some((s) => !grant.grantedScopes.includes(s)))
    throw new Error("Required scope not granted.");
  if (grant.risk !== "read" && !grant.approvalMatchesCall)
    throw new Error("Explicit approval required for this exact call.");
}
export function mayRetry(input: { readOnly: boolean; transient: boolean; attempt: number }) {
  // No automatic retries of writes, even if a tool claims to be idempotent.
  return input.readOnly && input.transient && input.attempt < 2;
}
export function redactMetadata(input: unknown, depth = 0): unknown {
  if (depth > 8) return "[omitted]";
  if (Array.isArray(input)) return input.slice(0, 50).map((v) => redactMetadata(v, depth + 1));
  if (input && typeof input === "object")
    return Object.fromEntries(
      Object.entries(input)
        .slice(0, 50)
        .map(([key, value]) => [
          key,
          /secret|token|password|authorization|cookie|credential|instructions|arguments|content|result/i.test(
            key,
          )
            ? "[redacted]"
            : redactMetadata(value, depth + 1),
        ]),
    );
  // Audit logs deliberately exclude all free text; values may contain secrets.
  return typeof input === "string" ? "[text omitted]" : input;
}
