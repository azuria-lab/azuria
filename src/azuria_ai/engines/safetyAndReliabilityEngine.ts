import { emitEvent } from '../core/eventBus';

const eventCount: Record<string, number> = {};
const MAX_EVENTS_PER_WINDOW = 50;

export function guardEventLoop(eventType: string): boolean {
  eventCount[eventType] = (eventCount[eventType] || 0) + 1;
  if (eventCount[eventType] > MAX_EVENTS_PER_WINDOW) {
    emitFallback(`Loop detectado em ${eventType}`);
    return false;
  }
  return true;
}

export function resetCounts() {
  Object.keys(eventCount).forEach(k => delete eventCount[k]);
}

export function safePropagate(eventType: string, payload: any, options?: any) {
  if (!guardEventLoop(eventType)) {return;}
  emitEvent(eventType as any, payload, options);
}

export function emitFallback(reason: string) {
  emitEvent(
    'ai:fallback-engaged',
    { reason, timestamp: Date.now() },
    { source: 'safetyAndReliabilityEngine', priority: 9 }
  );
}

export function isolateEngine(engineName: string) {
  emitEvent(
    'ai:fallback-engaged',
    { reason: `Engine isolada: ${engineName}` },
    { source: 'safetyAndReliabilityEngine', priority: 9 }
  );
}

