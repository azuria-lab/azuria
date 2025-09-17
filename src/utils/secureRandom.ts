/**
 * Secure randomness utilities wrapping Web Crypto when available.
 * Non-secure fallbacks are used only when necessary (e.g., older browsers).
 */

// Secure float in [0,1)
export function secureRandom(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x100000000; // 2^32
  }
  return Math.random(); // fallback (not cryptographically strong)
}

export function secureRandomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(out);
    return out;
  }
  for (let i = 0; i < length; i++) { out[i] = Math.floor(Math.random() * 256); }
  return out;
}

// Base36 ID
export function randomId(length = 16): string {
  const bytesNeeded = Math.ceil((length * Math.log2(36)) / 8);
  const bytes = secureRandomBytes(bytesNeeded);
  let out = '';
  for (let i = 0; i < bytes.length && out.length < length; i++) {
    out += (bytes[i] % 36).toString(36);
  }
  return out.slice(0, length);
}

export function randomSessionId(prefix = 'session'): string {
  return `${prefix}_${Date.now()}_${randomId(12)}`;
}

export function randomUUIDv4(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  const b = secureRandomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h: string[] = [];
  for (let i = 0; i < b.length; i++) {h.push(b[i].toString(16).padStart(2, '0'));}
  return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10,16).join('')}`;
}
