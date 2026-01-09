/**
 * ══════════════════════════════════════════════════════════════════════════════
 * CONSCIOUSNESS PROVIDER - Provider React para CentralNucleus
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este provider usa o CentralNucleus como único ponto de entrada,
 * substituindo a inicialização direta do ConsciousnessCore.
 * 
 * Hierarquia:
 * CentralNucleus → ConsciousnessCore → (ModeDeusDelegate, AIDelegate)
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

// Central Nucleus (ÚNICO PONTO DE ENTRADA)
import {
  initNucleus,
  shutdownNucleus,
} from './CentralNucleus';

// Core (usado internamente pelo Nucleus)
import {
  ConsciousnessCore,
  onOutput,
  provideFeedback,
  sendEvent,
  updateContext,
} from './ConsciousnessCore';

// State
import {
  getGlobalState,
  type GlobalStateShape,
  subscribeToState,
} from './GlobalState';

// AI Router
import { initAIRouter } from './AIRouter';

// Gemini Integration
import { initGemini } from './ai/GeminiIntegration';


// Event Bridge
import { initEventBridge, onUIOutput, stopEventBridge } from './EventBridge';

// Engine Adapter
import { initEngineAdapters, stopAllAgents } from './EngineAdapter';

// Context Rules
import { registerAllContextRules } from './rules';

// EventBus original (para integração)
import { eventBus } from '../core/eventBus';

// Legacy engines (para inicialização em background)
import ragEngine from '../engines/ragEngine';
import multimodalEngine from '../engines/multimodalEngine';
import whatIfSimulator from '../engines/whatIfSimulator';
import xaiEngine from '../engines/xaiEngine';
import portalMonitorAgent from '../agents/portalMonitorAgent';
import priceMonitoringAgent from '../engines/priceMonitoringAgent';
import invoiceOCREngine from '../engines/invoiceOCREngine';
import dynamicPricingEngine from '../engines/dynamicPricingEngine';

// Types
import type { CognitiveRole, OutputMessage, SubscriptionTier } from './types';
import type { Suggestion, UserContext } from '../types/operational';
import type { ProcessingResult as LegacyProcessingResult } from '../core/modeDeusOrchestrator';

// Admin config
import { isValidAdminUID } from '../core/adminConfig';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DO CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════════

/** Estado legado compatível com ModeDeusContext */
export interface ModeDeusLegacyState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  engineStatuses: Record<string, unknown>;
  lastResult: LegacyProcessingResult | null;
  config: unknown;
}

/** Valor do contexto - compatível com API antiga + nova */
export interface ConsciousnessContextValue extends ModeDeusLegacyState {
  // === API Nova ===
  activeMessages: OutputMessage[];
  userRole: CognitiveRole;
  userTier: SubscriptionTier;
  currentScreen: string;
  silenced: boolean;
  
  // Ações novas
  send: (type: string, payload?: Record<string, unknown>) => void;
  dismiss: (messageId: string) => void;
  accept: (messageId: string) => void;
  requestSilence: (durationMs?: number) => void;
  disableSilence: () => void;
  clearMessages: () => void;
  getFullState: () => GlobalStateShape;
  
