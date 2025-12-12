/**
 * Proactive Engine
 *
 * Motor de inteligência proativa que executa análises periódicas
 * e gera insights de forma autônoma.
 */

import { emitEvent, getEventHistory } from './eventBus';
import { getContext, getContextStats, getCurrentScreen } from './contextStore';
import { v4 as uuidv4 } from 'uuid';

interface ProactiveRule {
  id: string;
  name: string;
  check: () => Promise<ProactiveInsight | null>;
  cooldownMs: number;
  lastExecuted?: number;
}

interface ProactiveInsight {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  suggestion?: string;
  values?: Record<string, number>;
  sourceModule: string;
}

// Armazenamento de timestamps de última execução
const ruleExecutionTimestamps: Map<string, number> = new Map();

// Timer de verificação periódica
let proactiveTimer: NodeJS.Timeout | null = null;
let isRunning = false;

// Intervalo padrão de verificação (30 segundos)
const CHECK_INTERVAL_MS = 30000;

/**
 * Verifica se uma regra pode ser executada (cooldown)
 */
function canExecuteRule(ruleId: string, cooldownMs: number): boolean {
  const lastExecution = ruleExecutionTimestamps.get(ruleId);

  if (!lastExecution) {
    return true;
  }

  const timeSinceLastExecution = Date.now() - lastExecution;
  return timeSinceLastExecution >= cooldownMs;
}

/**
 * Registra execução de uma regra
 */
function markRuleExecuted(ruleId: string): void {
  ruleExecutionTimestamps.set(ruleId, Date.now());
}

/**
 * Emite um insight proativo
 */
function emitProactiveInsight(insight: ProactiveInsight): void {
  const insightPayload = {
    id: uuidv4(),
    severity: insight.severity,
    title: insight.title,
    message: insight.message,
    suggestion: insight.suggestion,
    values: insight.values || {},
    sourceModule: insight.sourceModule,
    eventReference: {
      tipo: 'proactive:analysis',
      timestamp: Date.now(),
    },
    timestamp: Date.now(),
  };

  // Emitir insight
  emitEvent('insight:generated', insightPayload, {
    source: 'proactiveEngine',
    priority: 8,
    metadata: {
      proactive: true,
    },
  });

  // Emitir evento para UI
  emitEvent(
    'ui:displayInsight',
    { insightId: insightPayload.id },
    {
      source: 'proactiveEngine',
      priority: 7,
    }
  );

  console.log('Proactive insight generated:', {
    id: insightPayload.id,
    severity: insight.severity,
    title: insight.title,
    sourceModule: insight.sourceModule,
  });
}

/**
 * Regras proativas
 */
