import { useCallback, useEffect, useState } from 'react';
import { useUserPlan } from './useUserPlan';
import { PresetsSyncService } from '@/services/PresetsSyncService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';

interface TaxasPorParcela {
  [parcela: number]: number;
}

export interface MaquininhaPreset {
  id: string;
  nome: string;
  maquininha_fornecedor: string;
  bandeira: string;
  parcelas_default: number;
  taxas_por_parcela: TaxasPorParcela;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'azuria_maquininha_presets';

export function useMaquininhaPresets() {
  const { isFreePlan } = useUserPlan();
  const [presets, setPresets] = useState<MaquininhaPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Obter userId do usuário autenticado
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          setUserId(null);
          return;
        }
        setUserId(data.user.id ?? null);
      } catch (error) {
        logger.warn('Erro ao obter userId:', error);
        setUserId(null);
      }
    };

    getUserId();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Carregar presets do Supabase ou localStorage
  useEffect(() => {
    const loadPresets = async () => {
      setIsLoading(true);
      try {
        if (userId && PresetsSyncService.isAvailable()) {
          // Tentar carregar do Supabase
          try {
            const supabasePresets = await PresetsSyncService.getMaquininhaPresets(userId);
            setPresets(supabasePresets);
            // Salvar no localStorage como backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(supabasePresets));
          } catch (error) {
            logger.warn('Erro ao carregar do Supabase, usando localStorage:', error);
            // Fallback para localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              setPresets(JSON.parse(stored));
            }
          }
        } else {
          // Usuário não autenticado ou Supabase não disponível - usar localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setPresets(JSON.parse(stored));
          }
        }
      } catch (error) {
        logger.error('Erro ao carregar presets:', error);
        // Fallback para localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            setPresets(JSON.parse(stored));
          }
        } catch {
          // Falha ao carregar presets - mantém array vazio
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPresets();
  }, [userId]);

  // Salvar presets no localStorage sempre que mudarem (como backup)
  useEffect(() => {
    if (!isLoading && presets.length >= 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      } catch {
        // Falha ao salvar presets - operação silenciosa
      }
    }
  }, [presets, isLoading]);

  const savePreset = useCallback(async (preset: MaquininhaPreset): Promise<boolean> => {
    if (isFreePlan) {
      return false;
    }

    const updatedPreset = {
      ...preset,
      updated_at: new Date().toISOString(),
    };

    // Atualizar estado local imediatamente
    setPresets((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === preset.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedPreset;
        return updated;
      }
      return [...prev, updatedPreset];
    });

    // Salvar no Supabase se disponível e usuário autenticado
    if (userId && PresetsSyncService.isAvailable()) {
      try {
        const savedPreset = await PresetsSyncService.saveMaquininhaPreset(userId, updatedPreset);
        // Atualizar com o preset retornado (pode ter UUID gerado)
        setPresets((prev) => {
          const existingIndex = prev.findIndex((p) => p.id === preset.id || p.id === savedPreset.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = savedPreset;
            return updated;
          }
          return [...prev, savedPreset];
        });
      } catch (error) {
        logger.error('Erro ao salvar no Supabase:', error);
        // Continuar mesmo com erro - já salvou no localStorage
      }
    }

    return true;
  }, [isFreePlan, userId]);

  const deletePreset = useCallback(async (id: string): Promise<void> => {
    // Remover do estado local imediatamente
    setPresets((prev) => prev.filter((p) => p.id !== id));

    // Excluir do Supabase se disponível e usuário autenticado
    if (userId && PresetsSyncService.isAvailable()) {
      try {
        await PresetsSyncService.deleteMaquininhaPreset(id);
      } catch (error) {
        logger.error('Erro ao excluir do Supabase:', error);
        // Continuar mesmo com erro - já removeu do localStorage
      }
    }
  }, [userId]);

  const getPreset = useCallback((id: string) => {
    return presets.find((p) => p.id === id);
  }, [presets]);

  const canSavePresets = !isFreePlan;

  return {
    presets,
    savePreset,
    deletePreset,
    getPreset,
    canSavePresets,
    isLoading,
  };
}
