/**
 * @fileoverview ModeDeusProvider - Provider que inicializa e gerencia o Modo Deus
 *
 * Este provider é responsável por:
 * - Inicializar todos os engines do Modo Deus na ordem correta
 * - Fornecer contexto global para os componentes filhos
 * - Gerenciar o ciclo de vida do sistema de IA
 * - Rastrear navegação e interações do usuário
 *
 * @module azuria_ai/providers/ModeDeusProvider
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '@/domains/auth';
import {
  type EngineStatusValue,
  getEngineStatuses,
  getModeDeusConfig,
  handleNavigation,
  handleUserInput,
  initModeDeus,
  isInitialized,
  type OrchestratorConfig,
  process,
  type ProcessingResult,
  shutdownModeDeus,
} from '../core/modeDeusOrchestrator';
import type { Suggestion, UserContext } from '../types/operational';
import { on, unsubscribeFromEvent } from '../core/eventBus';
import { getUserContext } from '../engines/userContextEngine';

// ============================================================================
// Types
// ============================================================================

interface ModeDeusState {
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

interface ModeDeusContextValue extends ModeDeusState {
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

const ModeDeusContext = createContext<ModeDeusContextValue | null>(null);

// ============================================================================
// Hooks
// ============================================================================

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

// ============================================================================
// Provider
// ============================================================================

interface ModeDeusProviderProps {
  children: React.ReactNode;
  /** Se deve inicializar automaticamente */
  autoInitialize?: boolean;
  /** Configuração customizada */
  config?: Partial<OrchestratorConfig>;
}

export const ModeDeusProvider: React.FC<ModeDeusProviderProps> = ({
  children,
  autoInitialize = true,
  config: customConfig,
}) => {
  // ==========================================================================
  // State
  // ==========================================================================

  const [state, setState] = useState<ModeDeusState>({
    initialized: false,
    loading: false,
    error: null,
    engineStatuses: {},
    lastResult: null,
    config: null,
  });

  // ==========================================================================
  // Hooks externos
  // ==========================================================================

  const { user } = useAuthContext();
  const location = useLocation();
  const previousPath = useRef<string | null>(null);

  // ==========================================================================
  // Inicialização
  // ==========================================================================

  const initialize = useCallback(async () => {
    if (isInitialized()) {
      setState((prev) => ({
        ...prev,
        initialized: true,
        loading: false,
        engineStatuses: getEngineStatuses(),
        config: getModeDeusConfig(),
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await initModeDeus(user?.id, customConfig);

      setState((prev) => ({
        ...prev,
        initialized: true,
        loading: false,
        error: null,
        engineStatuses: getEngineStatuses(),
        config: getModeDeusConfig(),
      }));

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[ModeDeusProvider] ✅ Sistema inicializado com sucesso');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao inicializar Modo Deus';

      setState((prev) => ({
        ...prev,
        initialized: false,
        loading: false,
        error: errorMessage,
      }));

      // eslint-disable-next-line no-console
      console.error('[ModeDeusProvider] ❌ Erro na inicialização:', err);
    }
  }, [user?.id, customConfig]);

  // Auto-inicialização
  useEffect(() => {
    if (autoInitialize && !state.initialized && !state.loading) {
      initialize();
    }

    // Cleanup no unmount
    return () => {
      if (state.initialized) {
        shutdownModeDeus();
      }
    };
  }, [autoInitialize, initialize, state.initialized, state.loading]);

  // ==========================================================================
  // Rastreamento de navegação
  // ==========================================================================

  useEffect(() => {
    if (!state.initialized) {
      return;
    }

    const currentPath = location.pathname;

    if (previousPath.current && previousPath.current !== currentPath) {
      handleNavigation(previousPath.current, currentPath);
    }

    previousPath.current = currentPath;
  }, [location.pathname, state.initialized]);

  // ==========================================================================
  // Subscription para eventos de sugestão via eventBus
  // ==========================================================================

  useEffect(() => {
    if (!state.initialized) {
      return;
    }

    const subscriptionIds: string[] = [];

    const handleInsight = (event: { payload?: { suggestion?: Suggestion } }) => {
      if (event.payload?.suggestion) {
        setState((prev) => {
          const suggestion = event.payload?.suggestion;
          if (!suggestion) {
            return prev;
          }

          const currentSuggestions = prev.lastResult?.suggestions ?? [];
          const exists = currentSuggestions.some((s) => s.id === suggestion.id);

          if (exists) {
            return prev;
          }

          return {
            ...prev,
            lastResult: prev.lastResult
              ? {
                  ...prev.lastResult,
                  suggestions: [...currentSuggestions, suggestion].slice(-10),
                }
              : {
                  suggestions: [suggestion],
                  predictions: [],
                  insights: [],
                  shouldShowAssistance: true,
                },
          };
        });
      }
    };

    subscriptionIds.push(on('insight:generated', handleInsight));
    subscriptionIds.push(on('ai:recommended-action', handleInsight));

    return () => {
      subscriptionIds.forEach((id) => unsubscribeFromEvent(id));
    };
  }, [state.initialized]);

  // ==========================================================================
  // Handlers
  // ==========================================================================

  const processContext = useCallback(
    async (context: Partial<UserContext>): Promise<ProcessingResult | null> => {
      if (!state.initialized) {
        return null;
      }

      const userContext = getUserContext();
      const fullContext = userContext ?? {
        userId: user?.id ?? 'anonymous',
        sessionId: `session_${Date.now()}`,
        currentPage: location.pathname,
        previousPage: previousPath.current ?? undefined,
        sessionStartTime: Date.now(),
        interactionCount: 0,
        skillLevel: 'intermediate' as const,
        preferences: {},
        recentActions: [],
        formState: {},
      };

      const result = await process({
        ...fullContext,
        ...context,
      });

      setState((prev) => ({
        ...prev,
        lastResult: result,
      }));

      return result;
    },
    [state.initialized, user?.id, location.pathname]
  );

  const processNaturalInput = useCallback(
    async (input: string): Promise<Suggestion[]> => {
      if (!state.initialized) {
        return [];
      }

      const suggestions = await handleUserInput(input);

      setState((prev) => ({
        ...prev,
        lastResult: prev.lastResult
          ? {
              ...prev.lastResult,
              suggestions: [...prev.lastResult.suggestions, ...suggestions].slice(-10),
            }
          : {
              suggestions,
              predictions: [],
              insights: [],
              shouldShowAssistance: suggestions.length > 0,
            },
      }));

      return suggestions;
    },
    [state.initialized]
  );

  const refreshSuggestions = useCallback(() => {
    if (!state.initialized) {
      return;
    }

    const userContext = getUserContext();

    if (userContext) {
      process(userContext).then((result) => {
        setState((prev) => ({ ...prev, lastResult: result }));
      });
    }
  }, [state.initialized]);

  // ==========================================================================
  // Value memoizado
  // ==========================================================================

  const value = useMemo<ModeDeusContextValue>(
    () => ({
      ...state,
      initialize,
      processContext,
      processNaturalInput,
      refreshSuggestions,
    }),
    [state, initialize, processContext, processNaturalInput, refreshSuggestions]
  );

  return (
    <ModeDeusContext.Provider value={value}>
      {children}
    </ModeDeusContext.Provider>
  );
};

export default ModeDeusProvider;
