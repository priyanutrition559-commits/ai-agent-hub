# Encrypted worker credentials and exact-call approval contracts

## Delivery boundary

This pass adds tested Node-only security modules, not a deployed provider connection or agent executor. They are not imported by browser components, routes or hosted server functions. Existing connector/agent mutation handlers still return configuration-required. Managed schema and deployment are unchanged.

## Credential encryption

`SecretKeyring` uses Node's AES-256-GCM implementation, a random 96-bit nonce and 128-bit authentication tag. Associated data binds each envelope to a format/version, encryption key version, tenant UUID and secret reference. Copying ciphertext to another tenant/reference or changing its tag/key version causes authentication failure. Keys are copied into worker memory and are never serialized into envelopes. Key versions are explicit and bounded; the active version encrypts new data while older versions can decrypt during migration.

Plaintext is bounded to 8192 UTF-8 bytes. Temporary plaintext byte buffers are zeroed after encryption/decryption, and `destroy()` clears the keyring's copied key buffers. JavaScript strings and runtime copies cannot be guaranteed to be zeroized; this is not a claim of secure memory isolation. Deployment secret-manager permissions and process isolation remain mandatory.

`rotate()` re-encrypts the same credential under the active encryption key. **It does not rotate or revoke the external provider's token.** Remove old key versions only after all envelopes and recovery backups have been accounted for. No master keys were generated for deployment or committed. Test keys are ephemeral cryptographic random bytes.

## Single-host file vault

`FileSecretVault` is an optional controlled-worker storage implementation, not a distributed KMS or browser API. It requires a private directory (0700) owned by the worker. Filenames are SHA-256 hashes of tenant/reference tuples, not user-supplied paths. Credential files are 0600, bounded, single-link, regular files; symlink reads and public-permission files are rejected. Plaintext is never written to a file, including temporary files.

Writes use private exclusive temporary files, fsync and atomic rename. A per-reference exclusive lock serializes set/rotate/delete operations; a competing operation fails closed instead of overwriting concurrently. Atomic rename allows readers to see either complete envelope version. Rotation holds the same lock from read through replacement.

Operational constraints:
- Use a dedicated trusted local filesystem, outside Git and the container image. Not a shared/untrusted NFS volume or a distributed locking solution.
- Trusted configuration controls the vault root and its parent directories. A compromised same-user process/root OS is outside this boundary.
- A worker crash may leave a lock file. Stop the relevant worker, confirm no operation is active, inspect encrypted-file consistency, then remove only the stale lock. There is no unsafe automatic stale-lock eviction.
- Revoke deletes the local envelope; it does not invalidate provider tokens or cancel credentials already read by an in-flight process. Dispatch-time permission checks, provider revocation, run cancellation and audit persistence are still required.
- Back up ciphertext and encryption key versions separately, with independent access controls. Test restore before release.
- Storage failures must fail the application operation closed; no plaintext fallback is allowed.

## Authorization remains separate

Neither the vault nor the keyring determines whether an actor may access a tenant reference. A future authenticated worker must validate the authorized job, current connector state, scopes, ownership, approval and budget before invoking the vault. Do not expose `get()` or serialized keyring configuration as a user-facing API. The pinned egress gateway's server-only authorization callback is the intended credential-use boundary after DNS authorization.

## Exact-call approvals

`canonicalArguments()` accepts only bounded plain JSON, sorts object keys and preserves array order. It rejects non-finite values, undefined, sparse/computed arrays, getters, class instances, symbols on objects and excessive bytes/depth/nodes. No argument text is included in error messages.

`approvalBinding()` hashes owner, agent, connector, tool, reviewed schema hash and canonical arguments. A changed target, tool schema or arguments produces a different binding. These fields must come from reviewed server records, not model-provided safety claims.

`consumeExactApproval()` checks owner/actor/approver identity, approval decision, binding, expiry and consumed state. It permits owner approval only; delegated administrator approval is not implemented. A maximum remaining validity of 15 minutes is enforced. It then calls the `ApprovalRepository.consume` contract.

**There is no production ApprovalRepository implementation yet.** The repository must atomically compare current owner, binding, decision, expiration and consumed state, and consume once within the same transaction that reserves quota and appends the audit record. Use database time for expiration. A read-then-update pair is unsafe. Tests use an explicitly labelled isolated atomic fixture; they do not prove RLS, durable replay protection or production concurrency.

## Required acceptance before wiring execution

1. Apply Lovable-managed schema and RLS; implement atomic consume/audit/quota RPCs.
2. Provision server master keys privately, implement loader identity/access controls and key rotation/backup policy.
3. Authorize tenant-scoped jobs and references at every operation; never infer authorization from possession of a reference.
4. Test cross-user denial, audit rollback, schema-change invalidation, approval replay and concurrency against the actual database.
5. Test deployed worker vault ownership, crash-lock recovery, provider revocation and encryption-key restore/rotation.
6. Only then wire the modules to live MCP invocation. No new network/API execution route was added by this pass.
