/**
 * ══════════════════════════════════════════════════════════════════════════════
 * EDGE FUNCTION HELPER - Helper para chamar Edge Functions do Supabase
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Centraliza chamadas para Edge Functions, mantendo segurança e consistência.
 */

import { supabase } from '@/integrations/supabase/client';

interface EdgeFunctionCallOptions {
  functionName: string;
  body?: Record<string, unknown>;
  timeout?: number;
}

/**
 * Chama uma Edge Function do Supabase de forma segura
 */
export async function callEdgeFunction({
  functionName,
  body = {},
  timeout = 30000, // 30 segundos padrão
}: EdgeFunctionCallOptions): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
  text?: string;
}> {
  try {
    const { data, error } = await Promise.race([
      supabase.functions.invoke(functionName, { body }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]);

    if (error) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }

    // A Edge Function azuria-chat retorna { message: string } ou { text: string }
    const responseText = data?.message || data?.text || '';

    return {
      success: true,
      data,
      message: responseText,
      text: responseText,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Chama a Edge Function azuria-chat com um prompt
 */
export async function callGeminiViaEdgeFunction(
  prompt: string,
  context?: Record<string, unknown>
): Promise<string | null> {
  const result = await callEdgeFunction({
    functionName: 'azuria-chat',
    body: {
      message: prompt,
      context: context || {},
      history: [],
    },
  });

  if (!result.success) {
    console.error('[EdgeFunctionHelper] Error calling azuria-chat:', result.error);
    return null;
  }

  return result.text || null;
}

