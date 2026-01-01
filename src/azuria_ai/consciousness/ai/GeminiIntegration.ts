/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GEMINI INTEGRATION - Integração Completa com Google Gemini
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Integração profunda com o modelo Gemini Flash para:
 * - Análise de contexto
 * - Geração de insights personalizados
 * - Classificação de intenções
 * - Respostas conversacionais
 */

import { getGlobalState } from '../GlobalState';
import type { SkillLevel, CognitiveRole, MessageType } from '../types';
import {
  initSupabaseGemini,
  analyzeContext as analyzeContextSupabase,
  classifyIntent as classifyIntentSupabase,
  generateResponse as generateResponseSupabase,
  analyzeCalculation as analyzeCalculationSupabase,
  isSupabaseGeminiAvailable,
  getSupabaseGeminiStats,
} from './SupabaseGeminiAdapter';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Contexto para análise */
export interface AnalysisContext {
  /** Tela atual */
  screen: string;
  /** Dados do cálculo */
  calculationData?: Record<string, number>;
  /** Histórico de ações recentes */
  recentActions?: string[];
  /** Nível de skill do usuário */
  skillLevel: SkillLevel;
  /** Papel do usuário */
  role: CognitiveRole;
  /** Contexto adicional */
  additional?: string;
}

/** Resultado da análise */
export interface AnalysisResult {
  /** Se deve emitir mensagem */
  shouldEmit: boolean;
  /** Tipo de mensagem sugerido */
  messageType: MessageType;
  /** Título sugerido */
  title: string;
  /** Mensagem gerada */
  message: string;
  /** Tópico identificado */
  topic: string;
  /** Confiança da análise (0-1) */
  confidence: number;
  /** Ações sugeridas */
  suggestedActions?: Array<{ id: string; label: string }>;
}

