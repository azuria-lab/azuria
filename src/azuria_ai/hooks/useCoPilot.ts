/**
 * @fileoverview useCoPilot Hook - Interface React para o Co-Piloto
 *
 * Hook que conecta componentes React ao sistema Co-Piloto operacional.
 * Gerencia estado de sugestões, feedback e configurações.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     suggestions, 
 *     accept, 
 *     dismiss, 
 *     isEnabled 
 *   } = useCoPilot();
 *
 *   return (
 *     <div>
 *       {suggestions.map(s => (
 *         <SuggestionCard 
 *           key={s.id} 
 *           suggestion={s}
 *           onAccept={() => accept(s.id)}
 *           onDismiss={() => dismiss(s.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @module azuria_ai/hooks/useCoPilot
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { on, unsubscribeFromEvent } from '../core/eventBus';
import type {
  CoPilotConfig,
  CoPilotState,
  CreateSuggestionInput,
  FeedbackType,
  Suggestion,
  UserContext,
} from '../types/operational';
import {
  acceptSuggestion,
  addSuggestion,
  dismissSuggestion,
  getCoPilotState,
  initOperationalEngine,
  recordFeedback,
  resetState,
  setEnabled,
  updateConfig,
  updateUserContext,
} from '../engines/operationalAIEngine';

// ============================================================================
// Types
// ============================================================================

export interface UseCoPilotOptions {
  /** Inicializar automaticamente o engine se não estiver */
  autoInit?: boolean;
  /** Configuração inicial */
  initialConfig?: Partial<CoPilotConfig>;
  /** Contexto inicial do usuário */
  initialContext?: Partial<UserContext>;
}

export interface UseCoPilotReturn {
  /** Lista de sugestões ativas */
  suggestions: Suggestion[];
  /** Sugestão em destaque (primeira da lista) */
  activeSuggestion: Suggestion | null;
  /** Se o Co-Piloto está habilitado */
  isEnabled: boolean;
  /** Se está inicializado */
  isReady: boolean;
  /** Se está carregando algo */
  isLoading: boolean;
  /** Configuração atual */
  config: CoPilotConfig;
  /** Contexto do usuário */
  userContext: UserContext | null;
  /** Contagem de sugestões pendentes */
  pendingCount: number;
  /** Total de sugestões mostradas na sessão */
  totalShown: number;

  // Ações
  /** Aceita uma sugestão */
  accept: (suggestionId: string, actionId?: string) => void;
  /** Dispensa uma sugestão */
  dismiss: (suggestionId: string) => void;
  /** Envia feedback sobre uma sugestão */
  sendFeedback: (
    suggestionId: string,
    type: FeedbackType,
    comment?: string
  ) => void;
  /** Adiciona uma sugestão manualmente */
  addManualSuggestion: (input: CreateSuggestionInput) => string;
  /** Atualiza contexto do usuário */
  updateContext: (context: Partial<UserContext>) => void;
  /** Habilita/desabilita Co-Piloto */
  toggle: (enabled?: boolean) => void;
  /** Atualiza configuração */
  configure: (config: Partial<CoPilotConfig>) => void;
  /** Reseta estado do Co-Piloto */
  reset: () => void;
}

// ============================================================================
// Default State
// ============================================================================

