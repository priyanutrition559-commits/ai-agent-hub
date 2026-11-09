// @vitest-environment node
import { mkdtemp, readFile, readdir, rm, stat, chmod, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SecretKeyring } from "./envelope.server";
import { FileSecretVault } from "./file-vault.server";
let directory: string;
const context = { ownerId: randomUUID(), reference: "providers/github" };
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "atlas-vault-test-"));
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});
const ring = () => new SecretKeyring("v1", new Map([["v1", randomBytes(32)]]));
describe("private single-host encrypted vault", () => {
  it("persists only encrypted material, reads it, and revokes it", async () => {
    const vault = await FileSecretVault.create(directory, ring());
    await vault.set(context, "test-only-token");
    const files = await readdir(directory);
    expect(files).toHaveLength(1);
    const path = join(directory, files[0]!);
    expect(await readFile(path, "utf8")).not.toContain("test-only-token");
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    expect(await vault.get(context)).toBe("test-only-token");
    await vault.revoke(context);
    await expect(vault.get(context)).rejects.toThrow("unavailable");
  });
  it("separates owners using the same reference", async () => {
    const vault = await FileSecretVault.create(directory, ring());
    await vault.set(context, "owner-one");
    const other = { ...context, ownerId: randomUUID() };
    await vault.set(other, "owner-two");
    expect(await vault.get(context)).toBe("owner-one");
    expect(await vault.get(other)).toBe("owner-two");
  });
  it("rotates persisted ciphertext atomically", async () => {
    const old = randomBytes(32),
      next = randomBytes(32);
    const vault = await FileSecretVault.create(
      directory,
      new SecretKeyring("v1", new Map([["v1", old]])),
    );
    await vault.set(context, "credential");
    const rotator = await FileSecretVault.create(
      directory,
      new SecretKeyring(
        "v2",
        new Map([
          ["v1", old],
          ["v2", next],
        ]),
      ),
    );
    await rotator.rotate(context);
    const reader = await FileSecretVault.create(
      directory,
      new SecretKeyring("v2", new Map([["v2", next]])),
    );
    expect(await reader.get(context)).toBe("credential");
  });
  it("refuses public directories and symlink roots", async () => {
    await chmod(directory, 0o755);
    await expect(FileSecretVault.create(directory, ring())).rejects.toThrow("private");
    await chmod(directory, 0o700);
    const link = join(directory, "link");
    await symlink(directory, link);
    await expect(FileSecretVault.create(link, ring())).rejects.toThrow();
  });
  it("rejects symlink credential reads", async () => {
    const vault = await FileSecretVault.create(directory, ring());
    await vault.set(context, "credential");
    const file = (await readdir(directory))[0]!;
    const path = join(directory, file);
    await rm(path);
    await writeFile(join(directory, "outside"), "secret");
    await symlink(join(directory, "outside"), path);
    await expect(vault.get(context)).rejects.toThrow("unavailable");
  });
  it("fails closed for an existing operation lock", async () => {
    const vault = await FileSecretVault.create(directory, ring());
    await vault.set(context, "credential");
    const file = (await readdir(directory))[0]!;
    await writeFile(join(directory, file + ".lock"), "");
    await expect(vault.set(context, "replacement")).rejects.toThrow("busy");
    expect(await vault.get(context)).toBe("credential");
  });
  it("rejects credential files made readable by other users", async () => {
    const vault = await FileSecretVault.create(directory, ring());
    await vault.set(context, "credential");
    const file = (await readdir(directory))[0]!;
    await chmod(join(directory, file), 0o644);
    await expect(vault.get(context)).rejects.toThrow("unavailable");
  });
});
