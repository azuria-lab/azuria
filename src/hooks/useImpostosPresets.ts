import { useEffect, useState } from 'react';
import { useUserPlan } from './useUserPlan';

export interface ImpostosPreset {
  id: string;
  nome: string;
  origemUF: string;
  destinoUF: string;
  tipoOperacao: 'interna' | 'interestadual';
  icms: number;
  pis: number;
  cofins: number;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'azuria_impostos_presets';

export function useImpostosPresets() {
  const { isFreePlan } = useUserPlan();
  const [presets, setPresets] = useState<ImpostosPreset[]>([]);

  // Carregar presets do localStorage ao montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch {
      // Falha ao carregar presets - mantém array vazio
    }
  }, []);

  // Salvar presets no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch {
      // Falha ao salvar presets - operação silenciosa
    }
  }, [presets]);

  const savePreset = async (preset: ImpostosPreset): Promise<boolean> => {
    if (isFreePlan) {
      return false;
    }

    const updatedPreset = {
      ...preset,
      updated_at: new Date().toISOString(),
    };

    setPresets((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === preset.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedPreset;
        return updated;
      }
      return [...prev, updatedPreset];
    });

    return true;
  };

  const deletePreset = async (id: string): Promise<void> => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const getPreset = (id: string) => {
    return presets.find((p) => p.id === id);
  };

  const canSavePresets = !isFreePlan;

  return {
    presets,
    savePreset,
    deletePreset,
    getPreset,
    canSavePresets,
  };
}
