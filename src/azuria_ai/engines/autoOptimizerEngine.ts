import { emitEvent } from '../core/eventBus';
import {
  recommendUXFixes,
  recommendUIAdjustments,
  suggestFlowReordering,
  suggestSimplification,
  highlightConfusingElements,
} from './behaviorEngine';

function emit(type: any, payload: any, priority = 5) {
  emitEvent(type, payload, { source: 'autoOptimizerEngine', priority });
}

export function applySafeOptimizations() {
  const fixes = recommendUXFixes();
  emit('ai:autofix-applied', { fixes }, 6);
  emit('ai:ux-optimized', { fixes, message: 'Otimizações seguras aplicadas' }, 5);
  return fixes;
}

export function prioritizeFixes() {
  const fixes = recommendUXFixes();
  const ui = recommendUIAdjustments();
  const ordered = [...fixes, ...ui].slice(0, 5);
  emit('ai:autofix-suggested', { ordered }, 4);
  return ordered;
}

export function monitorImprovement() {
  emit('ai:behavior-pattern-detected', { monitor: true }, 3);
  return true;
}

export function autoTuneUX() {
  const reorders = suggestFlowReordering();
  const simplifications = suggestSimplification();
  const highlights = highlightConfusingElements();
  const combined = [...reorders, ...simplifications, ...highlights];
  emit('ai:ux-optimized', { combined }, 5);
  return combined;
}

