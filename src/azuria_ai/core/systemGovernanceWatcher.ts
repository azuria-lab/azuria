import { type AzuriaEvent, emitEvent, on } from './eventBus';
import { guardEventLoop, resetCounts } from '../engines/safetyAndReliabilityEngine';

const CRITICAL_EVENTS: Array<AzuriaEvent['tipo']> = [
  'ai:consistency-warning',
  'ai:system-drift',
  'ai:dependency-gap',
  'ai:temporal-anomaly',
  'ai:coherence-warning',
  'ai:governance-alert',
];

export function initializeSystemGovernanceWatcher() {
  CRITICAL_EVENTS.forEach(tipo => {
    on(tipo, filterCritical);
  });
}

function filterCritical(event: AzuriaEvent) {
  if (!guardEventLoop(event.tipo)) {
    emitEvent(
      'ai:governance-alert',
      { message: 'Loop prevenido em evento crítico', eventType: event.tipo },
      { source: 'systemGovernanceWatcher', priority: 9 }
    );
    return;
  }

  // Política de "conflito zero": se drift + dependency gap simultâneos, disparar alerta
  if (event.tipo === 'ai:system-drift' || event.tipo === 'ai:dependency-gap') {
    emitEvent(
      'ai:governance-alert',
      { message: 'Possível conflito causal detectado', eventType: event.tipo },
      { source: 'systemGovernanceWatcher', priority: 8 }
    );
  }
}

