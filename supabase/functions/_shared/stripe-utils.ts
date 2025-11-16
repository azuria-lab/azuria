/**
 * Utilitários para integração com Stripe
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

/**
 * Cria cliente Stripe
 */
export function createStripeClient(): Stripe {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  return new Stripe(stripeKey, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * Cria cliente Supabase com credenciais de serviço
 */
export function createSupabaseClient(authHeader?: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    global: authHeader ? {
      headers: {
        Authorization: authHeader,
      },
    } : undefined,
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
 * Gera URL de retorno para o frontend
 */
export function getFrontendUrl(): string {
  return Deno.env.get('FRONTEND_URL') || 'http://localhost:5173';
}
