/**
 * Hook personalizado para integração com Abacatepay
 * Gerencia criação de cobranças e verificação de status de pagamento
 *
 * @module hooks/useAbacatePay
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/services/logger';
import type {
  AbacatePayBillingStatus,
  CreateSubscriptionBillingParams,
} from '@/types/abacatepay';

interface CreateBillingResponse {
  success: boolean;
  data?: {
    billingId: string;
    url: string;
    amount: number;
  };
  error?: string;
}

interface CheckStatusResponse {
  success: boolean;
  data?: {
    status: AbacatePayBillingStatus;
    amount: number;
    paidAt?: string;
  };
  error?: string;
}

interface UseAbacatePayReturn {
  createBilling: (params: CreateSubscriptionBillingParams) => Promise<void>;
  checkBillingStatus: (
    billingId: string
  ) => Promise<CheckStatusResponse | null>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para integração com Abacatepay
 *
 * @example
 * ```tsx
 * const { createBilling, isLoading } = useAbacatePay();
 *
 * const handleCheckout = async () => {
 *   await createBilling({
 *     planId: 'essencial',
 *     billingInterval: 'monthly',
 *     methods: ['PIX', 'CARD']
 *   });
 * };
 * ```
 */
export function useAbacatePay(): UseAbacatePayReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cria uma nova cobrança no Abacatepay
   */
  const createBilling = async (
    params: CreateSubscriptionBillingParams
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se usuário está autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const errorMsg = 'Você precisa estar logado para assinar um plano';
        setError(errorMsg);
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Obter token de autenticação
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const errorMsg = 'Sessão expirada. Faça login novamente.';
        setError(errorMsg);
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Chamar Edge Function para criar cobrança
      logger.info('Criando cobrança no Abacatepay', {
        planId: params.planId,
        billingInterval: params.billingInterval,
      });

      const { data, error: functionError } =
        await supabase.functions.invoke<CreateBillingResponse>(
          'abacatepay-create-billing',
          {
            body: {
              planId: params.planId,
              billingInterval: params.billingInterval,
              methods: params.methods || ['PIX', 'CARD'],
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

      if (functionError) {
        logger.error('Erro ao criar cobrança:', {
          error: functionError,
          message: functionError.message,
        });

        const errorMsg =
          functionError.message ||
          'Erro ao processar pagamento. Tente novamente.';
        setError(errorMsg);
        toast({
          title: 'Erro ao criar cobrança',
          description: errorMsg,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (data?.success && data?.data?.url) {
        logger.info('Cobrança criada com sucesso', {
          billingId: data.data.billingId,
        });

        // Redirecionar para página de pagamento do Abacatepay
        globalThis.window.location.href = data.data.url;
      } else {
        const errorMsg = data?.error || 'Erro ao gerar link de pagamento';
        setError(errorMsg);
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    } catch (err) {
      logger.error('Erro inesperado ao criar cobrança:', err);

      const errorMsg = 'Erro inesperado. Tente novamente.';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  /**
   * Verifica o status de uma cobrança
   */
  const checkBillingStatus = async (
    billingId: string
  ): Promise<CheckStatusResponse | null> => {
    try {
      // Verificar autenticação
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.error('Usuário não autenticado ao verificar status');
        return null;
      }

      // Obter token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        logger.error('Sessão expirada ao verificar status');
        return null;
      }

      // Chamar Edge Function para verificar status
      const { data, error: functionError } =
        await supabase.functions.invoke<CheckStatusResponse>(
          'abacatepay-check-status',
          {
            body: { billingId },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

      if (functionError) {
        logger.error('Erro ao verificar status:', functionError);
        return null;
      }

      return data || null;
    } catch (err) {
      logger.error('Erro inesperado ao verificar status:', err);
      return null;
    }
  };

  return {
    createBilling,
    checkBillingStatus,
    isLoading,
    error,
  };
}
