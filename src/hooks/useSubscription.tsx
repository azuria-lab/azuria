/**
 * Hook para gerenciar assinatura do usuário
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PlanId, Subscription } from '@/types/subscription';

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

      setSubscription({
        id: data.id,
        userId: data.user_id,
        planId: data.plan_id as PlanId,
        status: data.status,
        billingInterval: data.billing_interval,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
        canceledAt: data.canceled_at ? new Date(data.canceled_at) : undefined,
        trialStart: data.trial_start ? new Date(data.trial_start) : undefined,
        trialEnd: data.trial_end ? new Date(data.trial_end) : undefined,
        mercadoPagoSubscriptionId: data.mercadopago_subscription_id,
        mercadoPagoPreapprovalId: data.mercadopago_preapproval_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
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
        })
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
        })
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
        })
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
