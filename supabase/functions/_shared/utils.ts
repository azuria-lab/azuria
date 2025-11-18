/* eslint-disable no-console, @typescript-eslint/no-non-null-assertion */
/**
 * Utilitários compartilhados entre as Edge Functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * Cria cliente Supabase com credenciais de serviço
 */
export function createSupabaseClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Valida token de autenticação
 */
export async function validateAuth(authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const supabase = createSupabaseClient(authHeader);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Invalid authentication token');
  }

  return { user, supabase };
}

/**
 * Faz requisição para API do Mercado Pago
 */
export async function mercadoPagoRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
  }

  const url = `https://api.mercadopago.com${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Mercado Pago API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorData,
    });
    throw new Error(`Mercado Pago API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Registra log de erro no Supabase
 */
export async function logError(
  supabase: ReturnType<typeof createSupabaseClient>,
  context: string,
  error: Error,
  metadata?: Record<string, unknown>
) {
  console.error(`[${context}] Error:`, error, metadata);
  
  // Opcional: salvar logs em tabela de logs (se existir)
  try {
    // await supabase.from('error_logs').insert({
    //   context,
    //   message: error.message,
    //   stack: error.stack,
    //   metadata,
    //   created_at: new Date().toISOString(),
    // });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

/**
 * Gera URL de retorno para o frontend
 */
export function getReturnUrl(status: 'success' | 'failure' | 'pending'): string {
  const frontendUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';
  return `${frontendUrl}/pagamento/retorno?status=${status}`;
}

/**
 * Valida se um plano é válido
 */
export function isValidPlan(planId: string): boolean {
  return ['free', 'essencial', 'pro', 'enterprise'].includes(planId);
}

/**
 * Valida se um intervalo de cobrança é válido
 */
export function isValidBillingInterval(interval: string): boolean {
  return ['monthly', 'annual'].includes(interval);
}
