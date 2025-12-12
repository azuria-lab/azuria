/**
 * Log interpretável humano de insights internos (XAI)
 */
type Entry = {
  reason: string;
  factors: string[];
  confidence: number;
  inconsistenciesFound: string[];
  timestamp: number;
};

const entries: Entry[] = [];
const LIMIT = 200;

export function logInternalInsight(entry: Omit<Entry, 'timestamp'>) {
  entries.push({ ...entry, timestamp: Date.now() });
  if (entries.length > LIMIT) {entries.shift();}
}

export function getInternalInsights() {
  return [...entries];
}

