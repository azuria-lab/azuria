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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '@/domains/auth';
import {
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
import ragEngine from '../engines/ragEngine';
import multimodalEngine from '../engines/multimodalEngine';
import whatIfSimulator from '../engines/whatIfSimulator';
import xaiEngine from '../engines/xaiEngine';
import portalMonitorAgent from '../agents/portalMonitorAgent';
import priceMonitoringAgent from '../engines/priceMonitoringAgent';
import invoiceOCREngine from '../engines/invoiceOCREngine';
import dynamicPricingEngine from '../engines/dynamicPricingEngine';
import { ModeDeusContext, type ModeDeusContextValue, type ModeDeusState } from './ModeDeusContext';

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

      // Inicializar novos engines de licitações
      try {
        ragEngine.initRAGEngine();
        multimodalEngine.initMultimodalEngine();
        whatIfSimulator.initWhatIfSimulator();
        xaiEngine.initXAIEngine();

        // Inicializar engines v2.0 (e-commerce/marketplace)
        priceMonitoringAgent.initPriceMonitoring();
        invoiceOCREngine.initInvoiceOCR();
        dynamicPricingEngine.initDynamicPricing();

        // Iniciar monitoramento de preços para usuários PRO/Enterprise
        if (
          user?.user_metadata?.subscription === 'PRO' ||
          user?.user_metadata?.subscription === 'Enterprise'
        ) {
          priceMonitoringAgent.startMonitoring({
            intervalMinutes: 60, // 1 hora
            userId: user?.id,
          });
        }

        // Iniciar monitor de portais apenas para usuários PRO/Enterprise
        if (
          user?.user_metadata?.subscription === 'PRO' ||
          user?.user_metadata?.subscription === 'Enterprise'
        ) {
          portalMonitorAgent.startPortalMonitor({
            interval: 5 * 60 * 1000, // 5 minutos
            autoAnalyze: true,
            autoAlert: true,
          });

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('[ModeDeusProvider] 🤖 Portal Monitor iniciado para usuário PRO/Enterprise');
          }
        }

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[ModeDeusProvider] 🚀 Engines v2.0 (e-commerce) inicializados');
        }
      } catch (engineError) {
        // eslint-disable-next-line no-console
        console.warn('[ModeDeusProvider] ⚠️ Erro ao inicializar engines:', engineError);
        // Não bloqueia a inicialização principal
      }

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
  }, [user?.id, user?.user_metadata?.subscription, customConfig]);

  // Auto-inicialização
  useEffect(() => {
    if (autoInitialize && !state.initialized && !state.loading) {
      initialize();
    }

    // Cleanup no unmount
    return () => {
      if (state.initialized) {
        shutdownModeDeus();
        
        // Desligar engines v2.0
        try {
          portalMonitorAgent.stopPortalMonitor();
          priceMonitoringAgent.stopMonitoring();
          
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('[ModeDeusProvider] 🛑 Engines desligados');
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[ModeDeusProvider] ⚠️ Erro ao desligar engines:', err);
        }
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

    /**
     * Helper to check if suggestion already exists
     */
    const suggestionExists = (suggestions: Suggestion[], id: string): boolean => {
      return suggestions.some((s) => s.id === id);
    };

    /**
     * Helper to create updated state with new suggestion
     */
    const createUpdatedState = (
      prev: ModeDeusState,
      suggestion: Suggestion,
      currentSuggestions: Suggestion[]
    ): ModeDeusState => {
      const newSuggestions = [...currentSuggestions, suggestion].slice(-10);
      
      if (prev.lastResult) {
        return {
          ...prev,
          lastResult: {
            ...prev.lastResult,
            suggestions: newSuggestions,
          },
        };
      }
      
      return {
        ...prev,
        lastResult: {
          suggestions: [suggestion],
          predictions: [],
          insights: [],
          shouldShowAssistance: true,
        },
      };
    };

    const handleInsight = (event: { payload?: { suggestion?: Suggestion } }) => {
      const suggestion = event.payload?.suggestion;
      if (!suggestion) {
        return;
      }

      setState((prev) => {
        const currentSuggestions = prev.lastResult?.suggestions ?? [];
        
        if (suggestionExists(currentSuggestions, suggestion.id)) {
          return prev;
        }

        return createUpdatedState(prev, suggestion, currentSuggestions);
      });
    };

    subscriptionIds.push(
      on('insight:generated', handleInsight),
      on('ai:recommended-action', handleInsight)
    );

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
      
      // Convert UserContext to ProcessingContext for the orchestrator
      const processingContext = {
        screen: context.currentScreen ?? userContext?.currentScreen ?? location.pathname,
        userInput: context.lastActionType ?? userContext?.lastActionType,
        action: context.lastActionType ?? userContext?.lastActionType,
        metadata: {
          userId: context.userId ?? userContext?.userId,
          sessionId: context.sessionId ?? userContext?.sessionId,
          skillLevel: context.skillLevel ?? userContext?.skillLevel,
        },
      };

      const result = await process(processingContext);

      setState((prev) => ({
        ...prev,
        lastResult: result,
      }));

      return result;
    },
    [state.initialized, location.pathname]
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
      // Convert UserContext to ProcessingContext
      const processingContext = {
        screen: userContext.currentScreen ?? '',
        userInput: userContext.lastActionType,
        action: userContext.lastActionType,
        metadata: {
          userId: userContext.userId,
          sessionId: userContext.sessionId,
          skillLevel: userContext.skillLevel,
        },
      };
      
      process(processingContext).then((result) => {
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
