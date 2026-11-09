// @vitest-environment node
import { randomBytes, randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SecretKeyring } from "./envelope.server";
const context = { ownerId: randomUUID(), reference: "providers/github" };
describe("credential envelope", () => {
  it("encrypts with unique nonces and decrypts only with matching context", () => {
    const ring = new SecretKeyring("v1", new Map([["v1", randomBytes(32)]]));
    const a = ring.encrypt(context, "private-token");
    const b = ring.encrypt(context, "private-token");
    expect(a.nonce).not.toBe(b.nonce);
    expect(JSON.stringify(a)).not.toContain("private-token");
    expect(ring.decrypt(context, a)).toBe("private-token");
    expect(() => ring.decrypt({ ...context, ownerId: randomUUID() }, a)).toThrow(
      "could not be decrypted",
    );
    expect(() => ring.decrypt({ ...context, reference: "different" }, a)).toThrow();
  });
  it("detects ciphertext, tag, nonce, version and key-id tampering", () => {
    const ring = new SecretKeyring(
      "v1",
      new Map([
        ["v1", randomBytes(32)],
        ["v2", randomBytes(32)],
      ]),
    );
    const value = ring.encrypt(context, "private-token");
    for (const patch of [
      { ciphertext: randomBytes(13).toString("base64") },
      { tag: randomBytes(16).toString("base64") },
      { nonce: randomBytes(12).toString("base64") },
      { version: 2 },
      { keyId: "v2" },
    ])
      expect(() => ring.decrypt(context, { ...value, ...patch })).toThrow("could not be decrypted");
  });
  it("rotates without requiring old keys for the new ciphertext", () => {
    const old = randomBytes(32),
      next = randomBytes(32);
    const oldRing = new SecretKeyring("v1", new Map([["v1", old]]));
    const nextRing = new SecretKeyring(
      "v2",
      new Map([
        ["v1", old],
        ["v2", next],
      ]),
    );
    const rotated = nextRing.rotate(context, oldRing.encrypt(context, "credential"));
    expect(rotated.keyId).toBe("v2");
    expect(new SecretKeyring("v2", new Map([["v2", next]])).decrypt(context, rotated)).toBe(
      "credential",
    );
  });
  it("bounds key configuration and credential sizes", () => {
    expect(() => new SecretKeyring("v1", new Map([["v1", randomBytes(16)]]))).toThrow();
    expect(() => new SecretKeyring("v2", new Map([["v1", randomBytes(32)]]))).toThrow();
    const ring = new SecretKeyring("v1", new Map([["v1", randomBytes(32)]]));
    expect(() => ring.encrypt(context, "")).toThrow();
    expect(() => ring.encrypt(context, "x".repeat(8193))).toThrow();
  });
  it("supports key destruction without modifying caller-owned bytes", () => {
    const key = randomBytes(32),
      copy = Buffer.from(key);
    const ring = new SecretKeyring("v1", new Map([["v1", key]]));
    const value = ring.encrypt(context, "credential");
    ring.destroy();
    expect(key.equals(copy)).toBe(true);
    expect(() => ring.decrypt(context, value)).toThrow();
  });
});
