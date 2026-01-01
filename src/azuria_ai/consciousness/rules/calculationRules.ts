/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CALCULATION RULES - Regras de Decisão para Cálculos
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Regras específicas para eventos de cálculo (BDI, impostos, margens, etc.)
 */

import type { DecisionContext, Decision } from '../DecisionEngine';
import type { OutputRequest } from '../OutputGate';
import { getGlobalState } from '../GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS ESPECÍFICOS
// ═══════════════════════════════════════════════════════════════════════════════

interface CalcPayload {
  custoProduto?: number;
  margemLucro?: number;
  custoOperacional?: number;
  impostos?: number;
  taxasMarketplace?: number;
  precoVenda?: number;
  resultado?: {
    precoFinal?: number;
    margemReal?: number;
    lucroLiquido?: number;
    pontoEquilibrio?: number;
  };
  calcType?: string;
  changedField?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS DE ANÁLISE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analisa se a margem é saudável
 */
function analyzeMargin(margin: number): { healthy: boolean; message: string; severity: 'info' | 'low' | 'medium' | 'high' } {
  if (margin < 5) {
    return {
      healthy: false,
      message: 'Margem muito baixa! Risco de prejuízo em operações.',
      severity: 'high',
    };
  }
  if (margin < 10) {
    return {
      healthy: false,
      message: 'Margem apertada. Considere revisar custos.',
      severity: 'medium',
    };
  }
  if (margin < 15) {
    return {
      healthy: true,
      message: 'Margem adequada, mas há espaço para otimização.',
      severity: 'low',
    };
  }
  if (margin > 40) {
    return {
      healthy: true,
      message: 'Margem alta! Verifique competitividade do preço.',
      severity: 'low',
    };
  }
  return {
    healthy: true,
    message: 'Margem saudável para operação.',
    severity: 'info',
  };
}

/**
 * Analisa se o preço está competitivo
 */
function analyzePricing(precoVenda: number, custoProduto: number): { competitive: boolean; markup: number; message: string } {
  const markup = ((precoVenda - custoProduto) / custoProduto) * 100;
  
  if (markup < 20) {
    return {
      competitive: false,
      markup,
      message: `Markup de ${markup.toFixed(1)}% é muito baixo para cobrir custos operacionais.`,
    };
  }
  if (markup > 200) {
    return {
      competitive: false,
      markup,
      message: `Markup de ${markup.toFixed(1)}% pode tornar o produto não-competitivo.`,
    };
  }
  return {
    competitive: true,
    markup,
    message: `Markup de ${markup.toFixed(1)}% está na faixa saudável.`,
  };
}

/**
 * Analisa custos operacionais
 */
function analyzeOperationalCosts(custoOperacional: number, precoVenda: number): { reasonable: boolean; percentage: number; message: string } {
  if (precoVenda <= 0) {
    return { reasonable: true, percentage: 0, message: '' };
  }
  
  const percentage = (custoOperacional / precoVenda) * 100;
  
  if (percentage > 25) {
    return {
      reasonable: false,
      percentage,
      message: `Custos operacionais representam ${percentage.toFixed(1)}% do preço - muito alto!`,
    };
  }
  if (percentage > 15) {
    return {
      reasonable: true,
      percentage,
      message: `Custos operacionais de ${percentage.toFixed(1)}% estão na faixa média.`,
    };
  }
  return {
    reasonable: true,
    percentage,
    message: `Custos operacionais bem controlados (${percentage.toFixed(1)}%).`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGRAS DE DECISÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Regra: Cálculo completo com margem crítica
 */
export const calcMarginCriticalRule = {
  name: 'calc_margin_critical',
  priority: 85,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'calc:completed') return false;
    
    const payload = ctx.event.payload as CalcPayload;
    const margin = payload.margemLucro ?? payload.resultado?.margemReal;
    
    return margin !== undefined && margin < 5;
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as CalcPayload;
    const margin = payload.margemLucro ?? payload.resultado?.margemReal ?? 0;
    
    return {
      type: 'emit',
      reason: 'Margem crítica detectada',
      confidence: 0.95,
      payload: {
        output: {
          type: 'warning',
          severity: 'high',
          title: '⚠️ Alerta de Margem',
          message: `Sua margem de ${margin.toFixed(1)}% está muito baixa! Isso pode resultar em prejuízo considerando custos variáveis e imprevistos. Recomendamos revisar os custos ou ajustar o preço de venda.`,
          channel: 'USER',
          topic: 'margem_critica',
          context: {
            screen: ctx.userState.currentScreen,
            eventId: ctx.event.id,
          },
          actions: [
            {
              id: 'revisar_custos',
              label: 'Revisar Custos',
              type: 'primary',
              handler: 'openCostAnalysis',
            },
            {
              id: 'ajustar_preco',
              label: 'Ajustar Preço',
              type: 'secondary',
              handler: 'openPriceAdjust',
            },
          ],
        },
      },
      shouldLog: true,
    };
  },
};

/**
 * Regra: Cálculo completo com margem apertada
 */
export const calcMarginTightRule = {
  name: 'calc_margin_tight',
  priority: 60,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'calc:completed') return false;
    
