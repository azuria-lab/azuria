/**
 * Logs de governança e coerência do Modo Deus.
 * Uso interno — não expor ao usuário final.
 */

type LogEntry = Record<string, unknown>;

const contradictions: LogEntry[] = [];
const justifications: LogEntry[] = [];
const coherenceScores: LogEntry[] = [];
const governanceEvents: LogEntry[] = [];
const LIMIT = 200;

function push(list: LogEntry[], entry: LogEntry) {
  list.push({ ...entry, timestamp: Date.now() });
  if (list.length > LIMIT) {list.shift();}
}

export function logContradiction(entry: LogEntry) {
  push(contradictions, entry);
}

export function logJustification(entry: LogEntry) {
  push(justifications, entry);
}

export function logCoherence(entry: LogEntry) {
  push(coherenceScores, entry);
}

export function logGovernance(entry: LogEntry) {
  push(governanceEvents, entry);
}

export function getConsciousLogs() {
  return {
    contradictions: [...contradictions],
    justifications: [...justifications],
    coherenceScores: [...coherenceScores],
    governanceEvents: [...governanceEvents],
  };
}

