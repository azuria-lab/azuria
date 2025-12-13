/**
 * Mode Deus Hooks
 * 
 * Custom hooks for accessing Mode Deus context
 * Separated from provider for Fast Refresh compatibility
 */

import { useContext } from 'react';
import { ModeDeusContext, type ModeDeusContextValue } from '../providers/ModeDeusContext';

/**
 * Hook para acessar o contexto do Modo Deus
 * Lança erro se usado fora do provider
 */
export function useModeDeus(): ModeDeusContextValue {
  const context = useContext(ModeDeusContext);
  if (!context) {
    throw new Error('useModeDeus must be used within ModeDeusProvider');
  }
  return context;
}

/**
 * Hook opcional para acessar o contexto do Modo Deus
 * Retorna null se usado fora do provider (não lança erro)
 */
export function useModeDeusOptional(): ModeDeusContextValue | null {
  return useContext(ModeDeusContext);
}
