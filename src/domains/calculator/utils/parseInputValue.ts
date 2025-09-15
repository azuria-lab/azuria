export function parseInputValue(value: string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  const raw = String(value).trim();
  if (!raw) {
    return 0;
  }

  // Remove currency symbols and spaces
  let sanitized = raw.replace(/[R$\s]/g, '');

  // Handle BR format: 1.234,56 => 1234.56
  const hasCommaDecimal = /,\d{1,2}$/.test(sanitized) || sanitized.includes(',');
  if (hasCommaDecimal) {
    sanitized = sanitized.replace(/\./g, ''); // remove thousand separators
    sanitized = sanitized.replace(/,/g, '.'); // convert decimal comma to dot
  }

  const parsed = parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
}
