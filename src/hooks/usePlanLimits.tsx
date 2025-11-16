/**
 * Hook para gerenciar limites de uso baseado no plano
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from './useSubscription';
import { PLANS } from '@/config/plans';
import type { UsageTracking, UserLimits } from '@/types/subscription';

export const usePlanLimits = () => {
  const [usage, setUsage] = useState<UsageTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const { subscription } = useSubscription();
  const { toast } = useToast();

  const fetchUsage = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !subscription) {
        setUsage(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        setLoading(false);
        return;
      }

      setUsage({
        id: data.id,
        userId: data.user_id,
        subscriptionId: data.subscription_id,
        calculationsToday: data.calculations_today,
        calculationsThisMonth: data.calculations_this_month,
        aiQueriesThisMonth: data.ai_queries_this_month,
        apiRequestsThisMonth: data.api_requests_this_month,
        lastCalculationAt: data.last_calculation_at ? new Date(data.last_calculation_at) : undefined,
        lastAiQueryAt: data.last_ai_query_at ? new Date(data.last_ai_query_at) : undefined,
        lastApiRequestAt: data.last_api_request_at ? new Date(data.last_api_request_at) : undefined,
        periodStart: new Date(data.period_start),
        periodEnd: new Date(data.period_end),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      });
      
    } catch {
      // Error silently handled
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  useEffect(() => {
    if (subscription) {
      fetchUsage();
    }
  }, [subscription, fetchUsage]);

  /**
   * Obtém os limites atuais do usuário
   */
  const getLimits = (): UserLimits | null => {
    if (!subscription || !usage) {
      return null;
    }

    const plan = PLANS[subscription.planId];
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    return {
      dailyCalculations: {
        limit: plan.features.dailyCalculations,
        used: usage.calculationsToday,
        remaining: plan.features.dailyCalculations === 'unlimited' 
          ? 'unlimited' 
          : Math.max(0, plan.features.dailyCalculations - usage.calculationsToday),
        resetsAt: endOfDay,
      },
      monthlyAiQueries: {
        limit: plan.features.aiQueriesPerMonth,
        used: usage.aiQueriesThisMonth,
        remaining: plan.features.aiQueriesPerMonth === 'unlimited'
          ? 'unlimited'
          : Math.max(0, plan.features.aiQueriesPerMonth - usage.aiQueriesThisMonth),
        resetsAt: usage.periodEnd,
      },
      monthlyApiRequests: {
        limit: plan.features.apiRequestsPerMonth,
        used: usage.apiRequestsThisMonth,
        remaining: plan.features.apiRequestsPerMonth === 'unlimited'
          ? 'unlimited'
          : Math.max(0, plan.features.apiRequestsPerMonth - usage.apiRequestsThisMonth),
        resetsAt: usage.periodEnd,
      },
      stores: {
        limit: plan.features.maxStores,
        used: 0, // TODO: Implementar contagem de lojas
        remaining: plan.features.maxStores === 'unlimited'
          ? 'unlimited'
          : plan.features.maxStores,
      },
      teamMembers: {
        limit: plan.features.teamMembers,
        used: 0, // TODO: Implementar contagem de membros
        remaining: plan.features.teamMembers === 'unlimited'
          ? 'unlimited'
          : plan.features.teamMembers,
      },
    };
  };

  /**
   * Verifica se o usuário pode fazer um cálculo
   */
  const canMakeCalculation = (): boolean => {
    const limits = getLimits();
    if (!limits) {
      return false;
    }

    const { limit, remaining } = limits.dailyCalculations;
    
    if (limit === 'unlimited') {
      return true;
    }

    if (remaining === 'unlimited') {
      return true;
    }

    return remaining > 0;
  };

  /**
   * Verifica se o usuário pode fazer uma consulta à IA
   */
  const canMakeAIQuery = (): boolean => {
    const limits = getLimits();
    if (!limits) {
      return false;
    }

    const { limit, remaining } = limits.monthlyAiQueries;
    
    if (limit === 'unlimited' || limit === 0) {
      return limit === 'unlimited';
    }

    if (remaining === 'unlimited') {
      return true;
    }

    return remaining > 0;
  };

  /**
   * Verifica se o usuário pode fazer uma requisição à API
   */
  const canMakeAPIRequest = (): boolean => {
    const limits = getLimits();
    if (!limits) {
      return false;
    }

    const { limit, remaining } = limits.monthlyApiRequests;
    
    if (limit === 'unlimited' || limit === 0) {
      return limit === 'unlimited';
    }

    if (remaining === 'unlimited') {
      return true;
    }

    return remaining > 0;
  };

  /**
   * Incrementa o contador de cálculos
   */
  const trackCalculation = async (): Promise<boolean> => {
    if (!canMakeCalculation()) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite de cálculos diários. Faça upgrade do seu plano.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !usage) {
        return false;
      }

      const { error } = await supabase
        .from('usage_tracking')
        .update({
          calculations_today: usage.calculationsToday + 1,
          calculations_this_month: usage.calculationsThisMonth + 1,
          last_calculation_at: new Date().toISOString(),
        })
        .eq('id', usage.id);

      if (error) {
        throw error;
      }

      setUsage({
        ...usage,
        calculationsToday: usage.calculationsToday + 1,
        calculationsThisMonth: usage.calculationsThisMonth + 1,
        lastCalculationAt: new Date(),
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao rastrear cálculo',
        description: 'Não foi possível atualizar o contador de uso.',
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Incrementa o contador de consultas à IA
   */
  const trackAIQuery = async (): Promise<boolean> => {
    if (!canMakeAIQuery()) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite de consultas à IA. Faça upgrade do seu plano.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !usage) {
        return false;
      }

      const { error } = await supabase
        .from('usage_tracking')
        .update({
          ai_queries_this_month: usage.aiQueriesThisMonth + 1,
          last_ai_query_at: new Date().toISOString(),
        })
        .eq('id', usage.id);

      if (error) {
        throw error;
      }

      setUsage({
        ...usage,
        aiQueriesThisMonth: usage.aiQueriesThisMonth + 1,
        lastAiQueryAt: new Date(),
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao rastrear consulta IA',
        description: 'Não foi possível atualizar o contador de uso.',
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Incrementa o contador de requisições à API
   */
  const trackAPIRequest = async (): Promise<boolean> => {
    if (!canMakeAPIRequest()) {
      toast({
        title: 'Limite atingido',
        description: 'Você atingiu o limite de requisições à API. Faça upgrade do seu plano.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !usage) {
        return false;
      }

      const { error } = await supabase
        .from('usage_tracking')
        .update({
          api_requests_this_month: usage.apiRequestsThisMonth + 1,
          last_api_request_at: new Date().toISOString(),
        })
        .eq('id', usage.id);

      if (error) {
        throw error;
      }

      setUsage({
        ...usage,
        apiRequestsThisMonth: usage.apiRequestsThisMonth + 1,
        lastApiRequestAt: new Date(),
      });

      return true;
    } catch {
      toast({
        title: 'Erro ao rastrear requisição API',
        description: 'Não foi possível atualizar o contador de uso.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    usage,
    loading,
    limits: getLimits(),
    canMakeCalculation,
    canMakeAIQuery,
    canMakeAPIRequest,
    trackCalculation,
    trackAIQuery,
    trackAPIRequest,
    refresh: fetchUsage,
  };
};
