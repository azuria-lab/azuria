/**
 * ══════════════════════════════════════════════════════════════════════════════
 * MESSAGE TEMPLATES - Templates de Mensagens do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Templates pré-definidos para diferentes tipos de mensagens,
 * com variações por contexto e nível de usuário.
 */

import type { MessageType, MessageSeverity, SkillLevel, CognitiveRole } from '../types';
import { humanizeMessage, humanizeTitle } from '../personality/SimpleVoice';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MessageTemplate {
  /** ID único do template */
  id: string;
  /** Tipo de mensagem */
  type: MessageType;
  /** Severidade padrão */
  defaultSeverity: MessageSeverity;
  /** Título (pode conter placeholders) */
  title: string;
  /** Mensagem por nível de skill */
  messages: {
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
  /** Tópico para agrupamento */
  topic: string;
  /** TTL padrão em ms */
  defaultTTL: number;
  /** Se pode ser dispensada */
  dismissable: boolean;
  /** Ações disponíveis */
  actions?: Array<{
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    handler: string;
  }>;
}

export interface TemplateContext {
  /** Valores para substituição em placeholders */
  values: Record<string, string | number>;
  /** Nível de skill do usuário */
  skillLevel: SkillLevel;
  /** Papel do usuário (USER/ADMIN) */
  role?: CognitiveRole;
  /** Tela atual */
  screen: string;
  /** Dados adicionais */
  extra?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Substitui placeholders em um texto
 */
function replacePlaceholders(text: string, values: Record<string, string | number>): string {
  let result = text;
  
  for (const [key, value] of Object.entries(values)) {
    const placeholder = `{{${key}}}`;
    result = result.split(placeholder).join(String(value));
  }
  
  return result;
}

/**
 * Formata número como moeda
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número como porcentagem
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES DE CÁLCULO
// ═══════════════════════════════════════════════════════════════════════════════

export const CALC_TEMPLATES: Record<string, MessageTemplate> = {
  MARGIN_CRITICAL: {
    id: 'calc_margin_critical',
    type: 'warning',
    defaultSeverity: 'high',
    title: '⚠️ Margem Crítica: {{margin}}',
    messages: {
      beginner: 'Atenção! Sua margem de lucro está em {{margin}}, o que é muito baixo. Isso significa que você pode ter prejuízo se houver qualquer custo inesperado. Recomendo revisar seus custos ou aumentar o preço de venda.',
      intermediate: 'Margem de {{margin}} está abaixo do mínimo seguro (5%). Revise custos operacionais ou ajuste o preço. Considere: fornecedores alternativos, otimização logística, ou reposicionamento de preço.',
      advanced: 'Margem {{margin}} crítica. Break-even em risco. Ações: 1) Renegociar custos, 2) Otimizar operação, 3) Revisar pricing strategy.',
      expert: 'Margem {{margin}} - abaixo do threshold. Recomenda-se análise de cost structure e revisão de pricing.',
    },
    topic: 'margem_critica',
    defaultTTL: 60000,
    dismissable: true,
    actions: [
      { id: 'revisar_custos', label: 'Revisar Custos', type: 'primary', handler: 'openCostAnalysis' },
      { id: 'simular_preco', label: 'Simular Preço', type: 'secondary', handler: 'openPriceSimulator' },
    ],
  },
  
  MARGIN_TIGHT: {
    id: 'calc_margin_tight',
    type: 'insight',
    defaultSeverity: 'medium',
    title: '💡 Margem de {{margin}}',
    messages: {
      beginner: 'Sua margem de {{margin}} está na faixa "apertada". Significa que você tem lucro, mas com pouca folga para imprevistos. É uma zona de atenção.',
      intermediate: 'Margem {{margin}} deixa espaço limitado. Busque oportunidades de redução de custos para maior segurança operacional.',
      advanced: 'Margem {{margin}} operacional. Considere otimizações em supply chain ou revisão de SKUs menos rentáveis.',
      expert: 'Margem {{margin}} - dentro do aceitável, porém com espaço para otimização.',
    },
    topic: 'margem_apertada',
    defaultTTL: 30000,
    dismissable: true,
  },
  
  MARGIN_HEALTHY: {
    id: 'calc_margin_healthy',
    type: 'confirmation',
    defaultSeverity: 'info',
    title: '✅ Margem Saudável',
    messages: {
      beginner: 'Parabéns! Sua margem de {{margin}} está ótima! Isso significa que você tem uma boa folga de lucro.',
      intermediate: 'Margem de {{margin}} está saudável. Bom trabalho no balanceamento custo/preço.',
      advanced: 'Margem {{margin}} dentro do range ideal. Operação equilibrada.',
      expert: 'Margem {{margin}} - OK.',
    },
    topic: 'margem_saudavel',
    defaultTTL: 5000,
    dismissable: true,
  },
  
  MARKUP_HIGH: {
    id: 'calc_markup_high',
    type: 'insight',
    defaultSeverity: 'low',
    title: '📊 Markup de {{markup}}',
    messages: {
      beginner: 'Seu markup (diferença entre custo e preço) está em {{markup}}. Isso é bastante alto e pode tornar seu produto menos competitivo em relação aos concorrentes.',
      intermediate: 'Markup de {{markup}} está acima da média de mercado. Analise a competitividade, especialmente em marketplaces onde preço é fator decisivo.',
      advanced: 'Markup {{markup}} pode impactar conversão. Considere elasticidade de preço e posicionamento de mercado.',
      expert: 'Markup {{markup}} - verificar price elasticity.',
    },
    topic: 'markup_alto',
    defaultTTL: 20000,
    dismissable: true,
  },
  
  OPERATIONAL_COSTS_HIGH: {
    id: 'calc_operational_high',
    type: 'tip',
    defaultSeverity: 'medium',
    title: '💰 Custos Operacionais: {{percentage}}',
    messages: {
      beginner: 'Seus custos operacionais representam {{percentage}} do preço de venda. Isso é alto! Esses custos incluem frete, embalagem, armazenagem, etc. Tente negociar melhores condições ou buscar alternativas.',
      intermediate: 'Custos operacionais em {{percentage}} do preço. Busque otimização em logística e processos. Considere: fulfillment terceirizado, embalagens mais eficientes, rotas otimizadas.',
      advanced: 'OPEX em {{percentage}}. Acima do benchmark (15-20%). Focos: logística, fulfillment, processos.',
      expert: 'OPEX {{percentage}} - otimizar.',
    },
    topic: 'custos_operacionais',
    defaultTTL: 30000,
    dismissable: true,
    actions: [
      { id: 'ver_breakdown', label: 'Ver Detalhes', type: 'primary', handler: 'openCostBreakdown' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES DE NAVEGAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

export const NAV_TEMPLATES: Record<string, MessageTemplate> = {
  FIRST_VISIT: {
    id: 'nav_first_visit',
    type: 'tip',
    defaultSeverity: 'info',
    title: '📍 {{screenName}}',
    messages: {
      beginner: '{{tip}} Se precisar de ajuda, clique no ícone de ajuda ou pergunte ao assistente.',
      intermediate: '{{tip}}',
      advanced: '{{tip}}',
      expert: '{{tip}}',
    },
    topic: 'primeira_visita',
    defaultTTL: 15000,
    dismissable: true,
  },
  
  NEED_HELP: {
    id: 'nav_need_help',
    type: 'suggestion',
    defaultSeverity: 'low',
    title: '🤔 Precisa de ajuda?',
    messages: {
      beginner: 'Parece que você está procurando algo. Posso ajudar! Temos guias e tutoriais para cada funcionalidade.',
      intermediate: 'Posso ajudar a encontrar o que você precisa. Use a busca ou navegue pelo menu.',
      advanced: 'Procurando algo específico? Use Ctrl+K para busca rápida.',
      expert: 'Busca: Ctrl+K',
    },
    topic: 'ajuda_navegacao',
    defaultTTL: 20000,
    dismissable: true,
    actions: [
      { id: 'show_guide', label: 'Ver Guia', type: 'primary', handler: 'openGuide' },
      { id: 'search', label: 'Buscar', type: 'secondary', handler: 'openSearch' },
    ],
  },
  
  SAVE_WORK: {
    id: 'nav_save_work',
    type: 'suggestion',
    defaultSeverity: 'info',
    title: '💾 Salvar Trabalho?',
    messages: {
      beginner: 'Você fez alguns cálculos. Que tal salvar para não perder? Você pode exportar em PDF ou salvar como cenário.',
      intermediate: 'Cálculos realizados. Deseja exportar ou salvar o cenário para referência futura?',
      advanced: 'Exportar resultados ou salvar cenário?',
      expert: 'Exportar/Salvar?',
    },
    topic: 'salvar_trabalho',
    defaultTTL: 30000,
    dismissable: true,
    actions: [
      { id: 'export_pdf', label: 'Exportar PDF', type: 'primary', handler: 'exportPDF' },
      { id: 'save_scenario', label: 'Salvar Cenário', type: 'secondary', handler: 'saveScenario' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES DE ADMIN
// ═══════════════════════════════════════════════════════════════════════════════

export const ADMIN_TEMPLATES: Record<string, MessageTemplate> = {
  GOVERNANCE_ALERT: {
    id: 'admin_governance_alert',
    type: 'warning',
    defaultSeverity: 'high',
    title: '🛡️ Alerta de Governança',
    messages: {
      beginner: '{{message}}',
      intermediate: '{{message}}',
      advanced: '{{message}}',
      expert: '{{message}}',
    },
    topic: 'governanca',
    defaultTTL: 60000,
    dismissable: false,
    actions: [
      { id: 'view_details', label: 'Ver Detalhes', type: 'primary', handler: 'openGovernanceDetails' },
    ],
  },
  
  SYSTEM_HEALTH: {
    id: 'admin_system_health',
    type: 'insight',
    defaultSeverity: 'medium',
    title: '📊 Saúde do Sistema: {{score}}%',
    messages: {
      beginner: '{{message}}',
      intermediate: '{{message}}',
      advanced: '{{message}}',
      expert: '{{message}}',
    },
    topic: 'saude_sistema',
    defaultTTL: 30000,
    dismissable: true,
    actions: [
      { id: 'view_dashboard', label: 'Ver Dashboard', type: 'primary', handler: 'openAdminDashboard' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATES GERAIS
// ═══════════════════════════════════════════════════════════════════════════════

export const GENERAL_TEMPLATES: Record<string, MessageTemplate> = {
  ERROR: {
    id: 'general_error',
    type: 'error',
    defaultSeverity: 'high',
    title: '❌ Ops! Algo deu errado',
    messages: {
      beginner: 'Encontramos um problema: {{error}}. Não se preocupe, estamos aqui para ajudar. Tente novamente ou entre em contato com o suporte.',
      intermediate: 'Erro: {{error}}. Tente novamente. Se persistir, contate o suporte.',
      advanced: 'Erro: {{error}}. Retry ou contate suporte.',
      expert: 'Erro: {{error}}',
    },
    topic: 'erro',
    defaultTTL: 30000,
    dismissable: true,
    actions: [
      { id: 'retry', label: 'Tentar Novamente', type: 'primary', handler: 'retry' },
      { id: 'support', label: 'Suporte', type: 'secondary', handler: 'openSupport' },
    ],
  },
  
  SUCCESS: {
    id: 'general_success',
    type: 'confirmation',
    defaultSeverity: 'info',
    title: '✅ {{title}}',
    messages: {
      beginner: '{{message}} Parabéns!',
      intermediate: '{{message}}',
      advanced: '{{message}}',
      expert: '{{message}}',
    },
    topic: 'sucesso',
    defaultTTL: 5000,
    dismissable: true,
  },
  
  TIP: {
    id: 'general_tip',
    type: 'tip',
    defaultSeverity: 'info',
    title: '💡 {{title}}',
    messages: {
      beginner: '{{message}}',
      intermediate: '{{message}}',
      advanced: '{{message}}',
      expert: '{{message}}',
    },
    topic: 'dica',
    defaultTTL: 15000,
    dismissable: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtém um template por ID
 */
export function getTemplate(templateId: string): MessageTemplate | null {
  const allTemplates = {
    ...CALC_TEMPLATES,
    ...NAV_TEMPLATES,
    ...ADMIN_TEMPLATES,
    ...GENERAL_TEMPLATES,
  };
  
  return allTemplates[templateId] || null;
}

/**
 * Renderiza um template com contexto
 */
export function renderTemplate(
  template: MessageTemplate,
  context: TemplateContext
): {
  title: string;
  message: string;
  type: MessageType;
  severity: MessageSeverity;
  topic: string;
  ttl: number;
  dismissable: boolean;
  actions?: MessageTemplate['actions'];
} {
  const skillLevel = context.skillLevel || 'intermediate';
  const role = context.role || 'USER';
  const messageTemplate = template.messages[skillLevel];
  
  // Substituir placeholders
  const rawTitle = replacePlaceholders(template.title, context.values);
  const rawMessage = replacePlaceholders(messageTemplate, context.values);
  
  // Humanizar mensagem e título
  const humanizedTitle = humanizeTitle(rawTitle, role, template.defaultSeverity);
  const humanizedMessage = humanizeMessage(
    rawMessage,
    role,
    skillLevel,
    template.defaultSeverity
  );
  
  return {
    title: humanizedTitle,
    message: humanizedMessage,
    type: template.type,
    severity: template.defaultSeverity,
    topic: template.topic,
    ttl: template.defaultTTL,
    dismissable: template.dismissable,
    actions: template.actions,
  };
}

/**
 * Cria mensagem a partir de template
 */
export function createMessageFromTemplate(
  templateId: string,
  context: TemplateContext
): ReturnType<typeof renderTemplate> | null {
  const template = getTemplate(templateId);
  if (!template) {
    return null;
  }
  
  return renderTemplate(template, context);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const MessageTemplates = {
  CALC: CALC_TEMPLATES,
  NAV: NAV_TEMPLATES,
  ADMIN: ADMIN_TEMPLATES,
  GENERAL: GENERAL_TEMPLATES,
  get: getTemplate,
  render: renderTemplate,
  create: createMessageFromTemplate,
  helpers: {
    formatCurrency,
    formatPercent,
    replacePlaceholders,
  },
};

export default MessageTemplates;

