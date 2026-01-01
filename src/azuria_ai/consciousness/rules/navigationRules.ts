/**
 * ══════════════════════════════════════════════════════════════════════════════
 * NAVIGATION RULES - Regras de Decisão para Navegação
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Regras para eventos de navegação e contexto de tela.
 */

import type { DecisionContext, Decision } from '../DecisionEngine';
import { getGlobalState } from '../GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTO DE TELAS
// ═══════════════════════════════════════════════════════════════════════════════

interface ScreenInfo {
  name: string;
  category: 'calculation' | 'analysis' | 'dashboard' | 'settings' | 'other';
  tips: string[];
  relatedScreens: string[];
}

const SCREEN_MAP: Record<string, ScreenInfo> = {
  '/calculadora': {
    name: 'Calculadora Rápida',
    category: 'calculation',
    tips: [
      'Use a calculadora para simular diferentes cenários de preço.',
      'Experimente ajustar a margem para ver o impacto no preço final.',
    ],
    relatedScreens: ['/calculadora-avancada', '/relatorios'],
  },
  '/calculadora-avancada': {
    name: 'Calculadora Avançada',
    category: 'calculation',
    tips: [
      'A calculadora avançada permite simular cenários com mais variáveis.',
      'Você pode salvar cenários para comparar depois.',
    ],
    relatedScreens: ['/calculadora', '/simulador'],
  },
  '/calculadora-bdi': {
    name: 'Calculadora BDI',
    category: 'calculation',
    tips: [
      'O BDI típico para serviços varia entre 20% e 35%.',
      'Inclua todos os custos indiretos para um BDI preciso.',
    ],
    relatedScreens: ['/licitacoes', '/calculadora-avancada'],
  },
  '/calculadora-impostos': {
    name: 'Calculadora de Impostos',
    category: 'calculation',
    tips: [
      'Verifique o regime tributário correto da sua empresa.',
      'Alíquotas podem variar por estado e tipo de produto.',
    ],
    relatedScreens: ['/calculadora', '/relatorios'],
  },
  '/licitacoes': {
    name: 'Painel de Licitações',
    category: 'analysis',
    tips: [
      'Configure alertas para ser notificado de novos editais.',
      'Use filtros para encontrar licitações relevantes.',
    ],
    relatedScreens: ['/calculadora-bdi', '/relatorios'],
  },
  '/dashboard': {
    name: 'Dashboard',
    category: 'dashboard',
    tips: [
      'O dashboard mostra uma visão geral do seu negócio.',
      'Personalize os widgets para ver o que mais importa.',
    ],
    relatedScreens: ['/relatorios', '/configuracoes'],
  },
  '/relatorios': {
    name: 'Relatórios',
    category: 'analysis',
    tips: [
      'Exporte relatórios em PDF para apresentações.',
      'Compare períodos para identificar tendências.',
    ],
    relatedScreens: ['/dashboard', '/calculadora'],
  },
  '/configuracoes': {
    name: 'Configurações',
    category: 'settings',
    tips: [],
    relatedScreens: ['/dashboard'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getScreenInfo(path: string): ScreenInfo | null {
  // Tentar match exato
  if (SCREEN_MAP[path]) {
    return SCREEN_MAP[path];
  }
  
  // Tentar match parcial
  for (const [key, info] of Object.entries(SCREEN_MAP)) {
    if (path.startsWith(key)) {
      return info;
    }
  }
  
  return null;
}

function isFirstVisit(screen: string): boolean {
  const state = getGlobalState();
  const visitCount = state.session.journey.screens.filter(s => s === screen).length;
  return visitCount <= 1;
}

function getTimeOnPreviousScreen(previousPath: string): number {
  const state = getGlobalState();
  const lastAction = state.currentMoment.lastActionAt;
  return Date.now() - lastAction;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGRAS DE DECISÃO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Regra: Primeira visita a uma tela importante
 */
export const navFirstVisitRule = {
  name: 'nav_first_visit',
  priority: 50,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'user:navigation') return false;
    
    const payload = ctx.event.payload as { to?: string };
    const targetScreen = payload.to;
    
    if (!targetScreen) return false;
    
    const screenInfo = getScreenInfo(targetScreen);
    if (!screenInfo || screenInfo.tips.length === 0) return false;
    
    // Só mostrar para primeira visita
    return isFirstVisit(targetScreen);
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as { to: string };
    const screenInfo = getScreenInfo(payload.to)!;
    const state = getGlobalState();
    
    // Só para usuários iniciantes ou intermediários
    if (state.identity.skillLevel === 'expert' || state.identity.skillLevel === 'advanced') {
      return {
        type: 'silence',
        reason: 'Usuário experiente - não precisa de dica de primeira visita',
        confidence: 0.9,
        shouldLog: false,
      };
    }
    
    // Escolher uma dica aleatória
    const tip = screenInfo.tips[Math.floor(Math.random() * screenInfo.tips.length)];
    
    return {
      type: 'emit',
      reason: 'Primeira visita a tela com dicas disponíveis',
      confidence: 0.7,
      payload: {
        output: {
          type: 'tip',
          severity: 'info',
          title: `📍 ${screenInfo.name}`,
          message: tip,
          channel: 'USER',
          topic: `primeira_visita_${payload.to}`,
          context: {
            screen: payload.to,
            eventId: ctx.event.id,
          },
          ttl: 15000, // 15 segundos
        },
      },
      shouldLog: true,
    };
  },
};

/**
 * Regra: Navegação rápida demais (possível confusão)
 */
export const navQuickBounceRule = {
  name: 'nav_quick_bounce',
  priority: 45,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'user:navigation') return false;
    
    const payload = ctx.event.payload as { from?: string; to?: string };
    if (!payload.from || !payload.to) return false;
    
    // Verificar se saiu muito rápido (menos de 5 segundos)
    const timeOnPrevious = getTimeOnPreviousScreen(payload.from);
    return timeOnPrevious < 5000 && payload.from !== '/';
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const state = getGlobalState();
    
    // Contar bounces recentes
    const recentNavigations = state.session.journey.screens.slice(-10);
    const quickBounces = recentNavigations.length >= 5;
    
    // Se muitos bounces rápidos, pode estar perdido
    if (quickBounces) {
      return {
        type: 'emit',
        reason: 'Múltiplas navegações rápidas detectadas',
        confidence: 0.6,
        payload: {
          output: {
            type: 'suggestion',
            severity: 'low',
            title: '🤔 Precisa de ajuda?',
            message: 'Parece que você está procurando algo. Posso ajudar a encontrar o que precisa?',
            channel: 'USER',
            topic: 'ajuda_navegacao',
            context: {
              screen: ctx.userState.currentScreen,
              eventId: ctx.event.id,
            },
            actions: [
              {
                id: 'show_guide',
                label: 'Ver Guia',
                type: 'primary',
                handler: 'openGuide',
              },
            ],
            ttl: 20000,
          },
        },
        shouldLog: true,
      };
    }
    
    // Caso contrário, apenas silenciar
    return {
      type: 'silence',
      reason: 'Navegação rápida mas dentro do normal',
      confidence: 0.8,
      shouldLog: false,
    };
  },
};

