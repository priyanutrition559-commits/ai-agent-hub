/** Post-parse metadata limits. The worker must additionally cap bytes on the wire. */
export const discoveryLimits = { pages: 5, records: 200, bytes: 256 * 1024, cursorLength: 1024 };

export async function collectDiscoveryPages<T>(
  fetchPage: (
    cursor: string | undefined,
  ) => Promise<{ items: T[]; nextCursor?: string | undefined }>,
  signal: AbortSignal,
): Promise<T[]> {
  const items: T[] = [];
  const cursors = new Set<string>();
  let cursor: string | undefined;
  let bytes = 0;
  for (let page = 0; page < discoveryLimits.pages; page++) {
    signal.throwIfAborted();
    const result = await fetchPage(cursor);
    signal.throwIfAborted();
    bytes += new TextEncoder().encode(JSON.stringify(result)).byteLength;
    if (
      bytes > discoveryLimits.bytes ||
      result.items.length + items.length > discoveryLimits.records
    ) {
      throw new Error("Discovery exceeds metadata limits. No partial snapshot accepted.");
    }
    items.push(...result.items);
    if (result.nextCursor === undefined) return items;
    if (
      !result.nextCursor ||
      result.nextCursor.length > discoveryLimits.cursorLength ||
      cursors.has(result.nextCursor)
    ) {
      throw new Error("Invalid or repeated discovery cursor.");
    }
    cursors.add(result.nextCursor);
    cursor = result.nextCursor;
  }
  throw new Error("Discovery exceeds page limit. No partial snapshot accepted.");
}
