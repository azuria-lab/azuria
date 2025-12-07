import { emitEvent } from '../core/eventBus';

export interface ConsistencyReport {
  watchersHealthy: boolean;
  eventsConsumed: boolean;
  missingHandlers: string[];
  uiReceiving: boolean;
  driftDetected: boolean;
}

export function runConsistencyCheck(report: Partial<ConsistencyReport> = {}) {
  const merged: ConsistencyReport = {
    watchersHealthy: report.watchersHealthy ?? true,
    eventsConsumed: report.eventsConsumed ?? true,
    missingHandlers: report.missingHandlers ?? [],
    uiReceiving: report.uiReceiving ?? true,
    driftDetected: report.driftDetected ?? false,
  };

  if (!merged.watchersHealthy || merged.missingHandlers.length > 0) {
    emitEvent(
      'ai:dependency-gap',
      { missingHandlers: merged.missingHandlers },
      { source: 'consistencyEngine', priority: 6 }
    );
  }

  if (!merged.eventsConsumed || merged.driftDetected) {
    emitEvent(
      'ai:system-drift',
      { driftDetected: merged.driftDetected },
      { source: 'consistencyEngine', priority: 6 }
    );
  }

  if (merged.watchersHealthy && merged.eventsConsumed && merged.uiReceiving) {
    emitEvent(
      'ai:stability-restored',
      { status: 'ok' },
      { source: 'consistencyEngine', priority: 3 }
    );
  }

  if (!merged.uiReceiving) {
    emitEvent(
      'ai:consistency-warning',
      { message: 'UI pode não estar recebendo todos os eventos.' },
      { source: 'consistencyEngine', priority: 5 }
    );
  }

  return merged;
}