  // === API Legada (compatibilidade) ===
  initialize: () => Promise<void>;
  processContext: (context: Partial<UserContext>) => Promise<LegacyProcessingResult | null>;
  processNaturalInput: (input: string) => Promise<Suggestion[]>;
  refreshSuggestions: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════════

const ConsciousnessContext = createContext<ConsciousnessContextValue | null>(null);

// ═══════════════════════════════════════════════════════════════════════════════
// PROPS DO PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

interface ConsciousnessProviderProps {
  children: React.ReactNode;
  /** Se deve auto-inicializar (compatível com ModeDeusProvider) */
  autoInitialize?: boolean;
  /** Configuração customizada */
  config?: {
    geminiApiKey?: string;
    debug?: boolean;
    maxActiveMessages?: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════

export const ConsciousnessProvider: React.FC<ConsciousnessProviderProps> = ({
  children,
  autoInitialize = true,
  config,
}) => {
  // Hooks externos
  const { user } = useAuthContext();
  const location = useLocation();
  
  // Estado legado (compatibilidade)
  const [legacyState, setLegacyState] = useState<ModeDeusLegacyState>({
    initialized: false,
    loading: false,
    error: null,
    engineStatuses: {},
    lastResult: null,
    config: null,
  });
  
  // Estado novo
  const [activeMessages, setActiveMessages] = useState<OutputMessage[]>([]);
  const [userRole, setUserRole] = useState<CognitiveRole>('USER');
  const [userTier, setUserTier] = useState<SubscriptionTier>('FREE');
  const [currentScreen, setCurrentScreen] = useState('/');
  const [silenced, setSilenced] = useState(false);
  
  // Refs
  const previousPath = useRef<string>(location.pathname);
  const maxMessages = useRef(config?.maxActiveMessages ?? 5);
  const initializationStarted = useRef(false);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DETERMINAR PAPEL E TIER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const determineRole = useCallback((): CognitiveRole => {
    if (!user?.id) {return 'USER';}
    return isValidAdminUID(user.id) ? 'ADMIN' : 'USER';
  }, [user?.id]);
  
  const determineTier = useCallback((): SubscriptionTier => {
    const subscription = user?.user_metadata?.subscription;
    if (subscription === 'enterprise' || subscription === 'Enterprise') {return 'ENTERPRISE';}
    if (subscription === 'pro' || subscription === 'PRO') {return 'PRO';}
    return 'FREE';
  }, [user?.user_metadata?.subscription]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO DE ENGINES LEGADOS (background)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const initializeSecondaryEngines = useCallback(async () => {
    const isPremiumUser = userTier === 'PRO' || userTier === 'ENTERPRISE';
    
    // Priorizar Edge Functions (seguro - API key no Supabase)
    // Fallback para API direta apenas em desenvolvimento local
    const useEdgeFunctions = true; // Sempre usar Edge Functions (recomendado)
    const geminiApiKey = import.meta.env.DEV 
      ? (config?.geminiApiKey ?? import.meta.env.VITE_GEMINI_API_KEY)
      : undefined;
    
    // Inicializar engines em paralelo
    const enginePromises = [
      Promise.resolve().then(() => ragEngine.initRAGEngine()),
      Promise.resolve().then(() => multimodalEngine.initMultimodalEngine()),
      Promise.resolve().then(() => whatIfSimulator.initWhatIfSimulator()),
      Promise.resolve().then(() => xaiEngine.initXAIEngine()),
      Promise.resolve().then(() => priceMonitoringAgent.initPriceMonitoring(geminiApiKey, useEdgeFunctions)),
      Promise.resolve().then(() => invoiceOCREngine.initInvoiceOCR(geminiApiKey, useEdgeFunctions)),
      Promise.resolve().then(() => dynamicPricingEngine.initDynamicPricing(geminiApiKey, useEdgeFunctions)),
    ];

    await Promise.allSettled(enginePromises);

    // Iniciar monitoramentos para PRO/Enterprise
    if (isPremiumUser) {
      setTimeout(() => {
        priceMonitoringAgent.startMonitoring({
          intervalMinutes: 60,
          userId: user?.id,
        });

        portalMonitorAgent.startPortalMonitor({
          interval: 5 * 60 * 1000,
          autoAnalyze: true,
          autoAlert: true,
        });

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('[ConsciousnessProvider] 🤖 Monitoramentos PRO/Enterprise iniciados');
        }
      }, 100);
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[ConsciousnessProvider] 🚀 Engines secundários inicializados');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userTier]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Helper para obter max insights baseado no tier
  const getMaxInsights = (tier: string): number => {
    if (tier === 'FREE') {return 3;}
    if (tier === 'PRO') {return 5;}
    return 10;
  };

  // Helper para inicializar Gemini
  const initializeGemini = useCallback(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL 
      || import.meta.env.VITE_SUPABASE_CLOUD_URL
      || 'https://crpzkppsriranmeumfqs.supabase.co';
    
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      || import.meta.env.VITE_SUPABASE_CLOUD_ANON_KEY
      || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
      || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM';

    if (supabaseUrl && supabaseAnonKey) {
      return initGemini({ supabaseUrl, supabaseAnonKey, edgeFunctionName: 'azuria-chat' });
    }
    
    // Fallback: API direta
    const geminiApiKey = config?.geminiApiKey ?? import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiApiKey) {
      initGemini({ apiKey: geminiApiKey });
      return true;
    }
    return false;
  }, [config?.geminiApiKey]);

  const initialize = useCallback(async () => {
    if (legacyState.initialized || legacyState.loading || initializationStarted.current) {
      return;
    }
    
    initializationStarted.current = true;
    setLegacyState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const role = determineRole();
      const tier = determineTier();
      
      // 1. INICIALIZAR CENTRAL NUCLEUS (único ponto de entrada)
      // O Nucleus inicializa ConsciousnessCore + Delegados internamente
      const nucleusResult = await initNucleus({
        userId: user?.id ?? undefined,
        role,
        tier,
        config: {
          enabled: true,
          debug: config?.debug ?? import.meta.env.DEV,
          rateLimit: {
            maxUserInsightsPerMinute: getMaxInsights(tier),
            maxAdminInsightsPerMinute: 10,
            dismissCooldown: 30000,
          },
          silence: {
            defaultTopicBlockDuration: 300000,
            typingSilenceDuration: 5000,
            errorSilenceDuration: 10000,
          },
          memory: {
            maxMessageHistory: 100,
            recentMessageWindow: 300000,
            semanticHashTTL: 600000,
          },
          ai: {
            useAI: true,
            preferredModel: 'gemini',
            aiTimeout: 10000,
          },
        },
        delegates: {
          modeDeus: true, // Habilitar delegado operacional
          ai: true,       // Habilitar delegado cognitivo
        },
        debug: config?.debug ?? import.meta.env.DEV,
      });
      
      if (!nucleusResult.success) {
        // eslint-disable-next-line no-console
        console.warn('[ConsciousnessProvider] Nucleus init warnings:', nucleusResult.errors);
      }
      
      // 2. Inicializar Gemini via Supabase Edge Function (recomendado)
      initializeGemini();
      
      // 3. Inicializar AIRouter (após Gemini estar inicializado)
      initAIRouter({
        geminiApiKey: config?.geminiApiKey ?? import.meta.env.VITE_GEMINI_API_KEY,
      });
      
      // 4. Inicializar EventBridge
      // Criar adapter para compatibilidade de tipos
      initEventBridge({
        emit: (type: string, payload: unknown, options?: unknown) => {
          eventBus.emit(type as Parameters<typeof eventBus.emit>[0], payload, options as Parameters<typeof eventBus.emit>[2]);
        },
        on: (type: string, handler: (event: unknown) => void) => {
          const subscriptionId = eventBus.on(type as Parameters<typeof eventBus.on>[0], handler as Parameters<typeof eventBus.on>[1]);
          return () => eventBus.off(subscriptionId);
        },
      });
      
      // 5. Inicializar adaptadores de engines
      await initEngineAdapters();
      
      // 5. Registrar regras de contexto
      registerAllContextRules();
      
      // 6. Atualizar estado
      setUserRole(role);
      setUserTier(tier);
      setCurrentScreen(location.pathname);
      
      setLegacyState(prev => ({
        ...prev,
        initialized: true,
        loading: false,
        error: null,
        engineStatuses: { consciousnessCore: 'active' },
        config: { role, tier },
      }));
      
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[ConsciousnessProvider] ✅ ConsciousnessCore inicializado', { role, tier });
      }
      
      // 6. Inicializar engines secundários em background
      const hasIdleCallback = 'requestIdleCallback' in globalThis;
      const scheduleBackgroundInit = hasIdleCallback
        ? requestIdleCallback 
        : (cb: () => void) => setTimeout(cb, 1);

      scheduleBackgroundInit(() => {
        initializeSecondaryEngines().catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[ConsciousnessProvider] ⚠️ Erro engines secundários:', err);
        });
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao inicializar';
      setLegacyState(prev => ({
        ...prev,
        initialized: false,
        loading: false,
        error: errorMessage,
      }));
      initializationStarted.current = false;
      // eslint-disable-next-line no-console
      console.error('[ConsciousnessProvider] ❌ Erro:', err);
    }
  }, [
    legacyState.initialized, 
    legacyState.loading, 
    determineRole, 
    determineTier, 
    user?.id, 
    config, 
    location.pathname,
    initializeSecondaryEngines,
    initializeGemini,
  ]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HANDLERS DE MENSAGENS
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleOutput = useCallback((message: OutputMessage) => {
    // Filtrar mensagens de navegação que não devem ser exibidas
    const isNavigationMessage = 
      message.message.includes('navigation: user:navigation') ||
      message.title.includes('navigation: user:navigation') ||
      message.context.eventId?.includes('user:navigation');
    
    // Não adicionar mensagens de navegação ao estado
    if (isNavigationMessage) {
      return;
    }
    
    setActiveMessages(prev => {
      // Verificar se a mensagem já existe para evitar duplicatas
      if (prev.some(m => m.id === message.id)) {
        return prev;
      }
      
      const newMessages = [message, ...prev];
      if (newMessages.length > maxMessages.current) {
        newMessages.pop();
      }
      return newMessages;
    });
    
    // Helper para converter severity para priority
    const getPriority = (sev: string): Suggestion['priority'] => {
      if (sev === 'critical') {return 'critical';}
      if (sev === 'high') {return 'high';}
      if (sev === 'medium') {return 'medium';}
      return 'low';
    };
    
    // Helper para calcular confidence
    const getConfidence = (sev: string): number => {
      if (sev === 'critical') {return 0.9;}
      if (sev === 'high') {return 0.7;}
      return 0.5;
    };
    
    // Atualizar estado legado também
    setLegacyState(prev => {
      const suggestion: Suggestion = {
        id: message.id,
        type: message.type as Suggestion['type'],
        category: 'general' as Suggestion['category'],
        title: message.title,
        message: message.message,
        priority: getPriority(message.severity),
        context: { screen: message.context.screen },
        metadata: {
          createdAt: message.context.timestamp,
          source: 'consciousness-core',
          confidence: getConfidence(message.severity),
        },
        status: 'pending' as Suggestion['status'],
      };
      
      const currentSuggestions = prev.lastResult?.suggestions ?? [];
      
      return {
        ...prev,
        lastResult: {
          suggestions: [...currentSuggestions, suggestion].slice(-10),
          predictions: prev.lastResult?.predictions ?? [],
          insights: prev.lastResult?.insights ?? [],
          shouldShowAssistance: true,
        },
      };
    });
  }, []);
  
  const removeMessage = useCallback((messageId: string) => {
    setActiveMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AÇÕES PÚBLICAS (NOVAS)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const send = useCallback((type: string, payload?: Record<string, unknown>) => {
    if (!legacyState.initialized) {return;}
    
    sendEvent({
      type,
      payload,
      timestamp: Date.now(),
      source: 'user_action',
    });
  }, [legacyState.initialized]);
  
  const dismiss = useCallback((messageId: string) => {
    const message = activeMessages.find(m => m.id === messageId);
    if (message) {
      provideFeedback(message.semanticHash, message.context.screen, 'dismissed');
      removeMessage(messageId);
    }
  }, [activeMessages, removeMessage]);
  
  const accept = useCallback((messageId: string) => {
    const message = activeMessages.find(m => m.id === messageId);
    if (message) {
      provideFeedback(message.semanticHash, message.context.screen, 'accepted');
      removeMessage(messageId);
    }
  }, [activeMessages, removeMessage]);
  
  const requestSilenceMode = useCallback((durationMs: number = 300000) => {
    ConsciousnessCore.requestSilence(durationMs);
    setSilenced(true);
    setTimeout(() => setSilenced(false), durationMs);
  }, []);
  
  const disableSilenceMode = useCallback(() => {
    ConsciousnessCore.disableSilence();
    setSilenced(false);
  }, []);
  
  const clearMessages = useCallback(() => {
    setActiveMessages([]);
  }, []);
  
  const getFullState = useCallback(() => {
    return getGlobalState();
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AÇÕES LEGADAS (COMPATIBILIDADE)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const processContext = useCallback(async (
    context: Partial<UserContext>
  ): Promise<LegacyProcessingResult | null> => {
    if (!legacyState.initialized) {return null;}
    
    // Enviar evento de contexto
    sendEvent({
      type: 'user:context-update',
      payload: context as Record<string, unknown>,
      timestamp: Date.now(),
      source: 'processContext',
    });
    
    return legacyState.lastResult;
  }, [legacyState.initialized, legacyState.lastResult]);
  
  const processNaturalInput = useCallback(async (input: string): Promise<Suggestion[]> => {
    if (!legacyState.initialized) {return [];}
    
    sendEvent({
      type: 'user:input',
      payload: { text: input },
      timestamp: Date.now(),
      source: 'naturalInput',
    });
    
    return legacyState.lastResult?.suggestions ?? [];
  }, [legacyState.initialized, legacyState.lastResult?.suggestions]);
  
  const refreshSuggestions = useCallback(() => {
    if (!legacyState.initialized) {return;}
    
    sendEvent({
      type: 'user:refresh-suggestions',
      payload: {},
      timestamp: Date.now(),
      source: 'refreshSuggestions',
    });
  }, [legacyState.initialized]);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EFEITOS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Auto-inicialização
  useEffect(() => {
    if (autoInitialize && !legacyState.initialized && !legacyState.loading) {
      initialize();
    }
  }, [autoInitialize, legacyState.initialized, legacyState.loading, initialize]);
  
  // Registrar listeners
  useEffect(() => {
    if (!legacyState.initialized) {return;}
    
    const unsubOutput = onOutput(handleOutput);
    const unsubUIOutput = onUIOutput(handleOutput);
    
    const unsubState = subscribeToState((state, changedKeys) => {
      if (changedKeys.includes('currentMoment') || changedKeys.includes('*')) {
        setCurrentScreen(state.currentMoment.screen);
        setSilenced(
          state.currentMoment.silenceRequested || 
          (state.currentMoment.silenceUntil !== null && 
           Date.now() < state.currentMoment.silenceUntil)
        );
      }
      if (changedKeys.includes('identity') || changedKeys.includes('*')) {
        setUserRole(state.identity.role);
        setUserTier(state.identity.tier);
      }
    });
    
    return () => {
      unsubOutput();
      unsubUIOutput();
      unsubState();
    };
  }, [legacyState.initialized, handleOutput]);
  
  // Rastrear navegação
  useEffect(() => {
    if (!legacyState.initialized) {return;}
    
    const currentPath = location.pathname;
    if (currentPath !== previousPath.current) {
      updateContext({ screen: currentPath });
      
      sendEvent({
        type: 'user:navigation',
        payload: {
          from: previousPath.current,
          to: currentPath,
        },
        timestamp: Date.now(),
        source: 'router',
      });
      
      previousPath.current = currentPath;
    }
  }, [location.pathname, legacyState.initialized]);
  
  // Auto-expirar mensagens
  useEffect(() => {
    if (activeMessages.length === 0) {return;}
    
    const filterExpiredMessages = (msg: typeof activeMessages[0]) => {
      const now = Date.now();
      const expiresAt = msg.context.timestamp + msg.ttl;
      if (now >= expiresAt) {
        provideFeedback(msg.semanticHash, msg.context.screen, 'ignored');
        return false;
      }
      return true;
    };
    
    const checkExpiry = () => {
      setActiveMessages(prev => prev.filter(filterExpiredMessages));
    };
    
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [activeMessages.length]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (legacyState.initialized) {
        try {
          portalMonitorAgent.stopPortalMonitor();
          priceMonitoringAgent.stopMonitoring();
        } catch {
          // Ignorar erros de cleanup
        }
        stopAllAgents();
        stopEventBridge(eventBus);
        // Desligar CentralNucleus (que desliga ConsciousnessCore internamente)
        shutdownNucleus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // VALOR DO CONTEXTO
  // ═══════════════════════════════════════════════════════════════════════════
  
  const contextValue = useMemo<ConsciousnessContextValue>(() => ({
    // Estado legado
    ...legacyState,
    
    // Estado novo
    activeMessages,
    userRole,
    userTier,
    currentScreen,
    silenced,
    
    // Ações novas
    send,
    dismiss,
    accept,
    requestSilence: requestSilenceMode,
    disableSilence: disableSilenceMode,
    clearMessages,
    getFullState,
    
    // Ações legadas
    initialize,
    processContext,
    processNaturalInput,
    refreshSuggestions,
  }), [
    legacyState,
    activeMessages,
    userRole,
    userTier,
    currentScreen,
    silenced,
    send,
    dismiss,
    accept,
    requestSilenceMode,
    disableSilenceMode,
    clearMessages,
    getFullState,
    initialize,
    processContext,
    processNaturalInput,
    refreshSuggestions,
  ]);
  
  return (
    <ConsciousnessContext.Provider value={contextValue}>
      {children}
    </ConsciousnessContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para acessar o ConsciousnessContext (API nova)
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useConsciousnessContext(): ConsciousnessContextValue {
  const context = useContext(ConsciousnessContext);
  
  if (!context) {
    throw new Error(
      'useConsciousnessContext must be used within a ConsciousnessProvider'
    );
  }
  
  return context;
}

/**
 * Hook compatível com useModeDeus (API legada)
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useModeDeus(): ConsciousnessContextValue {
  return useConsciousnessContext();
}

/**
 * Hook opcional (não lança erro se não estiver no provider)
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useModeDeusOptional(): ConsciousnessContextValue | null {
  return useContext(ConsciousnessContext);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RE-EXPORT DO CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════════

export { ConsciousnessContext };

// Alias para compatibilidade
export { ConsciousnessContext as ModeDeusContext };

export default ConsciousnessProvider;
