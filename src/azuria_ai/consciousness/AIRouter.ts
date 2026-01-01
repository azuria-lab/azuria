/**
 * ══════════════════════════════════════════════════════════════════════════════
 * AI ROUTER - Roteador de Modelos de IA
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * O AIRouter gerencia a comunicação com modelos de IA externos.
 * 
 * Hierarquia de fallback:
 * 1. Gemini Flash (Google) - Principal para todas as análises
 * 2. Local Rules - Fallback quando IA não disponível
 * 
 * Responsabilidades:
 * - Rotear requisições para o modelo apropriado
 * - Gerenciar fallbacks
 * - Cache de respostas
 * - Rate limiting por modelo
 */

import { generateResponse, isGeminiAvailable } from './ai';
import { updateSystemHealth } from './GlobalState';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Modelos de IA disponíveis */
export type AIModel = 'gemini' | 'local';

/** Tipo de tarefa para roteamento */
export type AITaskType = 
  | 'quick_analysis'      // Análise rápida de dados
  | 'deep_analysis'       // Análise profunda
  | 'text_generation'     // Geração de texto
  | 'classification'      // Classificação
  | 'prediction'          // Predição
  | 'recommendation'      // Recomendação
  | 'summarization';      // Sumarização

/** Requisição para IA */
export interface AIRequest {
  /** ID da requisição */
  id: string;
  /** Tipo de tarefa */
  taskType: AITaskType;
  /** Prompt ou dados de entrada */
  input: string | Record<string, unknown>;
  /** Contexto adicional */
  context?: Record<string, unknown>;
  /** Modelo preferido (opcional) */
  preferredModel?: AIModel;
  /** Timeout customizado (ms) */
  timeout?: number;
  /** Se deve usar cache */
  useCache?: boolean;
}

/** Resposta da IA */
export interface AIResponse {
  /** ID da requisição original */
  requestId: string;
  /** Se foi bem sucedida */
  success: boolean;
  /** Modelo que respondeu */
  model: AIModel;
  /** Resultado */
  result?: unknown;
  /** Erro se houver */
  error?: string;
  /** Tempo de resposta (ms) */
  latency: number;
  /** Se veio do cache */
  fromCache: boolean;
  /** Tokens usados (se disponível) */
  tokensUsed?: number;
}

