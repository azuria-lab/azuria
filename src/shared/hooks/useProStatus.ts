
import { useEffect, useState } from 'react';
import { logger } from '@/services/logger';
import { useAuthContext } from '@/domains/auth';

interface ProStatus {
  isPro: boolean;
  isLoading: boolean;
  subscriptionEnd: Date | null;
  planType: string | null;
}

export const useProStatus = (): ProStatus => {
  const [proStatus, setProStatus] = useState<ProStatus>({
    isPro: false,
    isLoading: true,
    subscriptionEnd: null,
    planType: null
  });

  const { isAuthenticated, user } = useAuthContext();

  useEffect(() => {
    const checkProStatus = async () => {
      if (!isAuthenticated || !user) {
        setProStatus({
          isPro: false,
          isLoading: false,
          subscriptionEnd: null,
          planType: null
        });
        return;
      }

      try {
        // Verificar no localStorage primeiro (cache)
        const cachedStatus = localStorage.getItem('userProStatus');
        if (cachedStatus) {
          const parsed = JSON.parse(cachedStatus);
          setProStatus({
            isPro: parsed.isPro || false,
            isLoading: false,
            subscriptionEnd: parsed.subscriptionEnd ? new Date(parsed.subscriptionEnd) : null,
            planType: parsed.planType || null
          });
        }

        // TODO: Aqui seria a chamada real para verificar status PRO
        // Por enquanto, simular baseado no localStorage
        const simulatedPro = localStorage.getItem('isPro') === 'true';
        
        const status = {
          isPro: simulatedPro,
          isLoading: false,
          subscriptionEnd: simulatedPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 dias
          planType: simulatedPro ? 'PRO' : null
        };

        setProStatus(status);
        
        // Salvar no localStorage
        localStorage.setItem('userProStatus', JSON.stringify({
          isPro: status.isPro,
          subscriptionEnd: status.subscriptionEnd?.toISOString(),
          planType: status.planType
        }));

      } catch (error) {
  logger.error('Erro ao verificar status PRO:', error);
        setProStatus({
          isPro: false,
          isLoading: false,
          subscriptionEnd: null,
          planType: null
        });
      }
    };

    checkProStatus();
  }, [isAuthenticated, user]);

  return proStatus;
};
