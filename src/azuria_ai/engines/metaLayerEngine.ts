import { emitEvent } from '../core/eventBus';

interface MetaLayerInput {
  signals?: unknown[];
  metrics?: Record<string, unknown>;
  context?: {
    trend?: string;
    [key: string]: unknown;
  };
  goals?: string[];
  risks?: unknown[];
  scenarios?: string[];
  scenarioConfidence?: number;
  intent?: string;
  target?: string;
  [key: string]: unknown;
}

export interface MetaLayerOutput {
  perception: Record<string, unknown>;
  context: Record<string, unknown>;
  reasoning: Record<string, unknown>;
  consciousness: Record<string, unknown>;
  scenarios: Record<string, unknown>;
  decision: Record<string, unknown>;
  executionPlan: Record<string, unknown>;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function processMetaLayers(input: MetaLayerInput | Record<string, unknown>): MetaLayerOutput {
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

