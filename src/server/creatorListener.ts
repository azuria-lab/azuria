import { on } from '../azuria_ai/core/eventBus';
import { insertAlert } from './creatorStore';
import { notifySSE } from './sseManager';
import { addEvolutionEvent } from './evolutionStore';

async function handle(event: string, payload: any) {
  // Se já vem persistido (id), apenas propaga
  let alert = payload;
  if (!payload?.id) {
    alert = await insertAlert({
      type: event.includes('roadmap')
        ? 'roadmap'
        : event.includes('recommendation')
        ? 'recommendation'
        : event.includes('insight')
        ? 'insight'
        : 'alert',
      area: payload.area,
      severity: payload.severity,
      message: payload.message || payload.recommendation || 'Alert',
      payload,
      originEngine: payload.originEngine,
      confidence: payload.confidence,
      suggestedAction: payload.suggestedAction,
    });
  }
  notifySSE({ channel: 'creator', event, data: alert });
}

export function initCreatorListener() {
  on('ai:creator-alert', (ev) => handle('creator-alert', ev.payload));
  on('ai:creator-insight', (ev) => handle('creator-insight', ev.payload));
  on('ai:creator-recommendation', (ev) => handle('creator-recommendation', ev.payload));
  on('ai:creator-roadmap', (ev) => handle('creator-roadmap', ev.payload));
  on('ai:evolution-learning', (ev) => {
    addEvolutionEvent('learning', ev.payload);
    notifySSE({ channel: 'creator', event: 'creator-evolution', data: ev.payload });
  });
  on('ai:evolution-pattern', (ev) => {
    addEvolutionEvent('pattern', ev.payload);
    notifySSE({ channel: 'creator', event: 'creator-evolution', data: ev.payload });
  });
  on('ai:evolution-insight', (ev) => {
    addEvolutionEvent('insight', ev.payload);
    notifySSE({ channel: 'creator', event: 'creator-evolution', data: ev.payload });
  });
  on('ai:evolution-memory', (ev) => {
    addEvolutionEvent('memory', ev.payload);
    notifySSE({ channel: 'creator', event: 'creator-evolution', data: ev.payload });
  });
  on('ai:evolution-query', (ev) => {
    addEvolutionEvent('query', ev.payload);
    notifySSE({ channel: 'creator', event: 'creator-evolution', data: ev.payload });
  });
}

