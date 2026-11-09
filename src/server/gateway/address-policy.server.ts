import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import { validateEndpoint } from "@/features/integrations/policy";

export type ResolvedAddress = { address: string; family: number };
export type Resolver = (hostname: string) => Promise<ResolvedAddress[]>;
export const systemResolver: Resolver = (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

/** Conservative policy: only ordinary global unicast, no IPv6 transition mechanisms. */
export function isPublicAddress(value: string): boolean {
  if (value.includes("%") || !ipaddr.isValid(value)) return false;
  const address = ipaddr.parse(value);
  if (address.range() !== "unicast") return false;
  if (address.kind() === "ipv6") {
    // Only the allocated global-unicast space; deny special-purpose 2001 ranges.
    const ipv6 = address as ipaddr.IPv6;
    return (
      ipv6.match(ipaddr.parse("2000::") as ipaddr.IPv6, 3) &&
      !ipv6.match(ipaddr.parse("2001::") as ipaddr.IPv6, 23) &&
      !ipv6.match(ipaddr.parse("3fff::") as ipaddr.IPv6, 20)
    );
  }
  return true;
}

export function approvedEndpoint(endpoint: string, allowlist: ReadonlySet<string>) {
  const canonical = validateEndpoint(endpoint);
  if (!allowlist.has(canonical)) throw new Error("Endpoint is not operator-allowlisted.");
  return new URL(canonical);
}

export async function resolvePublicTarget(url: URL, resolve: Resolver, signal: AbortSignal) {
  signal.throwIfAborted();
  // Bound DNS even when the OS resolver itself cannot be cancelled.
  let onAbort: () => void = () => {};
  const aborted = new Promise<never>((_resolve, reject) => {
    onAbort = () => reject(new Error("Endpoint resolution cancelled or timed out."));
    signal.addEventListener("abort", onAbort, { once: true });
  });
  try {
    const answers = await Promise.race([resolve(url.hostname), aborted]);
    signal.throwIfAborted();
    if (
      !answers.length ||
      answers.length > 32 ||
      answers.some(
        (answer) =>
          !isPublicAddress(answer.address) ||
          (answer.family !== 4 && answer.family !== 6) ||
          (ipaddr.parse(answer.address).kind() === "ipv4" ? 4 : 6) !== answer.family,
      )
    )
      throw new Error("Endpoint DNS returned disallowed addresses.");
    return answers[0]!;
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
}
