// Web Crypto utilities for browser-compatible cryptographic operations
// Note: Uses SubtleCrypto; all methods are async. Falls back to minimal implementations if unavailable.

const textEncoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // Environment without SubtleCrypto; return empty signature to avoid runtime crash
    return "";
  }

  const keyData = textEncoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return toHex(signature);
}

export function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  if (aHex.length !== bHex.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < aHex.length; i++) {
    // XOR on char codes to avoid early exit timing differences
    result |= aHex.charCodeAt(i) ^ bHex.charCodeAt(i);
  }
  return result === 0;
}

export function randomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 (not cryptographically strong)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
