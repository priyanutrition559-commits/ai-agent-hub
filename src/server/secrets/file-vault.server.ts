import { constants } from "node:fs";
import { lstat, mkdir, open, rename, unlink } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join, resolve } from "node:path";
import { SecretKeyring, secretContextSchema, type SecretContext } from "./envelope.server";

/** Single-host private worker vault; not a browser API or a distributed secret manager.
 * All callers must already be authorized for the exact tenant/reference.
 */
export class FileSecretVault {
  private constructor(
    private readonly directory: string,
    private readonly keyring: SecretKeyring,
  ) {}
  static async create(directory: string, keyring: SecretKeyring) {
    const root = resolve(directory);
    await mkdir(root, { recursive: true, mode: 0o700 });
    const info = await lstat(root);
    if (
      !info.isDirectory() ||
      info.isSymbolicLink() ||
      (info.mode & 0o077) !== 0 ||
      (typeof process.getuid === "function" && info.uid !== process.getuid())
    )
      throw new Error("Vault directory must be private and owned by the worker.");
    return new FileSecretVault(root, keyring);
  }
  private path(context: SecretContext) {
    const value = secretContextSchema.parse(context);
    return join(
      this.directory,
      createHash("sha256")
        .update(JSON.stringify([value.ownerId, value.reference]))
        .digest("hex") + ".json",
    );
  }
  private async locked<T>(path: string, work: () => Promise<T>): Promise<T> {
    let lock;
    try {
      lock = await open(
        path + ".lock",
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      );
    } catch {
      throw new Error("Credential is busy or vault is unavailable.");
    }
    try {
      return await work();
    } finally {
      await lock.close();
      await unlink(path + ".lock");
    }
  }
  private async readEnvelope(path: string): Promise<unknown> {
    let handle;
    try {
      handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      const info = await handle.stat();
      if (
        !info.isFile() ||
        info.size > 12000 ||
        info.nlink !== 1 ||
        (typeof process.getuid === "function" && info.uid !== process.getuid()) ||
        (info.mode & 0o077) !== 0
      )
        throw new Error("Invalid credential file.");
      return JSON.parse(await handle.readFile("utf8"));
    } catch {
      throw new Error("Credential is unavailable.");
    } finally {
      await handle?.close();
    }
  }
  private async writeEnvelope(path: string, value: unknown) {
    const temporary = join(this.directory, `.write-${randomUUID()}`);
    let handle;
    try {
      handle = await open(
        temporary,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
        0o600,
      );
      await handle.writeFile(JSON.stringify(value), "utf8");
      await handle.sync();
      await handle.close();
      handle = undefined;
      await rename(temporary, path);
      const directory = await open(this.directory, constants.O_RDONLY);
      try {
        await directory.sync();
      } finally {
        await directory.close();
      }
    } finally {
      await handle?.close();
      await unlink(temporary).catch(() => {});
    }
  }
  async set(context: SecretContext, plaintext: string) {
    const path = this.path(context);
    // Encrypt before touching disk. Plaintext is never written to a temporary file.
    const envelope = this.keyring.encrypt(context, plaintext);
    await this.locked(path, () => this.writeEnvelope(path, envelope));
  }
  async get(context: SecretContext) {
    return this.keyring.decrypt(context, await this.readEnvelope(this.path(context)));
  }
  async rotate(context: SecretContext) {
    const path = this.path(context);
    await this.locked(path, async () =>
      this.writeEnvelope(path, this.keyring.rotate(context, await this.readEnvelope(path))),
    );
  }
  async revoke(context: SecretContext) {
    const path = this.path(context);
    await this.locked(path, async () => {
      await unlink(path).catch((error) => {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT")
          throw new Error("Credential revocation failed.");
      });
    });
  }
}
