import { useEffect, useState } from 'react';
import { useUserPlan } from './useUserPlan';

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

  const savePreset = (preset: MaquininhaPreset) => {
    if (isFreePlan) {
      return false;
    }

    setPresets((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === preset.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...preset, updated_at: new Date().toISOString() };
        return updated;
      }
      return [...prev, preset];
    });

    return true;
  };

  const deletePreset = (id: string) => {
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
