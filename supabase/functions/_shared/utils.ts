/* eslint-disable no-console */
/**
 * Utilitários compartilhados entre as Edge Functions
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

/**
 * Cria cliente Supabase com credenciais de serviço
 * Usa SERVICE_ROLE_KEY para operações privilegiadas
 */
export function createSupabaseClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  // Validação em runtime (não em build time)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured'
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Cria cliente Supabase com ANON_KEY para validar tokens JWT de usuários
 */
export function createSupabaseClientForAuth(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Valida token de autenticação
 * Usa ANON_KEY para validar JWT, depois retorna cliente com SERVICE_ROLE_KEY
 * Segue o mesmo padrão de abacatepay-create-billing que funciona
 */
export async function validateAuth(authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing environment variables:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured');
  }

  // Criar cliente Supabase com ANON_KEY (igual abacatepay-create-billing)
  // Passar authHeader diretamente (já vem como "Bearer token")
  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader, // Já vem como "Bearer token"
      },
    },
  });

  // Verificar usuário autenticado (igual abacatepay-create-billing)
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser();

  if (userError || !user) {
    console.error('Auth validation error:', {
      error: userError?.message,
      errorCode: userError?.status,
      errorName: userError?.name,
      hasUser: !!user,
      authHeaderPresent: !!authHeader,
      authHeaderPrefix: authHeader.substring(0, 30) + '...',
    });
    throw new Error('Unauthorized');
  }

  console.log('User authenticated successfully:', {
    userId: user.id,
    email: user.email,
  });

  // Criar cliente com SERVICE_ROLE_KEY para operações no banco
  const supabase = createSupabaseClient(authHeader);

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
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    let errorMessage = `Mercado Pago API error: ${response.status} ${response.statusText}`;

    try {
      const errorJson = JSON.parse(errorData);
      if (errorJson.message) {
        errorMessage = `Mercado Pago API error: ${errorJson.message}`;
      }
      if (
        errorJson.cause &&
        Array.isArray(errorJson.cause) &&
        errorJson.cause.length > 0
      ) {
        errorMessage += ` - ${
          errorJson.cause[0].description || errorJson.cause[0].code
        }`;
      }
    } catch {
      // Se não conseguir parsear, usar a mensagem padrão
    }

    console.error('Mercado Pago API Error:', {
      status: response.status,
      statusText: response.statusText,
      endpoint,
      body: errorData,
    });

    throw new Error(errorMessage);
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
 * Mercado Pago exige URLs HTTPS válidas
 */
export function getReturnUrl(
  status: 'success' | 'failure' | 'pending'
): string {
  // Mercado Pago não aceita URLs localhost, usar URL de produção como fallback
  const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://azuria.app.br';
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
