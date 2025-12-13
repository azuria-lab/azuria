/**
 * @fileoverview Mode Deus context - Shared context for Mode Deus provider and hooks
 * 
 * Separated from provider to enable React Fast Refresh.
 * 
 * @module azuria_ai/providers/ModeDeusContext
 */

import { createContext } from 'react';
import type { EngineStatusValue, OrchestratorConfig, ProcessingResult } from '../core/modeDeusOrchestrator';
import type { Suggestion, UserContext } from '../types/operational';

// ============================================================================
// Types
// ============================================================================

export interface ModeDeusState {
  /** Se o sistema está inicializado */
  initialized: boolean;
  /** Se está carregando */
  loading: boolean;
  /** Erro de inicialização, se houver */
  error: string | null;
  /** Status de todos os engines */
  engineStatuses: Record<string, EngineStatusValue>;
  /** Resultado do último processamento */
  lastResult: ProcessingResult | null;
  /** Configuração atual */
  config: OrchestratorConfig | null;
}

export interface ModeDeusContextValue extends ModeDeusState {
  /** Inicializa manualmente (útil para retry) */
  initialize: () => Promise<void>;
  /** Processa contexto e retorna resultado */
  processContext: (context: Partial<UserContext>) => Promise<ProcessingResult | null>;
  /** Processa input de texto natural */
  processNaturalInput: (input: string) => Promise<Suggestion[]>;
  /** Atualiza sugestões manualmente */
  refreshSuggestions: () => void;
}

// ============================================================================
// Context
// ============================================================================

export const ModeDeusContext = createContext<ModeDeusContextValue | null>(null);
