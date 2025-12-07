type EvolutionEventType = 'learning' | 'pattern' | 'insight' | 'memory' | 'query';

interface EvolutionEntry {
  id: string;
  type: EvolutionEventType;
  payload: any;
  created_at: number;
}

const events: EvolutionEntry[] = [];
const snapshots: any[] = [];

export function addEvolutionEvent(type: EvolutionEventType, payload: any) {
  const entry: EvolutionEntry = {
    id: `evo_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    payload,
    created_at: Date.now(),
  };
  events.unshift(entry);
  if (events.length > 300) events.pop();
  return entry;
}

export function listEvolutionEvents(limit = 50) {
  return events.slice(0, limit);
}

export function addEvolutionSnapshot(snapshot: any) {
  snapshots.unshift({ id: `snap_${Date.now()}`, snapshot, created_at: Date.now() });
  if (snapshots.length > 100) snapshots.pop();
}

export function listEvolutionSnapshots(limit = 20) {
  return snapshots.slice(0, limit);
}