    const payload = ctx.event.payload as CalcPayload;
    const margin = payload.margemLucro ?? payload.resultado?.margemReal;
    
    return margin !== undefined && margin >= 5 && margin < 10;
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as CalcPayload;
    const margin = payload.margemLucro ?? payload.resultado?.margemReal ?? 0;
    
    return {
      type: 'emit',
      reason: 'Margem apertada detectada',
      confidence: 0.8,
      payload: {
        output: {
          type: 'insight',
          severity: 'medium',
          title: '💡 Margem Apertada',
          message: `Sua margem de ${margin.toFixed(1)}% deixa pouco espaço para imprevistos. Considere avaliar fornecedores alternativos ou otimizar processos.`,
          channel: 'USER',
          topic: 'margem_apertada',
          context: {
            screen: ctx.userState.currentScreen,
            eventId: ctx.event.id,
          },
        },
      },
      shouldLog: true,
    };
  },
};

/**
 * Regra: Markup muito alto (não-competitivo)
 */
export const calcMarkupHighRule = {
  name: 'calc_markup_high',
  priority: 55,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'calc:completed') return false;
    
    const payload = ctx.event.payload as CalcPayload;
    if (!payload.precoVenda || !payload.custoProduto) return false;
    
    const markup = ((payload.precoVenda - payload.custoProduto) / payload.custoProduto) * 100;
    return markup > 200;
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as CalcPayload;
    const markup = ((payload.precoVenda! - payload.custoProduto!) / payload.custoProduto!) * 100;
    
    return {
      type: 'emit',
      reason: 'Markup muito alto detectado',
      confidence: 0.75,
      payload: {
        output: {
          type: 'insight',
          severity: 'low',
          title: '📊 Markup Elevado',
          message: `Seu markup de ${markup.toFixed(0)}% está acima da média de mercado. Isso pode impactar a competitividade, especialmente em marketplaces.`,
          channel: 'USER',
          topic: 'markup_alto',
          context: {
            screen: ctx.userState.currentScreen,
            eventId: ctx.event.id,
          },
        },
      },
      shouldLog: true,
    };
  },
};

/**
 * Regra: Custos operacionais altos
 */
export const calcOperationalCostsHighRule = {
  name: 'calc_operational_costs_high',
  priority: 50,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'calc:completed') return false;
    
    const payload = ctx.event.payload as CalcPayload;
    if (!payload.custoOperacional || !payload.precoVenda) return false;
    
    const percentage = (payload.custoOperacional / payload.precoVenda) * 100;
    return percentage > 25;
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as CalcPayload;
    const percentage = (payload.custoOperacional! / payload.precoVenda!) * 100;
    
    return {
      type: 'emit',
      reason: 'Custos operacionais altos',
      confidence: 0.7,
      payload: {
        output: {
          type: 'tip',
          severity: 'medium',
          title: '💰 Custos Operacionais',
          message: `Seus custos operacionais representam ${percentage.toFixed(1)}% do preço de venda. Busque otimizar logística, embalagem ou processos para melhorar a margem.`,
          channel: 'USER',
          topic: 'custos_operacionais',
          context: {
            screen: ctx.userState.currentScreen,
            eventId: ctx.event.id,
          },
        },
      },
      shouldLog: true,
    };
  },
};

