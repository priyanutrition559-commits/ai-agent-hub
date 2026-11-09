import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { z } from "zod";

const keyIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
export const secretContextSchema = z
  .object({
    ownerId: z.string().uuid(),
    reference: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[A-Za-z0-9_/-]+$/),
  })
  .strict();
export type SecretContext = z.infer<typeof secretContextSchema>;
const envelopeSchema = z
  .object({
    version: z.literal(1),
    keyId: keyIdSchema,
    nonce: z.string().length(16),
    tag: z.string().length(24),
    ciphertext: z.string().min(4).max(11000),
  })
  .strict();
export type SecretEnvelope = z.infer<typeof envelopeSchema>;
const maxSecretBytes = 8192;

function decode(value: string, length?: number) {
  const bytes = Buffer.from(value, "base64");
  if (bytes.toString("base64") !== value || (length !== undefined && bytes.length !== length))
    throw new Error("Invalid envelope encoding.");
  return bytes;
}

/** Worker-only AES-256-GCM keyring. Master keys come from operator secret storage. */
export class SecretKeyring {
  private readonly keys = new Map<string, Buffer>();
  readonly activeKeyId: string;
  constructor(activeKeyId: string, keys: ReadonlyMap<string, Uint8Array>) {
    this.activeKeyId = keyIdSchema.parse(activeKeyId);
    if (keys.size < 1 || keys.size > 8)
      throw new Error("Configure one to eight secret key versions.");
    for (const [id, key] of keys) {
      keyIdSchema.parse(id);
      if (key.byteLength !== 32) throw new Error("Master keys must be 32 bytes.");
      this.keys.set(id, Buffer.from(key));
    }
    if (!this.keys.has(activeKeyId)) throw new Error("Active secret key version is missing.");
  }
  private aad(context: SecretContext, keyId: string) {
    const validated = secretContextSchema.parse(context);
    return Buffer.from(
      JSON.stringify(["stack-atlas-secret", 1, keyId, validated.ownerId, validated.reference]),
    );
  }
  encrypt(context: SecretContext, plaintext: string): SecretEnvelope {
    const bytes = Buffer.from(plaintext, "utf8");
    try {
      if (!bytes.length || bytes.length > maxSecretBytes)
        throw new Error("Credential size is outside the supported limit.");
      const nonce = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", this.keys.get(this.activeKeyId)!, nonce, {
        authTagLength: 16,
      });
      cipher.setAAD(this.aad(context, this.activeKeyId));
      const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
      return {
        version: 1,
        keyId: this.activeKeyId,
        nonce: nonce.toString("base64"),
        tag: cipher.getAuthTag().toString("base64"),
        ciphertext: ciphertext.toString("base64"),
      };
    } finally {
      bytes.fill(0);
    }
  }
  decrypt(context: SecretContext, input: unknown): string {
    let plaintext: Buffer | undefined;
    try {
      const envelope = envelopeSchema.parse(input);
      const key = this.keys.get(envelope.keyId);
      if (!key) throw new Error("Missing key version.");
      const ciphertext = decode(envelope.ciphertext);
      if (ciphertext.length > maxSecretBytes) throw new Error("Oversized envelope.");
      const decipher = createDecipheriv("aes-256-gcm", key, decode(envelope.nonce, 12), {
        authTagLength: 16,
      });
      decipher.setAAD(this.aad(context, envelope.keyId));
      decipher.setAuthTag(decode(envelope.tag, 16));
      plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      const text = new TextDecoder("utf-8", { fatal: true }).decode(plaintext);
      if (!text) throw new Error("Empty credential.");
      return text;
    } catch {
      throw new Error("Credential could not be decrypted.");
    } finally {
      plaintext?.fill(0);
    }
  }
  rotate(context: SecretContext, envelope: unknown) {
    return this.encrypt(context, this.decrypt(context, envelope));
  }
  destroy() {
    for (const key of this.keys.values()) key.fill(0);
    this.keys.clear();
  }
}
