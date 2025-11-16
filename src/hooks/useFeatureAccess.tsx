/**
 * Hook para verificar acesso a features baseado no plano
 */

import { useMemo } from 'react';
import { useSubscription } from './useSubscription';
import { PLANS } from '@/config/plans';
import type { FeatureAccessResult, PlanFeatures } from '@/types/subscription';

export const useFeatureAccess = () => {
  const { subscription, loading } = useSubscription();

  const currentPlan = useMemo(() => {
    if (!subscription) {
      return PLANS.free;
    }
    return PLANS[subscription.planId];
  }, [subscription]);

  const features: PlanFeatures = useMemo(() => {
    return currentPlan.features;
  }, [currentPlan]);

  /**
   * Verifica se o usuário tem acesso a uma feature específica
   */
  const hasFeature = <K extends keyof PlanFeatures>(
    feature: K
  ): boolean => {
    const featureValue = features[feature];

    if (typeof featureValue === 'boolean') {
      return featureValue;
    }

    if (typeof featureValue === 'number') {
      return featureValue > 0;
    }

    if (featureValue === 'unlimited') {
      return true;
    }

    if (Array.isArray(featureValue)) {
      return featureValue.length > 0;
    }

    return false;
  };

  /**
   * Verifica acesso a uma calculadora específica
   */
  const canUseCalculator = (type: 'basic' | 'advanced'): FeatureAccessResult => {
    const feature = type === 'basic' ? 'basicCalculator' : 'advancedCalculator';
    const allowed = hasFeature(feature);
    const calculatorType = type === 'basic' ? 'básica' : 'avançada';

    return {
      allowed,
      reason: allowed 
        ? undefined 
        : `A calculadora ${calculatorType} não está disponível no seu plano.`,
      upgradeRequired: !allowed,
      suggestedPlan: !allowed && subscription?.planId === 'free' ? 'essencial' : undefined,
    };
  };

  /**
   * Verifica se o usuário pode usar o assistente de IA
   */
  const canUseAI = (): FeatureAccessResult => {
    const allowed = hasFeature('aiAssistant');
    
    return {
      allowed,
      reason: allowed 
        ? undefined 
        : 'O assistente de IA não está disponível no seu plano.',
      upgradeRequired: !allowed,
      suggestedPlan: !allowed && subscription?.planId === 'free' ? 'essencial' : undefined,
    };
  };

  /**
   * Verifica se o usuário pode salvar o histórico
   */
  const canSaveHistory = (): FeatureAccessResult => {
    const allowed = hasFeature('saveHistory');

    return {
      allowed,
      reason: allowed 
        ? undefined 
        : 'Salvar histórico não está disponível no seu plano.',
      upgradeRequired: !allowed,
      suggestedPlan: !allowed && subscription?.planId === 'free' ? 'essencial' : undefined,
    };
  };

  /**
   * Verifica se o usuário pode exportar relatórios
   */
  const canExportReports = (format?: 'pdf' | 'excel' | 'csv'): FeatureAccessResult => {
    const allowed = hasFeature('exportReports');
    
    if (!allowed) {
      return {
        allowed: false,
        reason: 'Exportação de relatórios não está disponível no seu plano.',
        upgradeRequired: true,
        suggestedPlan: subscription?.planId === 'free' ? 'essencial' : undefined,
      };
    }

    // Se um formato específico foi solicitado, verifica se está disponível
    if (format && !features.exportFormats.includes(format)) {
      return {
        allowed: false,
        reason: `Exportação em formato ${format.toUpperCase()} não está disponível no seu plano.`,
        upgradeRequired: true,
        suggestedPlan: subscription?.planId === 'essencial' ? 'pro' : undefined,
      };
    }

    return {
      allowed: true,
    };
  };

  /**
   * Verifica se o usuário pode usar integração com marketplaces
   */
  const canUseMarketplaceIntegration = (marketplace?: string): FeatureAccessResult => {
    const allowed = hasFeature('marketplaceIntegration');

    if (!allowed) {
      return {
        allowed: false,
        reason: 'Integração com marketplaces não está disponível no seu plano.',
        upgradeRequired: true,
        suggestedPlan: 'pro',
      };
    }

    if (marketplace && !features.marketplaces.includes(marketplace)) {
      return {
        allowed: false,
        reason: `Integração com ${marketplace} não está disponível no seu plano.`,
        upgradeRequired: true,
        suggestedPlan: 'pro',
      };
    }

    return {
      allowed: true,
    };
  };

  /**
   * Verifica se o usuário pode usar API
   */
  const canUseAPI = (): FeatureAccessResult => {
    const allowed = hasFeature('apiAccess');

    return {
      allowed,
      reason: allowed 
        ? undefined 
        : 'Acesso à API não está disponível no seu plano.',
      upgradeRequired: !allowed,
      suggestedPlan: 'pro',
    };
  };

  /**
   * Verifica se o usuário pode usar features de colaboração em equipe
   */
  const canUseTeamFeatures = (): FeatureAccessResult => {
    const allowed = hasFeature('teamCollaboration');

    return {
      allowed,
      reason: allowed 
        ? undefined 
        : 'Recursos de colaboração em equipe estão disponíveis apenas no plano Enterprise.',
      upgradeRequired: !allowed,
      suggestedPlan: 'enterprise',
    };
  };

  /**
   * Verifica se o usuário pode usar white label
   */
  const canUseWhiteLabel = (): FeatureAccessResult => {
    const allowed = hasFeature('whiteLabel');

    return {
      allowed,
      reason: allowed 
        ? undefined 
        : 'White label está disponível apenas no plano Enterprise.',
      upgradeRequired: !allowed,
      suggestedPlan: 'enterprise',
    };
  };

  /**
   * Verifica se tem marca d'água
   */
  const hasWatermark = (): boolean => {
    return features.watermark;
  };

  return {
    loading,
    currentPlan,
    features,
    hasFeature,
    canUseCalculator,
    canUseAI,
    canSaveHistory,
    canExportReports,
    canUseMarketplaceIntegration,
    canUseAPI,
    canUseTeamFeatures,
    canUseWhiteLabel,
    hasWatermark,
  };
};
