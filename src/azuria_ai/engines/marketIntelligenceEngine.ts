import { emitEvent } from '../core/eventBus';

export interface MarketInsight {
  topic: string;
  confidence: number;
  details: Record<string, unknown>;
  impactScore: number;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

interface CompetitorData {
  name?: string;
  strength?: string;
  [key: string]: unknown;
}

interface MarketData {
  list?: CompetitorData[];
  gaps?: string[];
  differentiators?: string[];
  positioning?: string;
  risks?: { list?: unknown[] };
  opportunities?: { list?: unknown[] };
  [key: string]: unknown;
}

export function scanMarketSignals(input: unknown) {
  const signals = Array.isArray(input) ? input : [input];
  return signals.filter(Boolean);
}

export function analyzeCompetitors(data: MarketData = {}) {
  const competitors = data.list || [];
  return competitors.map((c: CompetitorData) => ({ name: c.name || 'competidor', strength: c.strength || 'médio' }));
}

export function compareFeatureSets(features: MarketData = {}) {
  return { gaps: features.gaps || [], differentiators: features.differentiators || [] };
}

export function detectExternalRisks(risks: MarketData = {}) {
  return risks.risks?.list || [];
}

export function identifyMarketOpportunities(opps: MarketData = {}) {
  return opps.opportunities?.list || [];
}

export function suggestStrategicPositioning(data: MarketData = {}) {
  return data.positioning || 'foco em valor/automação';
}

export function emitMarketInsight(insight: MarketInsight) {
  const impactScore = clamp(insight.impactScore ?? 0.1, 0.1, 1);
  const payload = { ...insight, impactScore };
  emitEvent('ai:market-insight', payload, { source: 'marketIntelligenceEngine', priority: impactScore > 0.75 ? 8 : 5 });
  return payload;
}

export function detectExternalRisksAndOpportunities(input: MarketData) {
  const risksInput = input?.risks as { list?: unknown[] } | undefined;
  const oppsInput = input?.opportunities as { list?: unknown[] } | undefined;
  const risks = detectExternalRisks(risksInput || {});
  const opps = identifyMarketOpportunities(oppsInput || {});
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