/** Status de um modelo */
export interface ModelStatus {
  /** Se está disponível */
  available: boolean;
  /** Última verificação */
  lastCheck: number;
  /** Último erro */
  lastError?: string;
  /** Requisições na última hora */
  requestsLastHour: number;
  /** Taxa de sucesso */
  successRate: number;
  /** Latência média (ms) */
  avgLatency: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

interface AIRouterConfig {
  /** API Key do Gemini */
  geminiApiKey?: string;
  /** Timeout padrão (ms) */
  defaultTimeout: number;
  /** Se deve usar cache */
  enableCache: boolean;
  /** TTL do cache (ms) */
  cacheTTL: number;
  /** Máximo de requisições por hora por modelo */
  maxRequestsPerHour: number;
}

const DEFAULT_CONFIG: AIRouterConfig = {
  defaultTimeout: 10000,
  enableCache: true,
  cacheTTL: 300000, // 5 minutos
  maxRequestsPerHour: 100,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO INTERNO
// ═══════════════════════════════════════════════════════════════════════════════

interface AIRouterState {
  initialized: boolean;
  config: AIRouterConfig;
  modelStatus: Record<AIModel, ModelStatus>;
  cache: Map<string, { response: AIResponse; expiresAt: number }>;
  requestHistory: Array<{ model: AIModel; timestamp: number; success: boolean; latency: number }>;
}

const state: AIRouterState = {
  initialized: false,
  config: { ...DEFAULT_CONFIG },
  modelStatus: {
    gemini: {
      available: false,
      lastCheck: 0,
      requestsLastHour: 0,
      successRate: 1.0,
      avgLatency: 0,
    },
    local: {
      available: true, // Local sempre disponível
      lastCheck: Date.now(),
      requestsLastHour: 0,
      successRate: 1.0,
      avgLatency: 10,
    },
  },
  cache: new Map(),
  requestHistory: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTO DE TAREFAS
// ═══════════════════════════════════════════════════════════════════════════════

/** Mapeia tipo de tarefa para modelo preferido */
const TASK_MODEL_PREFERENCE: Record<AITaskType, AIModel[]> = {
  quick_analysis: ['gemini', 'local'],
  deep_analysis: ['gemini', 'local'],
  text_generation: ['gemini', 'local'],
  classification: ['gemini', 'local'],
  prediction: ['gemini', 'local'],
  recommendation: ['gemini', 'local'],
  summarization: ['gemini', 'local'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES DE MODELO
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Gera hash para cache
 */
function generateCacheKey(request: AIRequest): string {
  const inputStr = typeof request.input === 'string' 
    ? request.input 
    : JSON.stringify(request.input);
  
  const hashInput = `${request.taskType}:${inputStr}`;
  
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `ai_cache_${Math.abs(hash).toString(36)}`;
}

/**
 * Verifica cache
 */
function checkCache(request: AIRequest): AIResponse | null {
  if (!state.config.enableCache || !request.useCache) {
    return null;
  }
  
  const key = generateCacheKey(request);
  const cached = state.cache.get(key);
  
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.response,
      fromCache: true,
    };
  }
  
  return null;
}

/**
 * Salva no cache
 */
function saveToCache(request: AIRequest, response: AIResponse): void {
  if (!state.config.enableCache || !request.useCache || !response.success) {
    return;
  }
  
  const key = generateCacheKey(request);
  state.cache.set(key, {
    response,
    expiresAt: Date.now() + state.config.cacheTTL,
  });
}

/**
 * Limpa cache expirado
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of state.cache.entries()) {
    if (value.expiresAt < now) {
      state.cache.delete(key);
    }
  }
}

/**
 * Atualiza estatísticas do modelo
 */
function updateModelStats(model: AIModel, success: boolean, latency: number): void {
  const status = state.modelStatus[model];
  
  // Adicionar ao histórico
  state.requestHistory.push({
    model,
    timestamp: Date.now(),
    success,
    latency,
  });
  
  // Limpar histórico antigo (mais de 1 hora)
  const oneHourAgo = Date.now() - 3600000;
  state.requestHistory = state.requestHistory.filter(r => r.timestamp > oneHourAgo);
  
  // Calcular estatísticas
  const modelHistory = state.requestHistory.filter(r => r.model === model);
  status.requestsLastHour = modelHistory.length;
  
  const successCount = modelHistory.filter(r => r.success).length;
  status.successRate = modelHistory.length > 0 ? successCount / modelHistory.length : 1.0;
  
  const totalLatency = modelHistory.reduce((sum, r) => sum + r.latency, 0);
  status.avgLatency = modelHistory.length > 0 ? totalLatency / modelHistory.length : 0;
  
  // Atualizar disponibilidade no estado global
  updateSystemHealth({
    aiAvailability: {
      gemini: state.modelStatus.gemini.available,
    },
  });
}

/**
 * Verifica disponibilidade de um modelo
 */
function checkModelAvailability(model: AIModel): boolean {
  const status = state.modelStatus[model];
  
  // Local sempre disponível
  if (model === 'local') {
    return true;
  }
  
  // Verificar rate limit
  if (status.requestsLastHour >= state.config.maxRequestsPerHour) {
    return false;
  }
  
  // Verificar disponibilidade do Gemini (pode estar via Supabase ou API key)
  if (model === 'gemini') {
    return isGeminiAvailable();
  }
  
  return status.available;
}

/**
 * Seleciona o melhor modelo para uma tarefa
 */
function selectModel(request: AIRequest): AIModel {
  // Se preferência especificada e disponível, usar
  if (request.preferredModel && checkModelAvailability(request.preferredModel)) {
    return request.preferredModel;
  }
  
  // Seguir ordem de preferência para o tipo de tarefa
  const preferences = TASK_MODEL_PREFERENCE[request.taskType] || ['local'];
  
  for (const model of preferences) {
    if (checkModelAvailability(model)) {
      return model;
    }
  }
  
  // Fallback para local
  return 'local';
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPLEMENTAÇÃO DOS MODELOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Chama Gemini Flash via GeminiIntegration (usa Supabase ou API direta)
 */
async function callGemini(request: AIRequest): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    // Converter input para string se necessário
    const prompt = typeof request.input === 'string' 
      ? request.input 
      : JSON.stringify(request.input);
    
    // Usar GeminiIntegration que já sabe usar Supabase ou API direta
    const response = await Promise.race([
      generateResponse(prompt, request.context as Record<string, unknown>),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), request.timeout || state.config.defaultTimeout)
      ),
    ]);
    