/**
 * Regra: Navegação para tela relacionada (sugerir próximo passo)
 */
export const navSuggestNextStepRule = {
  name: 'nav_suggest_next_step',
  priority: 35,
  
  condition: (ctx: DecisionContext): boolean => {
    if (ctx.event.type !== 'user:navigation') return false;
    
    const payload = ctx.event.payload as { from?: string; to?: string };
    if (!payload.from) return false;
    
    const previousScreenInfo = getScreenInfo(payload.from);
    if (!previousScreenInfo) return false;
    
    // Se tela anterior era de cálculo e ficou mais de 30 segundos
    const timeOnPrevious = getTimeOnPreviousScreen(payload.from);
    return previousScreenInfo.category === 'calculation' && timeOnPrevious > 30000;
  },
  
  decide: (ctx: DecisionContext): Decision => {
    const payload = ctx.event.payload as { from: string; to: string };
    const previousScreenInfo = getScreenInfo(payload.from);
    const state = getGlobalState();
    
    // Verificar se completou algum cálculo
    if (state.session.metrics.calculationsCompleted > 0) {
      // Sugerir exportar ou salvar
      return {
        type: 'emit',
        reason: 'Usuário saiu de tela de cálculo após trabalho',
        confidence: 0.5,
        payload: {
          output: {
            type: 'suggestion',
            severity: 'info',
            title: '💾 Salvar Trabalho?',
            message: 'Você completou cálculos. Deseja exportar os resultados ou salvar o cenário para referência futura?',
            channel: 'USER',
            topic: 'salvar_trabalho',
            context: {
              screen: ctx.userState.currentScreen,
              eventId: ctx.event.id,
            },
            actions: [
              {
                id: 'export_pdf',
                label: 'Exportar PDF',
                type: 'primary',
                handler: 'exportPDF',
              },
              {
                id: 'save_scenario',
                label: 'Salvar Cenário',
                type: 'secondary',
                handler: 'saveScenario',
              },
            ],
            ttl: 30000,
          },
        },
        shouldLog: true,
      };
    }
    
    return {
      type: 'silence',
      reason: 'Sem cálculos completados para sugerir salvar',
      confidence: 0.7,
      shouldLog: false,
    };
  },
};

/**
 * Regra: Navegação padrão - apenas atualizar contexto
 */
export const navDefaultRule = {
  name: 'nav_default',
  priority: 10,
  
  condition: (ctx: DecisionContext): boolean => {
    return ctx.event.type === 'user:navigation';
  },
  
  decide: (_ctx: DecisionContext): Decision => {
    // Navegação normal - apenas silenciar
    return {
      type: 'silence',
      reason: 'Navegação normal - sem ação necessária',
      confidence: 1.0,
      shouldLog: false,
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const navigationRules = [
  navFirstVisitRule,
  navQuickBounceRule,
  navSuggestNextStepRule,
  navDefaultRule,
];

export default navigationRules;

