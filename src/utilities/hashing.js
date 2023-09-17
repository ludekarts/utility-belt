
// Encode Base 64.
export function base64Encode(data) {
  return window.btoa(encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode('0x' + p1)
  ));
}

// Create hashCode from string.
export function hashCode(source) {
  return source.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
}


// Compress JSON object into Base64 string.
export async function compressJson(json) {
  const stream = new Blob([JSON.stringify(json)], { type: "application/json" }).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream("gzip"));
  const response = await new Response(compressedStream);
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64Encoded = window.btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64Encoded;
}

// Decompress JSON-base64 string back into JSOM object.
export async function decompressJson(comporessedJson) {
  const binaryString = window.atob(comporessedJson);
  const length = binaryString.length;
  const bytes = new Uint8Array(new ArrayBuffer(length));
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const stream = new Blob([bytes], { type: "text/plain" }).stream();
  const decompressedStream = await stream.pipeThrough(new DecompressionStream("gzip"));
  const response = new Response(decompressedStream);
  const blob = await response.blob();
  return JSON.parse(await blob.text());
}