    if (!response) {
      throw new Error('Gemini returned null response');
    }
    
    const latency = Date.now() - startTime;
    updateModelStats('gemini', true, latency);
    
    return {
      requestId: request.id,
      success: true,
      model: 'gemini',
      result: response,
      latency,
      fromCache: false,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    updateModelStats('gemini', false, latency);
    
    state.modelStatus.gemini.available = false;
    state.modelStatus.gemini.lastError = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      requestId: request.id,
      success: false,
      model: 'gemini',
      error: error instanceof Error ? error.message : 'Unknown error',
      latency,
      fromCache: false,
    };
  }
}

/**
 * Processamento local (fallback)
 */
function processLocal(request: AIRequest): AIResponse {
  const startTime = Date.now();
  
  // Regras locais simples baseadas no tipo de tarefa
  let result: unknown;
  
  switch (request.taskType) {
    case 'classification':
      // Classificação simples baseada em keywords
      result = classifyLocal(request.input);
      break;
    
    case 'recommendation':
      // Recomendação baseada em regras
      result = recommendLocal(request.input, request.context);
      break;
    
    case 'prediction':
      // Predição simples (média móvel, etc)
      result = predictLocal(request.input, request.context);
      break;
    
    default:
      result = {
        type: 'local_fallback',
        message: 'IA externa não disponível. Análise limitada.',
        input: request.input,
      };
  }
  
  const latency = Date.now() - startTime;
  updateModelStats('local', true, latency);
  
  return {
    requestId: request.id,
    success: true,
    model: 'local',
    result,
    latency,
    fromCache: false,
  };
}

/**
 * Classificação local simples
 */
