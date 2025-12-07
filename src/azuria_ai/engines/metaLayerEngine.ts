import { emitEvent } from '../core/eventBus';

export interface MetaLayerOutput {
  perception: any;
  context: any;
  reasoning: any;
  consciousness: any;
  scenarios: any;
  decision: any;
  executionPlan: any;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function processMetaLayers(input: any): MetaLayerOutput {
  const perception = { signals: input?.signals || [], metrics: input?.metrics || {} };
  const context = { ...input?.context, inferred: input?.context?.trend || 'estável' };
  const reasoning = { coherent: true, contradictions: [] };
  const consciousness = { goals: input?.goals || ['melhorar margem'], risks: input?.risks || [] };
  const scenarios = { options: input?.scenarios || ['baseline'], confidence: clamp(input?.scenarioConfidence ?? 0.7) };
  const decision = { intent: input?.intent || 'analisar', priority: 'medium' };
  const executionPlan = { steps: ['validar', 'simular', 'emitir-insight'], target: input?.target || 'orchestrator' };

  const snapshot = { perception, context, reasoning, consciousness, scenarios, decision, executionPlan };
  emitEvent('ai:meta-layer-updated', { snapshot }, { source: 'metaLayerEngine', priority: 6 });
  return snapshot;
}

