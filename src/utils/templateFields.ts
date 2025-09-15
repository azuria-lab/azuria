// Utilities to safely extract typed fields from template records

export function getNumberField(
  obj: Record<string, unknown> | null | undefined,
  key: string,
  defaultValue = 0
): number {
  const value = obj?.[key];
  if (typeof value === 'number') { return value; }
  if (typeof value === 'string') {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : defaultValue;
  }
  return defaultValue;
}

export function getStringField(
  obj: Record<string, unknown> | null | undefined,
  key: string,
  defaultValue = ''
): string {
  const value = obj?.[key];
  if (typeof value === 'string') { return value; }
  if (typeof value === 'number') { return String(value); }
  if (typeof value === 'boolean') { return value ? 'true' : 'false'; }
  return defaultValue;
}

export function getBooleanField(
  obj: Record<string, unknown> | null | undefined,
  key: string,
  defaultValue = false
): boolean {
  const value = obj?.[key];
  if (typeof value === 'boolean') { return value; }
  if (typeof value === 'string') { return value.toLowerCase() === 'true'; }
  if (typeof value === 'number') { return value !== 0; }
  return defaultValue;
}