function classifyLocal(input: string | Record<string, unknown>): Record<string, unknown> {
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  
  // Keywords para classificação
  const categories: Record<string, string[]> = {
    risco: ['risco', 'perda', 'prejuízo', 'negativo', 'problema', 'erro'],
    oportunidade: ['oportunidade', 'ganho', 'lucro', 'positivo', 'sucesso'],
    neutro: ['normal', 'padrão', 'esperado'],
  };
  
  let bestCategory = 'neutro';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(categories)) {
    const score = keywords.filter(kw => text.toLowerCase().includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  return {
    category: bestCategory,
    confidence: Math.min(0.5, bestScore * 0.15), // Confiança baixa para local
    method: 'keyword_matching',
  };
}

/**
 * Recomendação local simples
 */
function recommendLocal(
  input: string | Record<string, unknown>,
  context?: Record<string, unknown>
): Record<string, unknown> {
  return {
    recommendation: 'Análise detalhada requer modelo de IA. Recomendamos revisão manual.',
    confidence: 0.3,
    method: 'rule_based',
    context: context,
  };
}

/**
 * Predição local simples
 */
function predictLocal(
  input: string | Record<string, unknown>,
  context?: Record<string, unknown>
): Record<string, unknown> {
  // Se input for array de números, calcular média móvel
  if (typeof input === 'object' && Array.isArray((input as Record<string, unknown>).values)) {
    const values = (input as { values: number[] }).values;
    if (values.length >= 3) {
      const lastThree = values.slice(-3);
      const avg = lastThree.reduce((a, b) => a + b, 0) / 3;
      return {
        prediction: avg,
        method: 'moving_average',
        confidence: 0.4,
      };
    }
  }
  
  return {
    prediction: null,
    method: 'insufficient_data',
    confidence: 0,
    message: 'Dados insuficientes para predição local',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o AIRouter
 */
export function initAIRouter(config: Partial<AIRouterConfig>): void {
  state.config = { ...state.config, ...config };
  
  // Verificar disponibilidade inicial do Gemini
  // Pode estar disponível via Supabase Edge Function ou API key direta
  state.modelStatus.gemini.available = isGeminiAvailable();
  state.modelStatus.gemini.lastCheck = Date.now();
  
  state.initialized = true;
  
  // Atualizar estado global
  updateSystemHealth({
    aiAvailability: {
      gemini: state.modelStatus.gemini.available,
    },
  });
  
  // eslint-disable-next-line no-console
  console.log('[AIRouter] Initialized', {
    geminiAvailable: state.modelStatus.gemini.available,
  });
  
  // Re-verificar após um pequeno delay para garantir que o Gemini já foi inicializado
  // (útil caso initAIRouter seja chamado antes de initGemini completar)
  setTimeout(() => {
    const newAvailability = isGeminiAvailable();
    if (newAvailability !== state.modelStatus.gemini.available) {
      state.modelStatus.gemini.available = newAvailability;
      state.modelStatus.gemini.lastCheck = Date.now();
      
      updateSystemHealth({
        aiAvailability: {
          gemini: newAvailability,
        },
      });
      
      // eslint-disable-next-line no-console
      console.log('[AIRouter] Gemini availability updated', {
        geminiAvailable: newAvailability,
      });
    }
  }, 200);
}

/**
 * Executa uma requisição de IA
 */
export async function executeAI(request: AIRequest): Promise<AIResponse> {
  // Verificar cache primeiro
  const cached = checkCache(request);
  if (cached) {
    return cached;
  }
  
  // Selecionar modelo
  const model = selectModel(request);
  
  let response: AIResponse;
  
  // Chamar modelo
  switch (model) {
    case 'gemini':
      response = await callGemini(request);
      break;
    
    default:
      response = processLocal(request);
  }
  
  // Se falhou e não é local, tentar fallback
  if (!response.success && model !== 'local') {
    // eslint-disable-next-line no-console
    console.warn(`[AIRouter] ${model} failed, falling back to local`);
    response = processLocal(request);
  }
  
  // Salvar no cache
  saveToCache(request, response);
  
  return response;
}

/**
 * Gera ID de requisição
 */
export function generateRequestId(): string {
  return `ai_req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Obtém status dos modelos
 */
export function getModelStatus(): Record<AIModel, ModelStatus> {
  return { ...state.modelStatus };
}

/**
 * Verifica se um modelo específico está disponível
 */
export function isModelAvailable(model: AIModel): boolean {
  return checkModelAvailability(model);
}

/**
 * Força verificação de disponibilidade
 */
export async function checkAvailability(): Promise<void> {
  // Verificar Gemini com uma requisição simples
  if (state.config.geminiApiKey) {
    try {
      const response = await executeAI({
        id: generateRequestId(),
        taskType: 'classification',
        input: 'test',
        preferredModel: 'gemini',
        timeout: 5000,
        useCache: false,
      });
      
      state.modelStatus.gemini.available = response.success;
      state.modelStatus.gemini.lastCheck = Date.now();
    } catch {
      state.modelStatus.gemini.available = false;
    }
  }
  
  // Atualizar estado global
  updateSystemHealth({
    aiAvailability: {
      gemini: state.modelStatus.gemini.available,
    },
  });
}

/**
 * Limpa cache
 */
export function clearCache(): void {
  state.cache.clear();
}

/**
 * Obtém estatísticas
 */
export function getAIStats(): {
  cacheSize: number;
  requestsLastHour: Record<AIModel, number>;
  successRates: Record<AIModel, number>;
  avgLatencies: Record<AIModel, number>;
} {
  return {
    cacheSize: state.cache.size,
    requestsLastHour: {
      gemini: state.modelStatus.gemini.requestsLastHour,
      local: state.modelStatus.local.requestsLastHour,
    },
    successRates: {
      gemini: state.modelStatus.gemini.successRate,
      local: state.modelStatus.local.successRate,
    },
    avgLatencies: {
      gemini: state.modelStatus.gemini.avgLatency,
      local: state.modelStatus.local.avgLatency,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const AIRouter = {
  init: initAIRouter,
  execute: executeAI,
  generateId: generateRequestId,
  getStatus: getModelStatus,
  isAvailable: isModelAvailable,
  checkAvailability,
  clearCache,
  cleanupCache,
  getStats: getAIStats,
};

export default AIRouter;

