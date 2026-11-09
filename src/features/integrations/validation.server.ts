import Ajv from "ajv";
const maxBytes = 64 * 1024;
export function validateToolArguments(schema: unknown, args: unknown) {
  const raw = JSON.stringify(schema);
  if (!raw || raw.length > 16000 || !schema || typeof schema !== "object" || Array.isArray(schema))
    throw new Error("Unsupported input schema.");
  // Restrict to a conservative JSON Schema subset; no remote references or regex
  // from untrusted servers. Review schemas before enabling any tool.
  const inspect = (value: unknown, depth: number) => {
    if (depth > 12) throw new Error("Schema is too deeply nested.");
    if (value && typeof value === "object")
      for (const [key, child] of Object.entries(value)) {
        if (["$ref", "$dynamicRef", "pattern", "patternProperties", "format"].includes(key))
          throw new Error("Schema requires unsupported validation features.");
        inspect(child, depth + 1);
      }
  };
  inspect(schema, 0);
  if (JSON.stringify(args).length > maxBytes) throw new Error("Arguments exceed the size limit.");
  const ajv = new Ajv({ strict: true, allErrors: false, validateFormats: false });
  if (!ajv.compile(schema)(args)) throw new Error("Tool arguments do not match the input schema.");
}
export function boundedToolResult(result: unknown) {
  const serialized = JSON.stringify(result);
  if (!serialized || new TextEncoder().encode(serialized).length > maxBytes)
    throw new Error("Tool result exceeds the size limit.");
  const data = result as { content?: unknown[]; isError?: boolean };
  if (!Array.isArray(data.content) || data.content.length > 100)
    throw new Error("Unsupported tool result.");
  const content = data.content.map((item) => {
    const part = item as { type?: string; text?: unknown };
    if (part.type !== "text" || typeof part.text !== "string")
      throw new Error("Only text tool results are supported.");
    return { type: "text" as const, text: part.text };
  });
  return { trust: "untrusted-external-data" as const, content, isError: data.isError === true };
}
