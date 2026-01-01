/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SUPABASE GEMINI ADAPTER - Adaptador para Gemini via Edge Function
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Usa a Edge Function do Supabase (azuria-chat) que já está configurada
 * com Gemini Flash 2.5 via secrets.
 * 
 * Vantagens:
 * - API Key segura (no servidor, não exposta no frontend)
 * - Usa a mesma infraestrutura já funcionando
 * - Modelo atualizado (gemini-2.5-flash)
 */

import { supabase } from '@/integrations/supabase/client';
import type { CognitiveRole, MessageType, SkillLevel } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Contexto para análise */
export interface AnalysisContext {
  screen: string;
  calculationData?: Record<string, number>;
  recentActions?: string[];
  skillLevel: SkillLevel;
  role: CognitiveRole;
  additional?: string;
}

/** Resultado da análise */
export interface AnalysisResult {
  shouldEmit: boolean;
  messageType: MessageType;
  title: string;
  message: string;
  topic: string;
  confidence: number;
  suggestedActions?: Array<{ id: string; label: string }>;
}

/** Resultado de classificação de intenção */
export interface IntentClassification {
  primaryIntent: string;
  confidence: number;
  entities: Record<string, string>;
  sentiment: 'positive' | 'neutral' | 'negative';
  needsAssistance: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

interface AdapterConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  edgeFunctionName: string;
  timeout: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

interface AdapterState {
  initialized: boolean;
  config: AdapterConfig | null;
  requestCount: number;
  lastRequest: number;
  errors: string[];
}

const state: AdapterState = {
  initialized: false,
  config: null,
  requestCount: 0,
  lastRequest: 0,
  errors: [],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPTS ESPECÍFICOS PARA MODO DEUS
// ═══════════════════════════════════════════════════════════════════════════════

const MODE_DEUS_SYSTEM_PROMPT = `Você é o assistente cognitivo do Modo Deus do Azuria.

Seu papel é analisar contextos e decidir se deve emitir mensagens de assistência ao usuário.

REGRAS:
- Seja conciso e direto
- Foque em ações práticas
- Use termos de negócio brasileiros
- Valores em BRL
- Porcentagens com 1 casa decimal
- Nunca invente dados
- Se não tiver certeza, diga

FORMATO DE RESPOSTA (JSON):
{
  "shouldEmit": boolean,
  "messageType": "insight" | "suggestion" | "warning" | "tip" | "confirmation",
  "title": "string curto",
  "message": "string até 200 chars",
  "topic": "string identificador",
  "confidence": number 0-1,
  "suggestedActions": [{ "id": "string", "label": "string" }]
}`;

const INTENT_CLASSIFICATION_PROMPT = `Analise a entrada do usuário e classifique a intenção.

INTENÇÕES: calculate, understand, compare, optimize, report, help, other

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

/**
 * Chama a Edge Function do Supabase
 */
async function callEdgeFunction(
  message: string,
  context?: Record<string, unknown>
): Promise<string | null> {
  if (!state.initialized || !state.config) {
    return null;
  }
  
  try {
    state.requestCount++;
    state.lastRequest = Date.now();
    
    const { data, error } = await Promise.race([
      supabase.functions.invoke(state.config.edgeFunctionName, {
        body: {
          message,
          context: context || {},
          history: [], // Modo Deus não usa histórico de conversa
        },
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), state.config.timeout)
      ),
    ]);
    
    if (error) {
      throw error;
    }
    
    return data?.message || data?.text || null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    state.errors.push(errorMsg);
    // eslint-disable-next-line no-console
    console.error('[SupabaseGeminiAdapter] Edge Function error:', errorMsg);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Inicializa o adaptador
 * 
 * Nota: Usa o cliente Supabase já inicializado do projeto
 */
export function initSupabaseGemini(
  supabaseUrl: string,
  supabaseAnonKey: string,
  edgeFunctionName: string = 'azuria-chat',
  timeout: number = 10000
): boolean {
  try {
    // Verificar se o cliente Supabase está disponível
    // eslint-disable-next-line no-console
    console.log('[SupabaseGeminiAdapter] Initializing...', {
      hasSupabaseClient: !!supabase,
      supabaseUrl: supabaseUrl ? 'provided' : 'missing',
      supabaseAnonKey: supabaseAnonKey ? 'provided' : 'missing',
      edgeFunctionName,
    });
    
    if (!supabase) {
      // eslint-disable-next-line no-console
      console.error('[SupabaseGeminiAdapter] Supabase client not available');
      return false;
    }
    
    state.config = {
      supabaseUrl,
      supabaseAnonKey,
      edgeFunctionName,
      timeout,
    };
    
    state.initialized = true;
    
    // eslint-disable-next-line no-console
    console.log('[SupabaseGeminiAdapter] Initialized successfully', {
      edgeFunction: edgeFunctionName,
      model: 'gemini-2.5-flash',
      initialized: state.initialized,
      hasConfig: !!state.config,
    });
    
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[SupabaseGeminiAdapter] Init error:', error);
    state.errors.push(error instanceof Error ? error.message : 'Init error');
    return false;
  }
}

/**
 * Analisa contexto e gera insight
 */
export async function analyzeContext(context: AnalysisContext): Promise<AnalysisResult | null> {
  if (!state.initialized || !state.config) {
    return null;
  }
  
  const formattedContext = formatContext(context);
  const prompt = `${MODE_DEUS_SYSTEM_PROMPT}

CONTEXTO DO USUÁRIO:
${formattedContext}

Analise o contexto e determine se deve emitir uma mensagem de assistência. Considere o nível do usuário para ajustar a linguagem.`;

  try {
    const response = await callEdgeFunction(prompt, {
      systemPrompt: MODE_DEUS_SYSTEM_PROMPT,
      context: formattedContext,
    });
    
    if (!response) {
      return null;
    }
    
    const parsed = safeParseJSON<Partial<AnalysisResult>>(response, {});
    
    if (!parsed.shouldEmit) {
      return {
        shouldEmit: false,
        messageType: 'insight',
        title: '',
        message: '',
        topic: 'none',
        confidence: 0,
      };
    }
    
    return {
      shouldEmit: parsed.shouldEmit ?? false,
      messageType: parsed.messageType ?? 'insight',
      title: parsed.title ?? 'Insight',
      message: parsed.message ?? '',
      topic: parsed.topic ?? 'gemini_insight',
      confidence: parsed.confidence ?? 0.5,
      suggestedActions: parsed.suggestedActions,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    state.errors.push(errorMsg);
    // eslint-disable-next-line no-console
    console.error('[SupabaseGeminiAdapter] Analysis error:', errorMsg);
    return null;
  }
}

/**
 * Classifica intenção do usuário
 */
export async function classifyIntent(input: string): Promise<IntentClassification | null> {
  if (!state.initialized || !state.config) {
    return null;
  }
  
  const prompt = `${INTENT_CLASSIFICATION_PROMPT}

ENTRADA DO USUÁRIO:
"${input}"`;

  try {
    const response = await callEdgeFunction(prompt);
    
    if (!response) {
      return null;
    }
    
    const parsed = safeParseJSON<Partial<IntentClassification>>(response, {});
    
    return {
      primaryIntent: parsed.primaryIntent ?? 'other',
      confidence: parsed.confidence ?? 0.5,
      entities: parsed.entities ?? {},
      sentiment: parsed.sentiment ?? 'neutral',
      needsAssistance: parsed.needsAssistance ?? false,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    state.errors.push(errorMsg);
    return null;
  }
}

/**
 * Gera resposta conversacional
 */
export async function generateResponse(
  userMessage: string,
  context?: Partial<AnalysisContext>
): Promise<string | null> {
  if (!state.initialized || !state.config) {
    return null;
  }
  
  const fullContext = context ? formatContext(context as AnalysisContext) : '';
  
  const prompt = fullContext
    ? `CONTEXTO:\n${fullContext}\n\nMENSAGEM DO USUÁRIO:\n"${userMessage}"\n\nResponda de forma natural e útil, mantendo o foco em ajudar com cálculos e operações de negócio. Responda em português brasileiro.`
    : userMessage;

  try {
    return await callEdgeFunction(prompt);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    state.errors.push(errorMsg);
    return null;
  }
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
  if (!state.initialized || !state.config) {
    return null;
  }
  
  const dataStr = Object.entries(calculationData)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  
  const prompt = `Analise os seguintes dados de um cálculo de ${calculationType}:

${dataStr}

Forneça:
1. Uma análise breve (máx 100 palavras)
2. Até 3 sugestões de otimização
3. Até 2 riscos identificados
4. Até 2 oportunidades

Responda em JSON:
{
  "analysis": "string",
  "suggestions": ["string"],
  "risks": ["string"],
  "opportunities": ["string"]
}`;

  try {
    const response = await callEdgeFunction(prompt);
    
    if (!response) {
      return null;
    }
    
    return safeParseJSON(response, {
      analysis: 'Análise não disponível',
      suggestions: [],
      risks: [],
      opportunities: [],
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    state.errors.push(errorMsg);
    return null;
  }
}

/**
 * Verifica se está disponível
 */
export function isSupabaseGeminiAvailable(): boolean {
  return state.initialized && state.config !== null && supabase !== null;
}

/**
 * Obtém estatísticas
 */
export function getSupabaseGeminiStats(): {
  initialized: boolean;
  requestCount: number;
  lastRequest: number;
  errorCount: number;
  recentErrors: string[];
  model: string;
} {
  return {
    initialized: state.initialized,
    requestCount: state.requestCount,
    lastRequest: state.lastRequest,
    errorCount: state.errors.length,
    recentErrors: state.errors.slice(-5),
    model: 'gemini-2.5-flash',
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

export const SupabaseGeminiAdapter = {
  init: initSupabaseGemini,
  isAvailable: isSupabaseGeminiAvailable,
  analyzeContext,
  classifyIntent,
  generateResponse,
  analyzeCalculation,
  getStats: getSupabaseGeminiStats,
  clearErrors,
};

export default SupabaseGeminiAdapter;

