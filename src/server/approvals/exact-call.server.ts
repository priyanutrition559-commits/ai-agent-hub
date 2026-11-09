import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

const identity = z
  .object({
    ownerId: z.string().uuid(),
    agentId: z.string().uuid(),
    connectorId: z.string().uuid(),
    toolId: z.string().uuid(),
    toolSchemaHash: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type CallIdentity = z.infer<typeof identity>;

/** Stable, bounded JSON only: no getters, classes, cycles, non-finite numbers or remote refs. */
export function canonicalArguments(input: unknown): string {
  const pieces: string[] = [];
  let bytes = 0;
  let nodes = 0;
  const append = (text: string) => {
    bytes += Buffer.byteLength(text);
    if (bytes > 65536) throw new Error("Arguments exceed the size limit.");
    pieces.push(text);
  };
  const visit = (value: unknown, depth: number) => {
    if (depth > 12 || ++nodes > 2000) throw new Error("Arguments exceed structural limits.");
    if (value === null || typeof value === "boolean" || typeof value === "string") {
      append(JSON.stringify(value));
      return;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new Error("Only finite JSON numbers are supported.");
      append(JSON.stringify(value));
      return;
    }
    if (Array.isArray(value)) {
      append("[");
      for (let i = 0; i < value.length; i++) {
        if (i) append(",");
        const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
        if (!descriptor || !("value" in descriptor))
          throw new Error("Sparse or computed arguments are not supported.");
        visit(descriptor.value, depth + 1);
      }
      append("]");
      return;
    }
    if (typeof value !== "object" || Object.getPrototypeOf(value) !== Object.prototype)
      throw new Error("Only plain JSON arguments are supported.");
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const keys = Object.keys(descriptors).sort();
    if (Object.getOwnPropertySymbols(value).length)
      throw new Error("Symbols are not JSON arguments.");
    append("{");
    keys.forEach((key, index) => {
      const entry = descriptors[key]!;
      if (!entry.enumerable || !("value" in entry))
        throw new Error("Computed arguments are not supported.");
      if (index) append(",");
      append(JSON.stringify(key));
      append(":");
      visit(entry.value, depth + 1);
    });
    append("}");
  };
  visit(input, 0);
  return pieces.join("");
}
export function approvalBinding(call: CallIdentity, args: unknown) {
  const value = identity.parse(call);
  const argumentsHash = createHash("sha256").update(canonicalArguments(args)).digest("hex");
  const binding = createHash("sha256")
    .update(
      JSON.stringify([
        "stack-atlas-call-v1",
        value.ownerId,
        value.agentId,
        value.connectorId,
        value.toolId,
        value.toolSchemaHash,
        argumentsHash,
      ]),
    )
    .digest("hex");
  return { binding, argumentsHash };
}
export interface ApprovalRecord {
  id: string;
  ownerId: string;
  approverId: string;
  binding: string;
  decision: "approved" | "rejected";
  expiresAt: number;
  consumedAt: number | null;
}
/** Implement as a transactional RPC with authorization, quota reservation and audit.
 * Must compare owner/binding/status/expiry and consume exactly once atomically.
 * A read-then-write implementation does NOT satisfy this interface.
 */
export interface ApprovalRepository {
  consume(input: { id: string; ownerId: string; binding: string; now: number }): Promise<boolean>;
}
const approval = z
  .object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    approverId: z.string().uuid(),
    binding: z.string().regex(/^[a-f0-9]{64}$/),
    decision: z.enum(["approved", "rejected"]),
    expiresAt: z.number().int().nonnegative(),
    consumedAt: z.number().int().nonnegative().nullable(),
  })
  .strict();
export async function consumeExactApproval(
  record: ApprovalRecord,
  call: CallIdentity,
  args: unknown,
  actorId: string,
  repository: ApprovalRepository,
  now = Date.now(),
) {
  if (!Number.isSafeInteger(now) || now < 0) throw new Error("Invalid approval evaluation time.");
  const parsed = approval.parse(record);
  const { binding } = approvalBinding(call, args);
  if (
    actorId !== call.ownerId ||
    parsed.ownerId !== call.ownerId ||
    parsed.approverId !== call.ownerId ||
    parsed.decision !== "approved" ||
    parsed.consumedAt !== null ||
    parsed.expiresAt <= now ||
    parsed.expiresAt - now > 15 * 60 * 1000 ||
    !timingSafeEqual(Buffer.from(parsed.binding, "hex"), Buffer.from(binding, "hex"))
  )
    throw new Error("A valid owner approval for this exact call is required.");
  if (!(await repository.consume({ id: parsed.id, ownerId: call.ownerId, binding, now })))
    throw new Error("Approval expired, changed or was already consumed.");
}