/**
 * Regra: Cálculo bem-sucedido com resultados saudáveis
 */
export const calcSuccessHealthyRule = {
  name: 'calc_success_healthy',
  priority: 30,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'calc:completed') return false;
    
    const payload = ctx.event.payload as CalcPayload;
    const margin = payload.margemLucro ?? payload.resultado?.margemReal;
    
    // Só emitir se margem estiver boa (15-40%)
    return margin !== undefined && margin >= 15 && margin <= 40;
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as CalcPayload;
    const margin = payload.margemLucro ?? payload.resultado?.margemReal ?? 0;
    const state = getGlobalState();
    
    // Se já falou recentemente sobre cálculo saudável, silenciar
    const recentHealthyCalc = state.communicationMemory.sentMessages.find(
      m => m.topic === 'calculo_saudavel' && Date.now() - m.sentAt < 300000
    );
    
    if (recentHealthyCalc) {
      return {
        type: 'silence',
        reason: 'Já notificou sobre cálculo saudável recentemente',
        confidence: 0.9,
        shouldLog: false,
      };
    }
    
    return {
      type: 'emit',
      reason: 'Cálculo saudável completado',
      confidence: 0.6,
      payload: {
        output: {
          type: 'confirmation',
          severity: 'info',
          title: '✅ Ótimo!',
          message: `Margem de ${margin.toFixed(1)}% está saudável. Seu preço está bem calculado!`,
          channel: 'USER',
          topic: 'calculo_saudavel',
          context: {
            screen: ctx.userState.currentScreen,
            eventId: ctx.event.id,
          },
          ttl: 5000, // 5 segundos
        },
      },
      shouldLog: false,
    };
  },
};

/**
 * Regra: Input sendo alterado - aguardar
 */
export const calcInputChangedRule = {
  name: 'calc_input_changed',
  priority: 70,
  
  condition: (ctx: DecisionContext): boolean => {
    return ctx.event.type === 'calc:updated';
  },
  
  decide: (_ctx: DecisionContext): Decision => {
    // Quando o usuário está digitando, apenas silenciar e aguardar
    return {
      type: 'silence',
      reason: 'Usuário digitando - aguardar conclusão',
      confidence: 1.0,
      shouldLog: false,
    };
  },
};

/**
 * Regra: Cálculo iniciado
 */
export const calcStartedRule = {
  name: 'calc_started',
  priority: 65,
  
  condition: (ctx: DecisionContext): boolean => {
    return ctx.event.type === 'calc:started';
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const state = getGlobalState();
    
    // Se usuário é iniciante, mostrar dica
    if (state.identity.skillLevel === 'beginner') {
      return {
        type: 'emit',
        reason: 'Usuário iniciante começando cálculo',
        confidence: 0.6,
        payload: {
          output: {
            type: 'tip',
            severity: 'info',
            title: '💡 Dica',
            message: 'Preencha todos os campos para um cálculo mais preciso. A margem ideal varia entre 15% e 30% dependendo do segmento.',
            channel: 'USER',
            topic: 'dica_calculo',
            context: {
              screen: ctx.userState.currentScreen,
              eventId: ctx.event.id,
            },
            ttl: 10000,
          },
        },
        shouldLog: false,
      };
    }
    
    // Para usuários experientes, silenciar
    return {
      type: 'silence',
      reason: 'Usuário experiente - não precisa de dica',
      confidence: 0.9,
      shouldLog: false,
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT DE TODAS AS REGRAS
// ═══════════════════════════════════════════════════════════════════════════════

export const calculationRules = [
  calcMarginCriticalRule,
  calcMarginTightRule,
  calcMarkupHighRule,
  calcOperationalCostsHighRule,
  calcSuccessHealthyRule,
  calcInputChangedRule,
  calcStartedRule,
];

export default calculationRules;

