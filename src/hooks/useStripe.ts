/**
 * Hook personalizado para integração com Stripe
 * Gerencia criação de checkout sessions e acesso ao customer portal
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/services/logger';

interface CreateCheckoutParams {
  planId: 'essencial' | 'pro' | 'enterprise';
  billingInterval: 'month' | 'year';
}

interface UseStripeReturn {
  createCheckoutSession: (params: CreateCheckoutParams) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  isLoading: boolean;
}

export function useStripe(): UseStripeReturn {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Cria uma sessão de checkout no Stripe
   */
  const createCheckoutSession = async ({ planId, billingInterval }: CreateCheckoutParams) => {
    setIsLoading(true);
    
    try {
      // Verificar se usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para assinar um plano',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Chamar Edge Function para criar checkout
      logger.info('Chamando stripe-create-checkout', { planId, billingInterval });
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: {
          planId,
          billingInterval
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        logger.error('Erro ao criar checkout:', { error, context: error.context, message: error.message });
        toast({
          title: 'Erro ao criar checkout',
          description: error.message || 'Erro ao processar pagamento. Tente novamente.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      if (data?.success && data?.data?.sessionUrl) {
        // Redirecionar para checkout do Stripe
        window.location.href = data.data.sessionUrl;
      } else {
        toast({
          title: 'Erro',
          description: data?.error || 'Erro ao gerar link de pagamento',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    } catch (error) {
      logger.error('Erro inesperado no checkout:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  /**
   * Abre o Stripe Customer Portal para gerenciar assinatura
   */
  const openCustomerPortal = async () => {
    setIsLoading(true);
    
    try {
      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Obter token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Faça login novamente.',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      // Chamar Edge Function para criar portal session
      const { data, error } = await supabase.functions.invoke('stripe-create-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        logger.error('Erro ao abrir portal:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao abrir portal de gerenciamento',
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }

      if (data?.success && data?.data?.portalUrl) {
        // Redirecionar para portal do Stripe
        window.location.href = data.data.portalUrl;
      } else {
        toast({
          title: 'Erro',
          description: data?.error || 'Você não possui uma assinatura ativa',
          variant: 'destructive'
        });
        setIsLoading(false);
      }
    } catch (error) {
      logger.error('Erro inesperado ao abrir portal:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado. Tente novamente.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    isLoading
  };
}
