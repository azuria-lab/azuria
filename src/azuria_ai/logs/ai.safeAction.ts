/**
 * Log de ações seguras do Modo Deus
 */
type LogEntry = Record<string, unknown>;
const entries: LogEntry[] = [];
const LIMIT = 200;

export function logSafeAction(entry: LogEntry) {
  entries.push({ ...entry, timestamp: Date.now() });
  if (entries.length > LIMIT) {entries.shift();}
}

export function getSafeActionLog() {
  return [...entries];
}

