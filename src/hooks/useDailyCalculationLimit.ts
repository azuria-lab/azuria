/**
 * Hook para gerenciar limite diário de cálculos
 * Usado para usuários FREE (limite de 5 cálculos/dia)
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/domains/auth';
import { useSubscription } from './useSubscription';
import { PLANS } from '@/config/plans';

interface DailyLimitState {
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
  canCalculate: boolean;
  resetsAt: Date;
}

const STORAGE_KEY_PREFIX = 'azuria_daily_calculations_';

export const useDailyCalculationLimit = () => {
  const { user } = useAuthContext();
  const { subscription } = useSubscription();
  const [limitState, setLimitState] = useState<DailyLimitState>({
    used: 0,
    limit: 'unlimited',
    remaining: 'unlimited',
    canCalculate: true,
    resetsAt: new Date(),
  });

  const getStorageKey = useCallback(() => {
    if (!user?.id) {return null;}
    return `${STORAGE_KEY_PREFIX}${user.id}`;
  }, [user?.id]);

  const getTodayKey = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }, []);

  const loadDailyUsage = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {return { count: 0, date: null };}

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {return { count: 0, date: null };}

      const data = JSON.parse(stored);
      const today = getTodayKey();

      // Se a data armazenada é diferente de hoje, resetar
      if (data.date !== today) {
        localStorage.removeItem(storageKey);
        return { count: 0, date: today };
      }

      return { count: data.count || 0, date: data.date };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading daily usage:', error);
      return { count: 0, date: null };
    }
  }, [getStorageKey, getTodayKey]);

  const saveDailyUsage = useCallback((count: number) => {
    const storageKey = getStorageKey();
    if (!storageKey) {return;}

    try {
      const today = getTodayKey();
      localStorage.setItem(storageKey, JSON.stringify({ count, date: today }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error saving daily usage:', error);
    }
  }, [getStorageKey, getTodayKey]);

  const incrementUsage = useCallback(() => {
    const storageKey = getStorageKey();
    if (!storageKey) {return;}

    const { count } = loadDailyUsage();
    const newCount = count + 1;
    saveDailyUsage(newCount);
    return newCount;
  }, [getStorageKey, loadDailyUsage, saveDailyUsage]);

  // Calcular quando o limite reseta (próxima meia-noite)
  const getResetTime = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);

  // Atualizar estado baseado no plano
  useEffect(() => {
    if (!subscription) {
      // Usuário sem assinatura = FREE
      const plan = PLANS.free;
      const limit = typeof plan.features.dailyCalculations === 'number' 
        ? plan.features.dailyCalculations 
        : 5; // Fallback para 5

      const { count } = loadDailyUsage();
      const remaining = Math.max(0, limit - count);
      const canCalculate = count < limit;

      setLimitState({
        used: count,
        limit,
        remaining,
        canCalculate,
        resetsAt: getResetTime(),
      });
    } else {
      const plan = PLANS[subscription.planId];
      const limit = plan.features.dailyCalculations;

      if (limit === 'unlimited') {
        setLimitState({
          used: 0,
          limit: 'unlimited',
          remaining: 'unlimited',
          canCalculate: true,
          resetsAt: getResetTime(),
        });
      } else {
        const { count } = loadDailyUsage();
        const remaining = Math.max(0, limit - count);
        const canCalculate = count < limit;

        setLimitState({
          used: count,
          limit,
          remaining,
          canCalculate,
          resetsAt: getResetTime(),
        });
      }
    }
  }, [subscription, loadDailyUsage, getResetTime]);

  const recordCalculation = useCallback(() => {
    if (!subscription) {
      // Usuário FREE
      const newCount = incrementUsage();
      const limit = PLANS.free.features.dailyCalculations as number;
      const remaining = Math.max(0, limit - newCount);
      const canCalculate = newCount < limit;

      setLimitState(prev => ({
        ...prev,
        used: newCount,
        remaining,
        canCalculate,
      }));

      return canCalculate;
    } else {
      // Usuários com plano não precisam de contador
      return true;
    }
  }, [subscription, incrementUsage]);

  return {
    ...limitState,
    recordCalculation,
    isFreeUser: !subscription,
    isInicianteOrHigher: subscription && subscription.planId !== 'free',
  };
};