const DEFAULT_STATE: CoPilotState = {
  isOpen: false,
  isLoading: false,
  suggestions: [],
  activeSuggestion: null,
  userContext: null,
  config: {
    enabled: true,
    maxVisibleSuggestions: 3,
    minSuggestionInterval: 20000,
    showProactiveSuggestions: true,
    explanationLevel: 'brief',
    soundEnabled: false,
    position: 'bottom-right',
  },
  lastUpdatedAt: Date.now(),
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useCoPilot(options: UseCoPilotOptions = {}): UseCoPilotReturn {
  const { autoInit = true, initialConfig, initialContext } = options;

  // Estado local sincronizado com o engine
  const [state, setState] = useState<CoPilotState>(DEFAULT_STATE);
  const [isReady, setIsReady] = useState(false);

  // Sincronizar estado com o engine
  const syncState = useCallback(() => {
    const engineState = getCoPilotState();
    setState((prev) => ({
      ...prev,
      suggestions: engineState.activeSuggestions,
      activeSuggestion: engineState.activeSuggestions[0] || null,
      userContext: engineState.userContext,
      config: engineState.config,
      isLoading: false,
      lastUpdatedAt: Date.now(),
    }));
  }, []);

  // Inicialização
  useEffect(() => {
    if (autoInit) {
      const engineState = getCoPilotState();
      if (!engineState.initialized) {
        initOperationalEngine(initialConfig);
      }

      if (initialContext) {
        updateUserContext(initialContext);
      }

      setIsReady(true);
      syncState();
    }
  }, [autoInit, initialConfig, initialContext, syncState]);

  // Escutar eventos do Co-Piloto
  useEffect(() => {
    const subscriptionIds: string[] = [];

    // Sugestão mostrada
    subscriptionIds.push(
      on('user:suggestion', () => {
        syncState();
      })
    );

    // Sugestão aceita
    subscriptionIds.push(
      on('user:suggestion-accepted', () => {
        syncState();
      })
    );

    // Sugestão dispensada
    subscriptionIds.push(
      on('user:suggestion-dismissed', () => {
        syncState();
      })
    );

    // Sugestão expirada
    subscriptionIds.push(
      on('user:suggestion-expired', () => {
        syncState();
      })
    );

    // Contexto atualizado
    subscriptionIds.push(
      on('user:context-updated', () => {
        syncState();
      })
    );

    // Config alterada
    subscriptionIds.push(
      on('user:config-changed', () => {
        syncState();
      })
    );

    // Co-Piloto habilitado/desabilitado
    subscriptionIds.push(
      on('user:copilot-enabled', () => {
        syncState();
      })
    );

    subscriptionIds.push(
      on('user:copilot-disabled', () => {
        syncState();
      })
    );

    return () => {
      subscriptionIds.forEach((id) => unsubscribeFromEvent(id));
    };
  }, [syncState]);

  // Ações
  const accept = useCallback((suggestionId: string, actionId?: string) => {
    acceptSuggestion(suggestionId, actionId);
  }, []);

  const dismiss = useCallback((suggestionId: string) => {
    dismissSuggestion(suggestionId);
  }, []);

  const sendFeedback = useCallback(
    (suggestionId: string, type: FeedbackType, comment?: string) => {
      recordFeedback(suggestionId, {
        type,
        comment,
        context: state.userContext
          ? {
              screen: state.userContext.currentScreen,
              timeSinceShown: 0,
            }
          : undefined,
      });
    },
    [state.userContext]
  );

  const addManualSuggestion = useCallback((input: CreateSuggestionInput) => {
    return addSuggestion(input);
  }, []);

  const updateContext = useCallback((context: Partial<UserContext>) => {
    updateUserContext(context);
  }, []);

  const toggle = useCallback((enabled?: boolean) => {
    const newEnabled = enabled ?? !getCoPilotState().enabled;
    setEnabled(newEnabled);
  }, []);

  const configure = useCallback((config: Partial<CoPilotConfig>) => {
    updateConfig(config);
  }, []);

  const reset = useCallback(() => {
    resetState();
    syncState();
  }, [syncState]);

  // Valores computados
  const pendingCount = useMemo(() => {
    return getCoPilotState().pendingCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.suggestions.length]);

  const totalShown = useMemo(() => {
    return getCoPilotState().totalShown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.suggestions.length]);

  return {
    suggestions: state.suggestions,
    activeSuggestion: state.activeSuggestion,
    isEnabled: state.config.enabled,
    isReady,
    isLoading: state.isLoading,
    config: state.config,
    userContext: state.userContext,
    pendingCount,
    totalShown,

    accept,
    dismiss,
    sendFeedback,
    addManualSuggestion,
    updateContext,
    toggle,
    configure,
    reset,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * Hook para apenas ler sugestões (sem ações)
 */
export function useCoPilotSuggestions() {
  const { suggestions, activeSuggestion, isEnabled } = useCoPilot({
    autoInit: false,
  });
  return { suggestions, activeSuggestion, isEnabled };
}

/**
 * Hook para reportar contexto do usuário
 */
export function useCoPilotContext() {
  const { updateContext, userContext } = useCoPilot({ autoInit: false });
  return { updateContext, userContext };
}

/**
 * Hook para configurar o Co-Piloto
 */
export function useCoPilotConfig() {
  const { config, configure, toggle, isEnabled } = useCoPilot({
    autoInit: false,
  });
  return { config, configure, toggle, isEnabled };
}

// ============================================================================
// Export
// ============================================================================

export default useCoPilot;
