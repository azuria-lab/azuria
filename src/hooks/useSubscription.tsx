/**
 * Hook para gerenciar assinatura do usuário
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PlanId, Subscription } from '@/types/subscription';
import type { Database } from '@/types/supabase';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: 'Erro ao carregar assinatura',
          description: 'Não foi possível carregar sua assinatura. Tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      if (!data) return;
      
      // Type assertion para garantir tipos corretos durante type-check
      const subscriptionData = data as Database['public']['Tables']['subscriptions']['Row'];
      
      setSubscription({
        id: subscriptionData.id,
        userId: subscriptionData.user_id,
        planId: subscriptionData.plan_id as PlanId,
        status: subscriptionData.status,
        billingInterval: subscriptionData.billing_interval,
        currentPeriodStart: new Date(subscriptionData.current_period_start),
        currentPeriodEnd: new Date(subscriptionData.current_period_end),
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        canceledAt: subscriptionData.canceled_at ? new Date(subscriptionData.canceled_at) : undefined,
        trialStart: subscriptionData.trial_start ? new Date(subscriptionData.trial_start) : undefined,
        trialEnd: subscriptionData.trial_end ? new Date(subscriptionData.trial_end) : undefined,
        mercadoPagoSubscriptionId: subscriptionData.mercadopago_subscription_id,
        mercadoPagoPreapprovalId: subscriptionData.mercadopago_preapproval_id,
        createdAt: new Date(subscriptionData.created_at),
        updatedAt: new Date(subscriptionData.updated_at),
      });
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSubscription = async (planId: PlanId, billingInterval: 'monthly' | 'annual') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para atualizar sua assinatura.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: planId,
          billing_interval: billingInterval,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['subscriptions']['Update'])
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: 'Erro ao atualizar assinatura',
          description: 'Não foi possível atualizar sua assinatura. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Assinatura atualizada',
        description: 'Sua assinatura foi atualizada com sucesso!',
      });

      fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return false;
    }
  };

  const cancelSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para cancelar sua assinatura.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['subscriptions']['Update'])
        .eq('user_id', user.id);

      if (error) {
        console.error('Error canceling subscription:', error);
        toast({
          title: 'Erro ao cancelar assinatura',
          description: 'Não foi possível cancelar sua assinatura. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura será cancelada ao final do período atual.',
      });

      fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return false;
    }
  };

  const reactivateSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: 'Erro',
          description: 'Você precisa estar logado para reativar sua assinatura.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          canceled_at: null,
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['subscriptions']['Update'])
        .eq('user_id', user.id);

      if (error) {
        console.error('Error reactivating subscription:', error);
        toast({
          title: 'Erro ao reativar assinatura',
          description: 'Não foi possível reativar sua assinatura. Tente novamente.',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Assinatura reativada',
        description: 'Sua assinatura foi reativada com sucesso!',
      });

      fetchSubscription();
      return true;
    } catch (error) {
      console.error('Error in reactivateSubscription:', error);
      return false;
    }
  };

  return {
    subscription,
    loading,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    refresh: fetchSubscription,
  };
};
