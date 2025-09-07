
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/domains/auth";
import { logger } from '@/services/logger';

interface SubscriptionStatus {
  subscribed: boolean;
  planType?: "monthly" | "yearly";
  subscriptionEnd?: string;
}

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    subscribed: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuthContext();

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubscriptionStatus({ subscribed: false });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        logger.error("Erro ao verificar assinatura:", error);
        setSubscriptionStatus({ subscribed: false });
        return;
      }

      setSubscriptionStatus({
        subscribed: data?.subscribed || false,
        planType: data?.subscription_tier,
        subscriptionEnd: data?.subscription_end
      });

      // Atualizar localStorage para compatibilidade
      localStorage.setItem("isPro", (data?.subscribed || false).toString());
    } catch (error) {
      logger.error("Erro na verificação de assinatura:", error);
      setSubscriptionStatus({ subscribed: false });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Verificar assinatura ao montar e quando autenticação mudar
  useEffect(() => {
    if (isAuthenticated && user) {
      checkSubscription();
    } else {
      setSubscriptionStatus({ subscribed: false });
    }
  }, [isAuthenticated, user, checkSubscription]);

  // Verificar assinatura periodicamente (a cada 5 minutos)
  useEffect(() => {
    if (!isAuthenticated) {return;}

    const interval = setInterval(() => {
      checkSubscription();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated, checkSubscription]);

  return {
    subscriptionStatus,
    isLoading,
    refreshSubscription: checkSubscription
  };
};
