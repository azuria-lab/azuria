import { emitEvent } from '../core/eventBus';

export interface BehaviorSignals {
  eventLog?: any[];
  flowData?: { steps?: any[]; abandonPoints?: string[] };
  userState?: any;
  userHistory?: any[];
}

export interface BehaviorFindings {
  negative?: string[];
  positive?: string[];
  abandonPoints?: string[];
  frictionPoints?: number;
  recommendations?: string[];
}

function emit(type: any, payload: any, priority = 5) {
  emitEvent(type, payload, { source: 'behaviorEngine', priority });
}

export function detectRepeatingErrors(eventLog: any[] = []) {
  const errors = eventLog.filter((e) => e.type === 'error');
  if (errors.length > 2) {
    emit('ai:behavior-pattern-detected', { pattern: 'repeating-errors', count: errors.length }, 7);
  }
  return errors.length;
}

export function detectIncompleteFlows(flowData: any = {}) {
  const incomplete = (flowData.steps || []).filter((s: any) => !s.completed);
  if (incomplete.length > 0) {
    emit('ai:flow-abandon-point', { steps: incomplete.map((s: any) => s.id) }, 6);
  }
  return incomplete.map((s: any) => s.id);
}

export function detectAbandonPoints(flowData: any = {}) {
  const abandon = flowData.abandonPoints || [];
  if (abandon.length > 0) {
    emit('ai:ux-friction-detected', { abandon }, 7);
  }
  return abandon;
}

export function detectUserStruggle(userState: any = {}) {
  const struggle = userState.struggleScore || 0;
  if (struggle > 0.5) {
    emit('ai:ux-friction-detected', { struggle }, 6);
  }
  return struggle;
}

export function detectUXFriction(points: any = {}) {
  const frictionScore = points.score || 0;
  if (frictionScore > 0.5) {
    emit('ai:ux-friction-detected', { frictionScore }, 6);
  }
  return frictionScore;
}

export function detectSuccessfulPatterns(eventLog: any[] = []) {
  const successes = eventLog.filter((e) => e.type === 'success');
  if (successes.length > 1) {
    emit('ai:positive-pattern-detected', { pattern: 'success-sequence', count: successes.length }, 5);
  }
  return successes.length;
}

export function detectFastPaths(flows: any[] = []) {
  const fast = flows.filter((f) => f.durationMs && f.durationMs < 5000);
  if (fast.length > 0) {
    emit('ai:positive-pattern-detected', { pattern: 'fast-path', count: fast.length }, 4);
  }
  return fast.map((f) => f.id);
}

export function detectHighRetentionSteps(userHistory: any[] = []) {
  const retained = userHistory.filter((h) => h.repeatCount && h.repeatCount > 2);
  if (retained.length > 0) {
    emit('ai:positive-pattern-detected', { pattern: 'high-retention', items: retained.length }, 4);
  }
  return retained.map((h) => h.step);
}

export function recommendUXFixes(): string[] {
  const fixes = ['Simplificar passo crítico', 'Adicionar tooltip contextual', 'Reduzir campos obrigatórios'];
  emit('ai:autofix-suggested', { fixes }, 5);
  return fixes;
}

export function recommendUIAdjustments(): string[] {
  const adjustments = ['Destacar botão primário', 'Reordenar formulário', 'Melhorar contraste'];
  emit('ai:autofix-suggested', { adjustments }, 5);
  return adjustments;
}

export function suggestFlowReordering(): string[] {
  const changes = ['Mover validação para o final', 'Pré-preencher dados conhecidos'];
  emit('ai:autofix-suggested', { changes }, 5);
  return changes;
}

export function suggestSimplification(): string[] {
  const changes = ['Ocultar campos avançados por padrão', 'Mostrar resumo antes da confirmação'];
  emit('ai:autofix-suggested', { changes }, 5);
  return changes;
}

export function highlightConfusingElements(): string[] {
  const items = ['Campo "MVA" pouco claro', 'Tooltip de ICMS ausente'];
  emit('ai:autofix-suggested', { items }, 5);
  return items;
}

export function analyzeBehavior(signals: BehaviorSignals): BehaviorFindings {
  const negative: string[] = [];
  const positive: string[] = [];
  const abandonPoints = detectAbandonPoints(signals.flowData);
  if (detectRepeatingErrors(signals.eventLog) > 0) negative.push('errors');
  if (detectIncompleteFlows(signals.flowData).length > 0) negative.push('incomplete-flows');
  if (detectUserStruggle(signals.userState) > 0.5) negative.push('struggle');
  if (detectUXFriction({ score: signals.userState?.frictionScore }) > 0.5) negative.push('friction');
  if (detectSuccessfulPatterns(signals.eventLog) > 0) positive.push('success-sequence');
  if (detectFastPaths(signals.flowData?.flows || []).length > 0) positive.push('fast-path');
  if (detectHighRetentionSteps(signals.userHistory || []).length > 0) positive.push('high-retention');
  return {
    negative,
    positive,
    abandonPoints,
    frictionPoints: signals.userState?.frictionScore,
    recommendations: recommendUXFixes(),
  };
}

