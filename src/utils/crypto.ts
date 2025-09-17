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
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  // Use globalThis to avoid TS narrowing issues when DOM lib not present
  interface CryptoLike { getRandomValues?: (arr: Uint8Array) => void; randomUUID?: () => string; }
  const g = (typeof globalThis !== 'undefined') ? (globalThis as { crypto?: CryptoLike }) : {};
  if (g.crypto && typeof g.crypto.getRandomValues === 'function') {
    g.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }
  return `${hex.slice(0,4).join('')}-${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,16).join('')}`;
}