/** Resultado de classificação de intenção */
export interface IntentClassification {
  /** Intenção principal */
  primaryIntent: string;
  /** Confiança */
  confidence: number;
  /** Entidades extraídas */
  entities: Record<string, string>;
  /** Sentimento */
  sentiment: 'positive' | 'neutral' | 'negative';
  /** Se precisa de assistência */
  needsAssistance: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

interface GeminiConfig {
  apiKey: string | null;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

const DEFAULT_CONFIG: GeminiConfig = {
  apiKey: null,
  model: 'gemini-2.5-flash', // Atualizado para versão 2.5
  maxTokens: 500,
  temperature: 0.7,
  timeout: 10000,
};

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

interface GeminiState {
  initialized: boolean;
  config: GeminiConfig;
  useSupabaseAdapter: boolean; // Se usa Edge Function ou chamada direta
  requestCount: number;
  lastRequest: number;
  errors: string[];
}

const state: GeminiState = {
  initialized: false,
  config: { ...DEFAULT_CONFIG },
  useSupabaseAdapter: false, // Por padrão, usar Supabase (mais seguro)
  requestCount: 0,
  lastRequest: 0,
  errors: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `Você é o assistente de IA do Azuria, uma plataforma brasileira para vendedores de marketplace e empresas de licitação.

Seu papel é:
1. Analisar contextos de cálculo e negócio
2. Identificar riscos e oportunidades
3. Fornecer insights acionáveis
4. Adaptar linguagem ao nível do usuário

REGRAS:
- Seja conciso e direto
- Foque em ações práticas
- Use termos de negócio brasileiros
- Valores em BRL
- Porcentagens com 1 casa decimal
- Nunca invente dados
- Se não tiver certeza, diga

FORMATO DE RESPOSTA:
Responda SEMPRE em JSON válido com a estrutura:
{
  "shouldEmit": boolean,
  "messageType": "insight" | "suggestion" | "warning" | "tip",
  "title": "string curto",
  "message": "string até 200 chars",
  "topic": "string identificador",
  "confidence": number 0-1,
  "suggestedActions": [{ "id": "string", "label": "string" }]
}`;

const INTENT_PROMPT = `Analise a seguinte entrada do usuário e classifique a intenção.

INTENÇÕES POSSÍVEIS:
- calculate: quer fazer um cálculo
- understand: quer entender algo
- compare: quer comparar opções
- optimize: quer otimizar algo
- report: quer um relatório
- help: precisa de ajuda
- other: outra intenção

Responda em JSON:
{
  "primaryIntent": "string",
  "confidence": number 0-1,
  "entities": { "key": "value" },
  "sentiment": "positive" | "neutral" | "negative",
  "needsAssistance": boolean
}`;

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Formata contexto para o prompt
 */
function formatContext(context: AnalysisContext): string {
  const parts: string[] = [];
  
  parts.push(`Tela: ${context.screen}`);
  parts.push(`Nível do usuário: ${context.skillLevel}`);
  parts.push(`Papel: ${context.role}`);
  
  if (context.calculationData) {
    const calcStr = Object.entries(context.calculationData)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    parts.push(`Dados do cálculo: ${calcStr}`);
  }
  
  if (context.recentActions?.length) {
    parts.push(`Ações recentes: ${context.recentActions.join(' → ')}`);
  }
  
  if (context.additional) {
    parts.push(`Contexto adicional: ${context.additional}`);
  }
  
  return parts.join('\n');
}

/**
 * Parse JSON seguro
 */
function safeParseJSON<T>(text: string, fallback: T): T {
  try {
    // Limpar possíveis markdown code blocks
    let cleaned = text;
    if (cleaned.includes('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned.trim());
  } catch {
    return fallback;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa a integração com Gemini
 * 
 * Pode usar Supabase Edge Function (recomendado) ou API direta (fallback)
 */
export function initGemini(
  options: {
    // Opção 1: Via Supabase Edge Function (recomendado)
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    edgeFunctionName?: string;
    // Opção 2: API direta (fallback, não recomendado em produção)
    apiKey?: string;
  }
): boolean {
  // Priorizar Supabase Edge Function
  if (options.supabaseUrl && options.supabaseAnonKey) {
    const success = initSupabaseGemini(
      options.supabaseUrl,
      options.supabaseAnonKey,
      options.edgeFunctionName || 'azuria-chat',
      state.config.timeout
    );
    
    if (success) {
      state.useSupabaseAdapter = true;
      state.initialized = true;
      // eslint-disable-next-line no-console
      console.log('[GeminiIntegration] Initialized via Supabase Edge Function (gemini-2.5-flash)');
      return true;
    }
  }
  
  // Fallback: API direta (apenas se Supabase não disponível)
  if (options.apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[GeminiIntegration] Using direct API (not recommended in production)');
    state.config.apiKey = options.apiKey;
    state.useSupabaseAdapter = false;
    state.initialized = true;
    return true;
  }
  
  // eslint-disable-next-line no-console
  console.warn('[GeminiIntegration] No valid configuration provided');
  return false;
}

/**
 * Analisa contexto e gera insight
 */
export async function analyzeContext(context: AnalysisContext): Promise<AnalysisResult | null> {
  if (!state.initialized) {
    return null;
  }
  
  // Usar Supabase adapter se disponível
  if (state.useSupabaseAdapter) {
    return analyzeContextSupabase(context);
  }
  
  // Fallback: API direta (não implementado aqui, usar Supabase)
  // eslint-disable-next-line no-console
  console.warn('[GeminiIntegration] Direct API not implemented, use Supabase adapter');
  return null;
}

/**
 * Classifica intenção do usuário
 */
export async function classifyIntent(input: string): Promise<IntentClassification | null> {
  if (!state.initialized) {
    return null;
  }
  
  if (state.useSupabaseAdapter) {
    return classifyIntentSupabase(input);
  }
  
  return null;
}

/**
 * Gera resposta conversacional
 */
export async function generateResponse(
  userMessage: string,
  context?: Partial<AnalysisContext>
): Promise<string | null> {
  if (!state.initialized) {
    return null;
  }
  
  if (state.useSupabaseAdapter) {
    const globalState = getGlobalState();
    const fullContext: Partial<AnalysisContext> = {
      screen: context?.screen ?? globalState.currentMoment.screen,
      skillLevel: context?.skillLevel ?? globalState.identity.skillLevel,
      role: context?.role ?? globalState.identity.role,
      ...context,
    };
    
    return generateResponseSupabase(userMessage, fullContext);
  }
  
  return null;
}

/**
 * Analisa dados de cálculo e sugere otimizações
 */
export async function analyzeCalculation(
  calculationData: Record<string, number>,
  calculationType: string
): Promise<{
  analysis: string;
  suggestions: string[];
  risks: string[];
  opportunities: string[];
} | null> {
  if (!state.initialized) {
    return null;
  }
  
  if (state.useSupabaseAdapter) {
    return analyzeCalculationSupabase(calculationData, calculationType);
  }
  
  return null;
}

/**
 * Verifica se Gemini está disponível
 */
export function isGeminiAvailable(): boolean {
  if (state.useSupabaseAdapter) {
    return isSupabaseGeminiAvailable();
  }
  return state.initialized;
}

/**
 * Obtém estatísticas
 */
export function getGeminiStats(): {
  initialized: boolean;
  requestCount: number;
  lastRequest: number;
  errorCount: number;
  recentErrors: string[];
  model: string;
  viaSupabase: boolean;
} {
  if (state.useSupabaseAdapter) {
    const supabaseStats = getSupabaseGeminiStats();
    return {
      ...supabaseStats,
      viaSupabase: true,
    };
  }
  
  return {
    initialized: state.initialized,
    requestCount: state.requestCount,
    lastRequest: state.lastRequest,
    errorCount: state.errors.length,
    recentErrors: state.errors.slice(-5),
    model: state.config.model,
    viaSupabase: false,
  };
}

/**
 * Reseta erros
 */
export function clearErrors(): void {
  state.errors = [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const GeminiIntegration = {
  init: initGemini,
  isAvailable: isGeminiAvailable,
  analyzeContext,
  classifyIntent,
  generateResponse,
  analyzeCalculation,
  getStats: getGeminiStats,
  clearErrors,
};

export default GeminiIntegration;

