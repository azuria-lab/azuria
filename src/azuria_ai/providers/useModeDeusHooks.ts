/**
 * @fileoverview Mode Deus hooks for accessing the Mode Deus context
 * 
 * These hooks are separated from the provider to enable React Fast Refresh.
 * 
 * @module azuria_ai/providers/useModeDeusHooks
 */

import { useContext } from 'react';
import { ModeDeusContext, type ModeDeusContextValue } from './ModeDeusContext';

/**
 * Hook para acessar o contexto do Modo Deus
 * @throws Se usado fora do ModeDeusProvider
 */
export function useModeDeus(): ModeDeusContextValue {
  const context = useContext(ModeDeusContext);

  if (!context) {
    throw new Error('useModeDeus deve ser usado dentro de ModeDeusProvider');
  }

  return context;
}

/**
 * Hook seguro que não lança erro se fora do provider
 * Útil para componentes que podem existir fora do dashboard
 */
export function useModeDeusOptional(): ModeDeusContextValue | null {
  return useContext(ModeDeusContext);
}
