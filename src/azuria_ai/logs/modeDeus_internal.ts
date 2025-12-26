/**
 * Logs internos do Modo Deus - não expor ao usuário final.
 * Mantém rastros para evolução contínua da IA.
 */

type LogPayload = Record<string, unknown>;

const riskLog: LogPayload[] = [];
const opportunityLog: LogPayload[] = [];
const predictiveLog: LogPayload[] = [];
const conflictLog: LogPayload[] = [];

function pushWithLimit(arr: LogPayload[], item: LogPayload, limit = 200) {
  arr.push({ ...item, timestamp: Date.now() });
  if (arr.length > limit) {arr.shift();}
}

export function logRisk(entry: LogPayload) {
  pushWithLimit(riskLog, entry);
  // eslint-disable-next-line no-console
  console.debug('[ModoDeus][risk]', entry);
}

export function logOpportunity(entry: LogPayload) {
  pushWithLimit(opportunityLog, entry);
  // eslint-disable-next-line no-console
  console.debug('[ModoDeus][opportunity]', entry);
}

export function logPredictive(entry: LogPayload) {
  pushWithLimit(predictiveLog, entry);
  // eslint-disable-next-line no-console
  console.debug('[ModoDeus][predictive]', entry);
}

export function logConflict(entry: LogPayload) {
  pushWithLimit(conflictLog, entry);
  // eslint-disable-next-line no-console
  console.warn('[ModoDeus][conflict]', entry);
}

export function getInternalLogs() {
  return {
    risk: [...riskLog],
    opportunity: [...opportunityLog],
    predictive: [...predictiveLog],
    conflict: [...conflictLog],
  };
}

