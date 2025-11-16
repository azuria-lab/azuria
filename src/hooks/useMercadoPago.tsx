/**
 * Hook para gerenciar pagamentos via Mercado Pago
 * 
 * @module useMercadoPago
 */

import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from './useSubscription';
import {
  cancelSubscription as cancelMPSubscription,
  createPaymentPreference,
  createSubscription,
  formatCurrency,
  PLAN_PRICES,
  type PreferenceData,
  type SubscriptionData,
} from '@/lib/mercadopago-client';
import type { PlanId } from '@/types/subscription';

/**
 * Estado do processo de checkout
 */
export type CheckoutStatus = 'idle' | 'creating' | 'redirecting' | 'processing' | 'success' | 'error';

/**
 * Dados do checkout
 */
export interface CheckoutData {
  status: CheckoutStatus;
  error?: string;
  preferenceId?: string;
  checkoutUrl?: string;
}

/**
 * Hook para integração com Mercado Pago
 * 
 * Gerencia todo o fluxo de:
 * - Criação de preferências de pagamento
 * - Criação de assinaturas recorrentes
 * - Redirecionamento para checkout
 * - Cancelamento de assinaturas
 * 
 * @returns Funções e estado do Mercado Pago
 * 
 * @example
 * ```tsx
 * function PricingCard() {
 *   const { startCheckout, checkoutData } = useMercadoPago();
 *   
 *   const handleSubscribe = () => {
 *     startCheckout('essencial');
 *   };
 *   
 *   return (
 *     <button 
 *       onClick={handleSubscribe}
 *       disabled={checkoutData.status === 'creating'}
 *     >
 *       {checkoutData.status === 'creating' ? 'Processando...' : 'Assinar'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useMercadoPago() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, refresh } = useSubscription();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    status: 'idle',
  });

  /**
   * Mutation para criar assinatura
   */
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planType: Exclude<PlanId, 'free' | 'enterprise'>) => {
      if (!subscription?.userId) {
        throw new Error('Usuário não autenticado');
      }

      return await createSubscription(planType, subscription.userId);
    },
    onSuccess: (data: SubscriptionData) => {
      setCheckoutData({
        status: 'redirecting',
        checkoutUrl: data.init_point,
      });

      // Redirecionar para checkout do Mercado Pago
      window.location.href = data.init_point;
    },
    onError: (error: Error) => {
      setCheckoutData({
        status: 'error',
        error: error.message,
      });

      toast({
        variant: 'destructive',
        title: 'Erro ao criar assinatura',
        description: error.message,
      });
    },
  });

  /**
   * Mutation para criar preferência de pagamento único
   */
  const createPreferenceMutation = useMutation({
    mutationFn: async (planType: Exclude<PlanId, 'free' | 'enterprise'>) => {
      if (!subscription?.userId) {
        throw new Error('Usuário não autenticado');
      }

      return await createPaymentPreference(planType, subscription.userId);
    },
    onSuccess: (data: PreferenceData) => {
      setCheckoutData({
        status: 'redirecting',
        preferenceId: data.id,
        checkoutUrl: data.init_point,
      });

      // Redirecionar para checkout do Mercado Pago
      window.location.href = data.init_point;
    },
    onError: (error: Error) => {
      setCheckoutData({
        status: 'error',
        error: error.message,
      });

      toast({
        variant: 'destructive',
        title: 'Erro ao criar pagamento',
        description: error.message,
      });
    },
  });

  /**
   * Mutation para cancelar assinatura
   */
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!subscription?.mercadoPagoSubscriptionId) {
        throw new Error('Assinatura não encontrada');
      }

      return await cancelMPSubscription(subscription.mercadoPagoSubscriptionId);
    },
    onSuccess: () => {
      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso',
      });

      // Atualizar dados da subscription
      refresh();
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar assinatura',
        description: error.message,
      });
    },
  });

  /**
   * Inicia o processo de checkout para um plano
   * 
   * @param planType - Tipo do plano a assinar
   * @param recurring - Se true, cria assinatura recorrente; se false, pagamento único
   */
  const startCheckout = useCallback((
    planType: Exclude<PlanId, 'free' | 'enterprise'>,
    recurring: boolean = true
  ) => {
    setCheckoutData({ status: 'creating' });

    if (recurring) {
      createSubscriptionMutation.mutate(planType);
    } else {
      createPreferenceMutation.mutate(planType);
    }
  }, [createSubscriptionMutation, createPreferenceMutation]);

  /**
   * Cancela a assinatura atual
   */
  const cancelCurrentSubscription = useCallback(() => {
    if (!subscription?.mercadoPagoSubscriptionId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhuma assinatura ativa encontrada',
      });
      return;
    }

    cancelSubscriptionMutation.mutate();
  }, [subscription, cancelSubscriptionMutation, toast]);

  /**
   * Reseta o estado do checkout
   */
  const resetCheckout = useCallback(() => {
    setCheckoutData({ status: 'idle' });
  }, []);

  /**
   * Processa o retorno do Mercado Pago após pagamento
   * 
   * @param status - Status do pagamento (success, failure, pending)
   * @param _paymentId - ID do pagamento
   */
  const handlePaymentReturn = useCallback((
    status: 'success' | 'failure' | 'pending',
    _paymentId?: string
  ) => {
    switch (status) {
      case 'success':
        setCheckoutData({ status: 'success' });
        toast({
          title: 'Pagamento aprovado!',
          description: 'Sua assinatura foi ativada com sucesso',
        });
        refresh();
        navigate('/assinatura');
        break;

      case 'failure':
        setCheckoutData({ status: 'error', error: 'Pagamento recusado' });
        toast({
          variant: 'destructive',
          title: 'Pagamento recusado',
          description: 'Não foi possível processar seu pagamento. Tente novamente.',
        });
        break;

      case 'pending':
        setCheckoutData({ status: 'processing' });
        toast({
          title: 'Pagamento pendente',
          description: 'Estamos processando seu pagamento. Você será notificado quando for aprovado.',
        });
        navigate('/assinatura');
        break;

      default:
        break;
    }
  }, [toast, refresh, navigate]);

  /**
   * Obtém o preço de um plano
   * 
   * @param planType - Tipo do plano
   * @returns Preço formatado
   */
  const getPlanPrice = useCallback((planType: PlanId): string => {
    if (planType === 'free') {
      return 'Grátis';
    }
    if (planType === 'enterprise') {
      return 'Personalizado';
    }
    
    return formatCurrency(PLAN_PRICES[planType]);
  }, []);

  return {
    // Estado
    checkoutData,
    isProcessing: checkoutData.status === 'creating' || checkoutData.status === 'redirecting',
    hasError: checkoutData.status === 'error',
    
    // Ações
    startCheckout,
    cancelCurrentSubscription,
    resetCheckout,
    handlePaymentReturn,
    getPlanPrice,
    
    // Status das mutations
    isCreatingSubscription: createSubscriptionMutation.isPending,
    isCreatingPayment: createPreferenceMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
  };
}
