import { emitEvent } from '../core/eventBus';

export interface MarketInsight {
  topic: string;
  confidence: number;
  details: Record<string, any>;
  impactScore: number;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function scanMarketSignals(input: any) {
  const signals = Array.isArray(input) ? input : [input];
  return signals.filter(Boolean);
}

export function analyzeCompetitors(data: any = {}) {
  const competitors = data.list || [];
  return competitors.map((c: any) => ({ name: c.name || 'competidor', strength: c.strength || 'médio' }));
}

export function compareFeatureSets(features: any = {}) {
  return { gaps: features.gaps || [], differentiators: features.differentiators || [] };
}

export function detectExternalRisks(risks: any = {}) {
  return risks.list || [];
}

export function identifyMarketOpportunities(opps: any = {}) {
  return opps.list || [];
}

export function suggestStrategicPositioning(data: any = {}) {
  return data.positioning || 'foco em valor/automação';
}

export function emitMarketInsight(insight: MarketInsight) {
  const impactScore = clamp(insight.impactScore ?? 0.1, 0.1, 1);
  const payload = { ...insight, impactScore };
  emitEvent('ai:market-insight', payload, { source: 'marketIntelligenceEngine', priority: impactScore > 0.75 ? 8 : 5 });
  return payload;
}

export function detectExternalRisksAndOpportunities(input: any) {
  const risks = detectExternalRisks(input?.risks);
  const opps = identifyMarketOpportunities(input?.opportunities);
  if (opps.length > 0) {
    emitMarketInsight({
      topic: 'market-opportunity',
      confidence: 0.7,
      details: { opps },
      impactScore: 0.8,
    });
  }
  if (risks.length > 0) {
    emitMarketInsight({
      topic: 'market-risk',
      confidence: 0.7,
      details: { risks },
      impactScore: 0.7,
    });
  }
  return { risks, opps };
}