const proactiveRules: ProactiveRule[] = [
  // Dashboard - Tendências perigosas
  {
    id: 'dashboard_profit_decline',
    name: 'Dashboard - Queda de lucro consecutiva',
    cooldownMs: 600000, // 10 minutos
    check: async () => {
      const context = getContext('dashboard');
      if (!context?.data?.lucroOtimizado) {return null;}

      // TODO: Implementar verificação de queda consecutiva
      // Verificar se lucro caiu por 3 períodos consecutivos

      return null;
    },
  },

  {
    id: 'dashboard_margin_drop',
    name: 'Dashboard - Queda de margem semanal',
    cooldownMs: 600000,
    check: async () => {
      const context = getContext('dashboard');
      if (!context?.data?.variacaoMargem) {return null;}

      const variacaoMargem = context.data.variacaoMargem;

      if (variacaoMargem < -10) {
        return {
          severity: 'high',
          title: 'Queda significativa de margem',
          message: `Margem caiu ${Math.abs(variacaoMargem).toFixed(
            1
          )}% na última semana. Revise sua estratégia de precificação.`,
          suggestion: 'Analise custos e ajuste preços para recuperar margem',
          values: { variacaoMargem },
          sourceModule: 'dashboard',
        };
      }

      return null;
    },
  },

  // Histórico - Padrões de erro
  {
    id: 'history_repeated_low_margin',
    name: 'Histórico - Margem baixa repetida',
    cooldownMs: 1800000, // 30 minutos
    check: async () => {
      const context = getContext('history');
      if (!context?.data?.padroesRepetidos) {return null;}

      // TODO: Implementar detecção de padrões repetidos
      // Verificar se mesmo erro de margem baixa em 3+ dias

      return null;
    },
  },

  // Lote Inteligente - Problemas estruturais
  {
    id: 'lot_high_low_margin_products',
    name: 'Lote - Muitos produtos com margem baixa',
    cooldownMs: 900000, // 15 minutos
    check: async () => {
      const context = getContext('smart_lot');
      if (!context?.data?.produtosCriticos) {return null;}

      const totalProdutos = context.data.totalProdutos || 0;
      const produtosCriticos = context.data.produtosCriticos || 0;

      if (totalProdutos > 0) {
        const percentualCritico = (produtosCriticos / totalProdutos) * 100;

        if (percentualCritico > 40) {
          return {
            severity: 'high',
            title: 'Lote com muitos produtos críticos',
            message: `${percentualCritico.toFixed(
              0
            )}% dos produtos no lote têm margem abaixo de 10%. Considere otimização em massa.`,
            suggestion: 'Use a IA de Precificação para otimizar todo o lote',
            values: { percentualCritico, produtosCriticos, totalProdutos },
            sourceModule: 'smart_lot',
          };
        }
      }

      return null;
    },
  },

  {
    id: 'lot_low_markup',
    name: 'Lote - Markup médio baixo',
    cooldownMs: 900000,
    check: async () => {
      const context = getContext('smart_lot');
      if (!context?.data?.markupMedio) {return null;}

      const markupMedio = context.data.markupMedio;

      if (markupMedio < 15) {
        return {
          severity: 'medium',
          title: 'Markup médio do lote está baixo',
          message: `Markup médio de ${markupMedio.toFixed(
            1
          )}% pode não cobrir custos operacionais. Recomendamos pelo menos 20%.`,
          suggestion: 'Ajuste preços em massa para aumentar markup',
          values: { markupMedio },
          sourceModule: 'smart_lot',
        };
      }

      return null;
    },
  },

  // IA de Precificação - Sugestões ignoradas
  {
    id: 'pricing_ai_ignored_suggestions',
    name: 'IA Precificação - Sugestões não aplicadas',
    cooldownMs: 1800000,
    check: async () => {
      const context = getContext('pricing_ai');
      if (!context?.data?.sugestoesPendentes) {return null;}

      const sugestoesPendentes = context.data.sugestoesPendentes || 0;
      const diasPendentes = context.data.diasPendentes || 0;

      if (sugestoesPendentes > 5 && diasPendentes > 7) {
        return {
          severity: 'medium',
          title: 'Sugestões de precificação pendentes',
          message: `Você tem ${sugestoesPendentes} sugestões não aplicadas há ${diasPendentes} dias. Revisar pode aumentar sua margem.`,
          suggestion: 'Revise e aplique as sugestões da IA',
          values: { sugestoesPendentes, diasPendentes },
          sourceModule: 'pricing_ai',
        };
      }

      return null;
    },
  },

  // Analytics - Comportamento anormal
  {
    id: 'analytics_margin_drop',
    name: 'Analytics - Queda abrupta de margem',
    cooldownMs: 600000,
    check: async () => {
      const context = getContext('analytics');
      if (!context?.data?.quedaDiaria) {return null;}

      const quedaDiaria = context.data.quedaDiaria;

      if (quedaDiaria > 15) {
        return {
          severity: 'critical',
          title: 'Queda abrupta de margem detectada',
          message: `Margem caiu ${quedaDiaria.toFixed(
            1
          )}% hoje. Verifique custos e preços imediatamente.`,
          suggestion: 'Investigue causas e ajuste precificação urgentemente',
          values: { quedaDiaria },
          sourceModule: 'analytics',
        };
      }

      return null;
    },
  },

  // Marketplace - Taxas anormais
  {
    id: 'marketplace_high_fees',
    name: 'Marketplace - Taxas elevadas',
    cooldownMs: 1800000,
    check: async () => {
      const context = getContext('marketplace');
      if (!context?.data?.taxaAtual) {return null;}

      const taxaAtual = context.data.taxaAtual;
      const taxaAnterior = context.data.taxaAnterior || taxaAtual;

      if (taxaAtual > 20 || taxaAtual - taxaAnterior > 5) {
        return {
          severity: 'high',
          title: 'Taxas de marketplace elevadas',
          message: `Taxa atual de ${taxaAtual.toFixed(
            1
          )}% está impactando significativamente sua margem.`,
          suggestion: 'Compare com outros marketplaces ou ajuste preços',
          values: {
            taxaAtual,
            taxaAnterior,
            variacao: taxaAtual - taxaAnterior,
          },
          sourceModule: 'marketplace',
        };
      }

      return null;
    },
  },
];

/**
 * Executa verificação de todas as regras proativas
 */
async function runProactiveChecks(): Promise<void> {
  for (const rule of proactiveRules) {
    try {
      // Verificar cooldown
      if (!canExecuteRule(rule.id, rule.cooldownMs)) {
        continue;
      }

      // Executar regra
      const insight = await rule.check();

      if (insight) {
        emitProactiveInsight(insight);
        markRuleExecuted(rule.id);
      }
    } catch (error) {
      console.error(`Error executing proactive rule ${rule.id}:`, error);
    }
  }
}

/**
 * Inicia o motor proativo
 */
export function start(): void {
  if (isRunning) {
    console.warn('Proactive engine is already running');
    return;
  }

  isRunning = true;

  // Executar primeira verificação imediatamente
  runProactiveChecks();

  // Configurar timer periódico
  proactiveTimer = setInterval(() => {
    runProactiveChecks();
  }, CHECK_INTERVAL_MS);

  console.log('Proactive engine started');
}

/**
 * Para o motor proativo
 */
export function stop(): void {
  if (!isRunning) {
    return;
  }

  if (proactiveTimer) {
    clearInterval(proactiveTimer);
    proactiveTimer = null;
  }

  isRunning = false;
  console.log('Proactive engine stopped');
}

/**
 * Verifica se o motor está rodando
 */
export function isActive(): boolean {
  return isRunning;
}

/**
 * Obtém estatísticas do motor proativo
 */
export function getProactiveStats() {
  return {
    isRunning,
    totalRules: proactiveRules.length,
    executionHistory: Array.from(ruleExecutionTimestamps.entries()).map(
      ([ruleId, timestamp]) => ({
        ruleId,
        lastExecuted: timestamp,
        timeSinceExecution: Date.now() - timestamp,
      })
    ),
  };
}
