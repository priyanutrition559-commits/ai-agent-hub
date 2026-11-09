import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { agentDraftSchema, serverDraftSchema } from "./policy";

// Do not expose remote execution until the managed database, transactional
// approval/audit workflow and trusted egress gateway are deployed together.
const blocked = {
  ok: false as const,
  code: "CONFIGURATION_REQUIRED" as const,
  message:
    "Not saved or connected. Lovable-managed database, secret storage and a trusted MCP egress gateway must be deployed first. No external request was made.",
};
export const validateServerDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(serverDraftSchema)
  .handler(() => ({ ...blocked, valid: true }));
export const validateAgentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(agentDraftSchema)
  .handler(() => blocked);
export const connectorAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z
      .object({
        connectorId: z.string().min(1).max(80),
        action: z.enum(["connect", "disconnect", "test", "discover", "permissions", "reauthorize"]),
      })
      .strict(),
  )
  .handler(() => blocked);
export const getAdminReadiness = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(({ context }) => {
    // Only server-controlled app_metadata is trusted; never user_metadata.
    const metadata = context.claims["app_metadata"] as Record<string, unknown> | undefined;
    if (metadata?.["role"] !== "admin") throw new Error("Administrator access required.");
    return {
      ...blocked,
      checks: [
        "Managed schema: deployment required",
        "Secret manager: configuration required",
        "Trusted egress: deployment required",
        "Execution: disabled",
      ],
    };
  });
