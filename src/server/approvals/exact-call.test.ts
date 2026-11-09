// @vitest-environment node
import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import {
  approvalBinding,
  canonicalArguments,
  consumeExactApproval,
  type ApprovalRecord,
} from "./exact-call.server";
const ownerId = randomUUID();
const call = {
  ownerId,
  agentId: randomUUID(),
  connectorId: randomUUID(),
  toolId: randomUUID(),
  toolSchemaHash: "a".repeat(64),
};
const args = { message: "send this", recipient: "someone" };
const now = 1000000;
const record = (): ApprovalRecord => ({
  id: randomUUID(),
  ownerId,
  approverId: ownerId,
  binding: approvalBinding(call, args).binding,
  decision: "approved",
  expiresAt: now + 60000,
  consumedAt: null,
});
describe("exact-call approval contracts", () => {
  it("canonicalizes object ordering but preserves array order", () => {
    expect(canonicalArguments({ b: 2, a: 1 })).toBe(canonicalArguments({ a: 1, b: 2 }));
    expect(canonicalArguments([1, 2])).not.toBe(canonicalArguments([2, 1]));
  });
  it("rejects unsupported or oversized arguments without invoking getters", () => {
    const getter = vi.fn();
    const value = Object.defineProperty({}, "secret", { get: getter, enumerable: true });
    for (const args of [
      value,
      new Date(),
      NaN,
      undefined,
      "x".repeat(65537),
      Array(3),
      { n: Infinity },
    ])
      expect(() => canonicalArguments(args)).toThrow();
    expect(getter).not.toHaveBeenCalled();
    const circular: Record<string, unknown> = {};
    circular["self"] = circular;
    expect(() => canonicalArguments(circular)).toThrow();
  });
  it("binds owner, agent, connector, tool, schema and arguments", () => {
    const base = approvalBinding(call, args).binding;
    for (const key of ["ownerId", "agentId", "connectorId", "toolId"] as const)
      expect(approvalBinding({ ...call, [key]: randomUUID() }, args).binding).not.toBe(base);
    expect(approvalBinding({ ...call, toolSchemaHash: "b".repeat(64) }, args).binding).not.toBe(
      base,
    );
    expect(approvalBinding(call, { ...args, message: "different" }).binding).not.toBe(base);
  });
  it("requires approval before attempting atomic consumption", async () => {
    const consume = vi.fn(async () => true);
    const valid = record();
    for (const patch of [
      { decision: "rejected" as const },
      { expiresAt: now },
      { consumedAt: now - 1 },
      { ownerId: randomUUID() },
      { approverId: randomUUID() },
      { binding: "f".repeat(64) },
      { expiresAt: now + 900001 },
    ])
      await expect(
        consumeExactApproval({ ...valid, ...patch }, call, args, ownerId, { consume }, now),
      ).rejects.toThrow();
    expect(consume).not.toHaveBeenCalled();
  });
  it("rejects actor mismatch", async () => {
    const consume = vi.fn(async () => true);
    await expect(
      consumeExactApproval(record(), call, args, randomUUID(), { consume }, now),
    ).rejects.toThrow();
    expect(consume).not.toHaveBeenCalled();
  });
  it("consumes once through a repository's atomic contract (fixture, not production persistence)", async () => {
    let used = false;
    const consume = vi.fn(async () => {
      if (used) return false;
      used = true;
      return true;
    });
    const value = record();
    const results = await Promise.allSettled([
      consumeExactApproval(value, call, args, ownerId, { consume }, now),
      consumeExactApproval(value, call, args, ownerId, { consume }, now),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  });
  it("does not consume changed arguments or schema versions", async () => {
    const consume = vi.fn(async () => true);
    await expect(
      consumeExactApproval(
        record(),
        call,
        { ...args, message: "different" },
        ownerId,
        { consume },
        now,
      ),
    ).rejects.toThrow();
    await expect(
      consumeExactApproval(
        record(),
        { ...call, toolSchemaHash: "c".repeat(64) },
        args,
        ownerId,
        { consume },
        now,
      ),
    ).rejects.toThrow();
    expect(consume).not.toHaveBeenCalled();
  });
  it("rejects invalid clocks before invoking storage", async () => {
    const consume = vi.fn(async () => true);
    for (const time of [NaN, Infinity, -1, 1.5])
      await expect(
        consumeExactApproval(record(), call, args, ownerId, { consume }, time),
      ).rejects.toThrow("evaluation time");
    expect(consume).not.toHaveBeenCalled();
  });
});
