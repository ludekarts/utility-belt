/**
 * Creates a deterministic signed 32-bit hash from a string.
 * This is non-cryptographic and must not be used for passwords, signatures,
 * integrity checks, authentication, or collision-sensitive identifiers.
 */
export function hashCode(source: string) {
  return source.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/**
 * Compress a JSON value into a Base64 string.
 * Requires `Blob`, `CompressionStream`, `Response`, and `btoa` support.
 */
export async function compressJson(json: any) {
  requireCapabilities(["Blob", "CompressionStream", "Response", "btoa"]);

  const stream = new Blob([JSON.stringify(json)], {
    type: "application/json",
  }).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  const response = await new Response(compressedStream);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64Encoded = globalThis.btoa(
    String.fromCharCode(...new Uint8Array(buffer)),
  );
  return base64Encoded;
}

/**
 * Decompress a Base64 JSON string.
 * Requires `Blob`, `DecompressionStream`, `Response`, and `atob` support.
 */
export async function decompressJson(comporessedJson: string) {
  requireCapabilities(["Blob", "DecompressionStream", "Response", "atob"]);

  const binaryString = globalThis.atob(comporessedJson);
  const length = binaryString.length;
  const bytes = new Uint8Array(new ArrayBuffer(length));
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const stream = new Blob([bytes], { type: "text/plain" }).stream();
  const decompressedStream = await stream.pipeThrough(
    new DecompressionStream("gzip"),
  );
  const response = new Response(decompressedStream);
  const blob = await response.blob();
  return JSON.parse(await blob.text());
}

function requireCapabilities(capabilities: string[]) {
  const missing = capabilities.filter(
    (capability) =>
      typeof (globalThis as Record<string, unknown>)[capability] !== "function",
  );

  if (missing.length > 0) {
    throw new Error(
      `UtilityBeltError: Compression is unavailable because ${missing.join(
        ", ",
      )} is not supported in this environment.`,
    );
  }
}
