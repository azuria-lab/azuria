/**
 * TaskRouter - Roteador Inteligente de Tarefas de IA
 *
 * Decide qual engine usar baseado na complexidade da tarefa:
 * - Gemini: Explicações simples, sugestões rápidas, UX
 * - NIM: Análise profunda, auditoria, estratégia
 * - Local: Regras determinísticas, sem IA
 *
 * @module azuria_ai/core/taskRouter
 */

export type AIEngine = 'gemini' | 'nim' | 'local';
export type TaskComplexity = 'simple' | 'medium' | 'complex';

export interface TaskRoute {
  engine: AIEngine;
  model?: string;
  maxTokens: number;
  temperature: number;
  fallback: AIEngine;
}

export interface TaskDefinition {
  id: string;
  name: string;
  complexity: TaskComplexity;
  category:
    | 'explanation'
    | 'analysis'
    | 'suggestion'
    | 'audit'
    | 'chat'
    | 'planning';
}

/**
 * Mapeamento de tarefas para engines
 */
const TASK_ROUTING: Record<string, TaskRoute> = {
  // UX Rápida → Gemini
  'explain-simple': {
    engine: 'gemini',
    maxTokens: 256,
    temperature: 0.7,
    fallback: 'local',
  },
  'suggest-quick': {
    engine: 'gemini',
    maxTokens: 128,
    temperature: 0.5,
    fallback: 'local',
  },
  chat: {
    engine: 'gemini',
    maxTokens: 512,
    temperature: 0.8,
    fallback: 'local',
  },
  'help-contextual': {
    engine: 'gemini',
    maxTokens: 256,
    temperature: 0.6,
    fallback: 'local',
  },

  // Análise Profunda → NIM (fallback para Gemini)
  'analyze-pricing': {
    engine: 'nim',
    maxTokens: 1024,
    temperature: 0.3,
    fallback: 'gemini',
  },
  'audit-tax': {
    engine: 'nim',
    maxTokens: 1024,
    temperature: 0.2,
    fallback: 'gemini',
  },
  'audit-risk': {
    engine: 'nim',
    maxTokens: 1024,
    temperature: 0.2,
    fallback: 'gemini',
  },
  'planning-strategy': {
    engine: 'nim',
    maxTokens: 2048,
    temperature: 0.4,
    fallback: 'gemini',
  },
  'analyze-bidding': {
    engine: 'nim',
    maxTokens: 1536,
    temperature: 0.3,
    fallback: 'gemini',
  },

  // Local (determinístico) → Sem IA
  'alert-threshold': {
    engine: 'local',
    maxTokens: 0,
    temperature: 0,
    fallback: 'local',
  },
  calculate: {
    engine: 'local',
    maxTokens: 0,
    temperature: 0,
    fallback: 'local',
  },
};

/**
 * Seleciona a rota baseado no tipo de tarefa
 */
export function selectRoute(taskType: string): TaskRoute {
  const route = TASK_ROUTING[taskType];

  if (route) {
    return route;
  }

  // Rota padrão: Gemini para tarefas desconhecidas
  return {
    engine: 'gemini',
    maxTokens: 512,
    temperature: 0.6,
    fallback: 'local',
  };
}

/**
 * Determina complexidade baseado em heurísticas
 */
export function detectComplexity(
  prompt: string,
  context?: Record<string, unknown>
): TaskComplexity {
  const promptLength = prompt.length;
  const hasNumbers = /\d+/.test(prompt);
  const hasMultipleQuestions = (prompt.match(/\?/g) || []).length > 1;
  const contextSize = context ? Object.keys(context).length : 0;

  // Análise complexa
  if (promptLength > 500 || hasMultipleQuestions || contextSize > 5) {
    return 'complex';
  }

  // Análise média
  if (promptLength > 200 || hasNumbers || contextSize > 2) {
    return 'medium';
  }

  // Simples
  return 'simple';
}

/**
 * Roteia automaticamente baseado no conteúdo
 */
export function autoRoute(
  prompt: string,
  context?: Record<string, unknown>
): TaskRoute {
  const complexity = detectComplexity(prompt, context);

  // Keywords para roteamento
  const lowerPrompt = prompt.toLowerCase();

  // Detecção de intenção
  if (lowerPrompt.includes('explique') || lowerPrompt.includes('o que é')) {
    return selectRoute('explain-simple');
  }

  if (lowerPrompt.includes('sugira') || lowerPrompt.includes('recomend')) {
    return selectRoute('suggest-quick');
  }

  if (lowerPrompt.includes('analis') || lowerPrompt.includes('avali')) {
    return complexity === 'complex'
      ? selectRoute('analyze-pricing')
      : selectRoute('explain-simple');
  }

  if (lowerPrompt.includes('audit') || lowerPrompt.includes('verifi')) {
    return selectRoute('audit-tax');
  }

  if (lowerPrompt.includes('planej') || lowerPrompt.includes('estratég')) {
    return selectRoute('planning-strategy');
  }

  if (lowerPrompt.includes('licit') || lowerPrompt.includes('edital')) {
    return selectRoute('analyze-bidding');
  }

  // Fallback baseado na complexidade
  switch (complexity) {
    case 'complex':
      return selectRoute('analyze-pricing');
    case 'medium':
      return selectRoute('chat');
    default:
      return selectRoute('explain-simple');
  }
}

/**
 * Verifica se um engine está disponível
 */
export function isEngineAvailable(engine: AIEngine): boolean {
  // SEGURANÇA: Em produção, engines remotos funcionam via Edge Function
  // O frontend não deve ter acesso às API keys
  switch (engine) {
    case 'gemini':
      return true; // Disponível via Edge Function azuria-chat
    case 'nim':
      return false; // Desabilitado - requer Edge Function
    case 'local':
      return true;
    default:
      return false;
  }
}

/**
 * Resolve engine com fallback automático
 */
export function resolveEngine(route: TaskRoute): AIEngine {
  if (isEngineAvailable(route.engine)) {
    return route.engine;
  }

  if (isEngineAvailable(route.fallback)) {
    console.log(`[TaskRouter] Fallback: ${route.engine} → ${route.fallback}`);
    return route.fallback;
  }

  console.log(`[TaskRouter] Fallback final: ${route.engine} → local`);
  return 'local';
}

export default {
  selectRoute,
  autoRoute,
  detectComplexity,
  isEngineAvailable,
  resolveEngine,
};
