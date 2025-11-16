/**
 * Componente de bloqueio quando usuário atinge limite do plano
 */

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowRight, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLANS } from '@/config/plans';

interface LimitReachedBlockProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'daily_calculations' | 'ai_queries' | 'api_requests';
  currentPlan: 'free' | 'essencial' | 'pro' | 'enterprise';
}

const limitMessages = {
  daily_calculations: {
    title: 'Limite de cálculos diários atingido',
    description: 'Você utilizou todos os cálculos disponíveis para hoje.',
    recommendation: 'Faça upgrade para fazer cálculos ilimitados.',
  },
  ai_queries: {
    title: 'Limite de consultas IA atingido',
    description: 'Você utilizou todas as consultas à IA disponíveis este mês.',
    recommendation: 'Faça upgrade para ter acesso a mais consultas ou ilimitado.',
  },
  api_requests: {
    title: 'Limite de requisições API atingido',
    description: 'Você utilizou todas as requisições à API disponíveis este mês.',
    recommendation: 'Faça upgrade para aumentar seu limite de integrações.',
  },
};

const suggestedPlans: Record<string, Array<'essencial' | 'pro' | 'enterprise'>> = {
  daily_calculations: ['essencial', 'pro', 'enterprise'],
  ai_queries: ['pro', 'enterprise'],
  api_requests: ['pro', 'enterprise'],
};

export const LimitReachedBlock = ({
  isOpen,
  onClose,
  limitType,
  currentPlan,
}: LimitReachedBlockProps) => {
  const navigate = useNavigate();
  
  const message = limitMessages[limitType];
  const suggested = suggestedPlans[limitType].filter(
    (planId) => {
      const planIndex = ['free', 'essencial', 'pro', 'enterprise'].indexOf(planId);
      const currentIndex = ['free', 'essencial', 'pro', 'enterprise'].indexOf(currentPlan);
      return planIndex > currentIndex;
    }
  );

  const handleUpgrade = () => {
    onClose();
    navigate('/pricing');
  };

  const getFeatureValue = (planId: string, feature: string) => {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return 'N/A';
    }
    
    switch (feature) {
      case 'daily_calculations':
        return plan.features.dailyCalculations === 'unlimited' 
          ? 'Ilimitado' 
          : plan.features.dailyCalculations;
      case 'ai_queries':
        return plan.features.aiQueriesPerMonth === 'unlimited' 
          ? 'Ilimitado' 
          : `${plan.features.aiQueriesPerMonth}/mês`;
      case 'api_requests':
        return plan.features.apiRequestsPerMonth === 'unlimited' 
          ? 'Ilimitado' 
          : `${plan.features.apiRequestsPerMonth}/mês`;
      default:
        return 'N/A';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>{message.title}</DialogTitle>
          </div>
          <DialogDescription className="space-y-4 pt-4">
            <p>{message.description}</p>
            
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertTitle>Recomendação</AlertTitle>
              <AlertDescription>{message.recommendation}</AlertDescription>
            </Alert>

            {/* Planos sugeridos */}
            {suggested.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Planos recomendados:
                </p>
                {suggested.map((planId) => {
                  const plan = PLANS[planId];
                  
                  return (
                    <div
                      key={planId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Crown className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {getFeatureValue(planId, limitType)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          R$ {plan.pricing.monthly}
                          <span className="text-xs font-normal text-muted-foreground">/mês</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleUpgrade} className="gap-2">
            Ver Planos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
