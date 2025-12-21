/**
 * EngineFacade - Fachada Unificada para Engines de IA
 *
 * Orquestra chamadas para diferentes engines:
 * - Gemini (UX rápida)
 * - NIM (análise profunda)
 * - Local (fallback determinístico)
 *
 * @module azuria_ai/core/engineFacade
 */

import { geminiAdapter } from '../engines/geminiAdapter';
import { NimAdapter } from '../engines/nimAdapter';
import {
  type AIEngine,
  autoRoute,
  resolveEngine,
  type TaskRoute,
} from './taskRouter';

// =============================================================================
// CONFIGURAÇÃO DOS ADAPTERS
// =============================================================================

// NIM Adapter (configurado para NVIDIA API)
const nimAdapter = new NimAdapter({
  apiKey: import.meta.env.VITE_NIM_API_KEY || '',
  baseUrl: 'https://integrate.api.nvidia.com/v1',
  defaultModel:
    import.meta.env.VITE_NIM_MODEL || 'nvidia/nemotron-3-nano-30b-a3b',
});

// =============================================================================
// TIPOS
// =============================================================================

export interface EngineCallResult {
  text: string;
  tokensUsed: number;
  latencyMs: number;
  model: string;
  engine: AIEngine;
  fallback: boolean;
  raw?: unknown;
}

export interface CallOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  forceEngine?: AIEngine;
}

// =============================================================================
// FUNÇÕES PRINCIPAIS
// =============================================================================

/**
 * Chama o engine apropriado baseado na tarefa e prompt
 */
export async function callEngine(
  taskType: string,
  prompt: string,
  opts: CallOptions = {}
): Promise<EngineCallResult> {
  // Determinar rota
  const route = autoRoute(prompt);

  // Resolver engine (com fallback se necessário)
  const engine = opts.forceEngine || resolveEngine(route);

  const startTime = Date.now();
  let result: EngineCallResult;

  try {
    switch (engine) {
      case 'nim':
        result = await callNim(prompt, route, opts);
        break;

      case 'gemini':
        result = await callGemini(prompt, route, opts);
        break;

      case 'local':
      default:
        result = await callLocal(prompt, taskType);
        break;
    }
  } catch (error) {
    console.error(`[EngineFacade] Erro no engine ${engine}:`, error);

    // Fallback
    if (engine !== 'local') {
      console.log(`[EngineFacade] Tentando fallback para: ${route.fallback}`);
      return callEngine(taskType, prompt, {
        ...opts,
        forceEngine: route.fallback,
      });
    }

    result = await callLocal(prompt, taskType);
    result.fallback = true;
  }

  result.latencyMs = Date.now() - startTime;
  return result;
}

/**
 * Chama Gemini
 */
async function callGemini(
  prompt: string,
  route: TaskRoute,
  opts: CallOptions
): Promise<EngineCallResult> {
  const response = await geminiAdapter.callModel({
    prompt,
    systemPrompt: opts.systemPrompt,
    temperature: opts.temperature ?? route.temperature,
    maxTokens: opts.maxTokens ?? route.maxTokens,
  });

  return {
    text: response.text,
    tokensUsed: response.tokensUsed,
    latencyMs: response.latencyMs,
    model: response.model,
    engine: 'gemini',
    fallback: false,
    raw: response.raw,
  };
}

/**
 * Chama NIM
 */
async function callNim(
  prompt: string,
  route: TaskRoute,
  opts: CallOptions
): Promise<EngineCallResult> {
  const response = await nimAdapter.callModel({
    prompt,
    temperature: opts.temperature ?? route.temperature,
    maxTokens: opts.maxTokens ?? route.maxTokens,
  });

  return {
    text: response.text,
    tokensUsed: response.tokensUsed,
    latencyMs: response.latencyMs,
    model: response.model,
    engine: 'nim',
    fallback: false,
    raw: response.raw,
  };
}

/**
 * Resposta local (determinística)
 */
async function callLocal(
  prompt: string,
  taskType: string
): Promise<EngineCallResult> {
  // Respostas determinísticas baseadas no tipo de tarefa
  const responses: Record<string, string> = {
    'explain-simple':
      'Esta funcionalidade requer IA via Edge Function azuria-chat.',
    'suggest-quick': 'Sugestão automática indisponível. Use a Edge Function.',
    chat: 'Chat IA: use a Edge Function azuria-chat.',
    'analyze-pricing': 'Análise automática requer IA via Edge Function.',
    default: 'Processamento local: IA disponível apenas via Edge Function.',
  };

  return {
    text: responses[taskType] || responses.default,
    tokensUsed: 0,
    latencyMs: 0,
    model: 'local',
    engine: 'local',
    fallback: true,
  };
}

// =============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// =============================================================================

/**
 * Chat rápido com a IA
 */
export async function chat(message: string): Promise<string> {
  const result = await callEngine('chat', message);
  return result.text;
}

/**
 * Explica um conceito
 */
export async function explain(
  topic: string,
  context?: string
): Promise<string> {
  const prompt = context
    ? `Explique de forma simples: ${topic}\n\nContexto: ${context}`
    : `Explique de forma simples: ${topic}`;

  const result = await callEngine('explain-simple', prompt);
  return result.text;
}

/**
 * Gera sugestão rápida
 */
export async function suggest(situation: string): Promise<string> {
  const result = await callEngine('suggest-quick', situation);
  return result.text;
}

/**
 * Análise profunda (usa NIM se disponível)
 */
export async function analyze(
  data: string,
  type: 'pricing' | 'tax' | 'risk' = 'pricing'
): Promise<string> {
  const taskType = `analyze-${type}`;
  const result = await callEngine(taskType, data);
  return result.text;
}

/**
 * Verifica status dos engines
 */
export async function getEngineStatus(): Promise<Record<AIEngine, boolean>> {
  return {
    gemini: geminiAdapter.isConfigured(),
    nim: Boolean(import.meta.env.VITE_NIM_API_KEY),
    local: true,
  };
}

export default {
  callEngine,
  chat,
  explain,
  suggest,
  analyze,
  getEngineStatus,
};
