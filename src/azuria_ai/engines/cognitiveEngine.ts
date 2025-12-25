import { emitEvent } from '../core/eventBus';
import { logOpportunity, logPredictive, logRisk } from '../logs/modeDeus_internal';

type MemoryCategory = 'calc' | 'intent' | 'prediction' | 'action' | 'pattern' | 'anomaly';

interface MemoryEntry {
  category: MemoryCategory;
  source?: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

const MEMORY_LIMIT = 50;
const memoryBuffer: MemoryEntry[] = [];

function sanitizePayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || payload === null) {return {};}
  const payloadObj = payload as Record<string, unknown>;
  const allowedKeys = [
    'margemLucro',
    'custoProduto',
    'precoVenda',
    'custoOperacional',
    'taxasMarketplace',
    'tipo',
    'category',
    'intentCategory',
    'signals',
    'suggestedActions',
    'riskLevel',
    'predictiveScore',
  ];
  const sanitized: Record<string, unknown> = {};
  allowedKeys.forEach(key => {
    if (payloadObj[key] !== undefined) {sanitized[key] = payloadObj[key];}
  });
  return sanitized;
}

function pushMemory(entry: MemoryEntry) {
  memoryBuffer.push(entry);
  if (memoryBuffer.length > MEMORY_LIMIT) {
    memoryBuffer.shift();
  }
  emitEvent('ai:memory-updated', { entry }, { source: 'cognitiveEngine', priority: 3 });
}

export function updateMemory(category: MemoryCategory, payload: unknown, source?: string) {
  pushMemory({
    category,
    source,
    payload: sanitizePayload(payload),
    timestamp: Date.now(),
  });
}

export function detectPatterns() {
  const lastTen = memoryBuffer.slice(-10);
  const calcEntries = lastTen.filter(e => e.category === 'calc');
  const intents = lastTen.filter(e => e.category === 'intent');

  const repeatedCalcType = findRepeated(calcEntries.map(e => {
    const tipo = e.payload?.tipo;
    return typeof tipo === 'string' ? tipo : 'calc';
  }));
  const frequentIntent = findRepeated(intents.map(e => {
    const category = e.payload?.category;
    return typeof category === 'string' ? category : 'unknown';
  }));

  const patterns: string[] = [];
  if (repeatedCalcType) {patterns.push(`Repetição de cálculos: ${repeatedCalcType}`);}
  if (frequentIntent) {patterns.push(`Intenções frequentes: ${frequentIntent}`);}

  if (patterns.length > 0) {
    emitEvent(
      'ai:pattern-detected',
      { patterns },
      { source: 'cognitiveEngine', priority: 6 }
    );
    logOpportunity({ patterns });
  }
}

export function generateForecast() {
  const lastTen = memoryBuffer.slice(-10);
  const intents = lastTen.filter(e => e.category === 'intent');
  const predictions = lastTen.filter(e => e.category === 'prediction');

  const nextIntent = mostLikely(intents.map(e => {
    const category = e.payload?.category;
    return typeof category === 'string' ? category : undefined;
  }));
  const nextRiskLevel = mostLikely(predictions.map(e => {
    const riskLevel = e.payload?.riskLevel;
    return typeof riskLevel === 'string' ? riskLevel : undefined;
  }));

  const forecast = {
    message: 'Previsão cognitiva gerada.',
    nextIntent: nextIntent || 'pricing',
    nextRiskLevel: nextRiskLevel || 'safe',
  };

  emitEvent('ai:forecast-generated', forecast, { source: 'cognitiveEngine', priority: 6 });
  logPredictive(forecast);
}

export function detectAnomalies() {
  const lastTwo = memoryBuffer.slice(-2);
  if (lastTwo.length < 2) {return;}

  const [prev, curr] = lastTwo;
  const prevMarginValue = prev.payload?.margemLucro;
  const currMarginValue = curr.payload?.margemLucro;

  if (
    typeof prevMarginValue === 'number' &&
    typeof currMarginValue === 'number' &&
    Math.abs(currMarginValue - prevMarginValue) >= 15
  ) {
    const anomaly = {
      message: 'Mudança abrupta de margem detectada.',
      from: prevMarginValue,
      to: currMarginValue,
      source: curr.source,
    };
    emitEvent('ai:anomaly-detected', anomaly, { source: 'cognitiveEngine', priority: 7 });
    logRisk(anomaly);
  }
}

export function getMemorySnapshot(): MemoryEntry[] {
  return [...memoryBuffer];
}

function findRepeated(list: (string | undefined)[]) {
  const counts: Record<string, number> = {};
  list.forEach(item => {
    if (!item) {return;}
    counts[item] = (counts[item] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 3) {return top[0];}
  return null;
}

function mostLikely(list: (string | undefined)[]) {
  const counts: Record<string, number> = {};
  list.forEach(item => {
    if (!item) {return;}
    counts[item] = (counts[item] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

