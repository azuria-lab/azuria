/**
 * ══════════════════════════════════════════════════════════════════════════════
 * USE CONSCIOUSNESS - Hook React para ConsciousnessCore
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este hook fornece uma interface React para o ConsciousnessCore.
 * Gerencia estado, lifecycle e fornece funções utilitárias.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  ConsciousnessCore,
  type InitConfig,
  initConsciousness,
  onDecision,
  onOutput,
  type ProcessingResult,
  provideFeedback,
  sendEvent,
  shutdownConsciousness,
  updateContext,
} from './ConsciousnessCore';
import { 
  getGlobalState, 
  type GlobalStateShape,
  subscribeToState,
} from './GlobalState';
import type { CognitiveRole, NormalizedEvent, OutputMessage, SubscriptionTier } from './types';
import type { Decision } from './DecisionEngine';
import type { RawEvent } from './PerceptionGate';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Estado do hook */
export interface ConsciousnessState {
  /** Se está inicializado */
  initialized: boolean;
  /** Se está carregando */
  loading: boolean;
  /** Erro se houver */
  error: string | null;
  /** Mensagens ativas para exibição */
  activeMessages: OutputMessage[];
  /** Estado global (subset relevante para UI) */
  globalState: {
    screen: string;
    userActivity: string;
    silenced: boolean;
    role: CognitiveRole;
    tier: SubscriptionTier;
  };
}

/** Opções do hook */
export interface UseConsciousnessOptions {
  /** ID do usuário */
  userId?: string;
  /** Papel do usuário */
  role?: CognitiveRole;
  /** Nível de assinatura */
  tier?: SubscriptionTier;
  /** Se deve auto-inicializar */
  autoInit?: boolean;
  /** Máximo de mensagens ativas */
  maxActiveMessages?: number;
  /** Callback quando mensagem é recebida */
  onMessage?: (message: OutputMessage) => void;
  /** Callback quando decisão é tomada */
  onDecisionMade?: (event: NormalizedEvent, decision: Decision) => void;
}

/** Retorno do hook */
export interface ConsciousnessHookReturn {
  /** Estado atual */
  state: ConsciousnessState;
  /** Inicializa o núcleo */
  initialize: (config?: InitConfig) => Promise<void>;
  /** Desliga o núcleo */
  shutdown: () => void;
  /** Envia um evento */
  send: (type: string, payload?: Record<string, unknown>) => void;
  /** Dispensa uma mensagem */
  dismiss: (messageId: string) => void;
  /** Aceita uma mensagem/sugestão */
  accept: (messageId: string) => void;
  /** Solicita silêncio */
  requestSilence: (durationMs?: number) => void;
  /** Remove silêncio */
  disableSilence: () => void;
  /** Atualiza contexto */
  setContext: (updates: { screen?: string; activity?: string }) => void;
  /** Limpa todas as mensagens */
  clearMessages: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para usar o ConsciousnessCore em componentes React
 */
export function useConsciousness(
  options: UseConsciousnessOptions = {}
): ConsciousnessHookReturn {
  const {
    userId,
    role = 'USER',
    tier = 'FREE',
    autoInit = true,
    maxActiveMessages = 5,
    onMessage,
    onDecisionMade,
  } = options;

  // Estado
  const [state, setState] = useState<ConsciousnessState>({
    initialized: false,
    loading: false,
    error: null,
    activeMessages: [],
    globalState: {
      screen: '/',
      userActivity: 'idle',
      silenced: false,
      role: 'USER',
      tier: 'FREE',
    },
  });

  // Refs para callbacks
  const onMessageRef = useRef(onMessage);
  const onDecisionRef = useRef(onDecisionMade);
  
  // Atualizar refs quando callbacks mudarem
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  
  useEffect(() => {
    onDecisionRef.current = onDecisionMade;
  }, [onDecisionMade]);

  // Função para adicionar mensagem
  const addMessage = useCallback((message: OutputMessage) => {
    setState(prev => {
      const messages = [message, ...prev.activeMessages];
      
      // Limitar número de mensagens
      if (messages.length > maxActiveMessages) {
        messages.pop();
      }
      
      return {
        ...prev,
        activeMessages: messages,
      };
    });
    
    // Chamar callback se existir
    if (onMessageRef.current) {
      onMessageRef.current(message);
    }
  }, [maxActiveMessages]);

  // Função para remover mensagem
  const removeMessage = useCallback((messageId: string) => {
    setState(prev => ({
      ...prev,
      activeMessages: prev.activeMessages.filter(m => m.id !== messageId),
    }));
  }, []);

  // Sincronizar com estado global
  const syncGlobalState = useCallback(() => {
    const global = getGlobalState();
    setState(prev => ({
      ...prev,
      globalState: {
        screen: global.currentMoment.screen,
        userActivity: global.currentMoment.userActivity,
        silenced: global.currentMoment.silenceRequested || 
          (global.currentMoment.silenceUntil !== null && 
           Date.now() < global.currentMoment.silenceUntil),
        role: global.identity.role,
        tier: global.identity.tier,
      },
    }));
  }, []);

  // Inicialização
  const initialize = useCallback(async (config?: InitConfig) => {
    if (state.initialized) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await initConsciousness({
        userId: config?.userId ?? userId,
        role: config?.role ?? role,
        tier: config?.tier ?? tier,
        ...config,
      });

      setState(prev => ({
        ...prev,
        initialized: true,
        loading: false,
      }));

      syncGlobalState();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      }));
    }
  }, [state.initialized, userId, role, tier, syncGlobalState]);

  // Shutdown
  const shutdown = useCallback(() => {
    shutdownConsciousness();
    setState(prev => ({
      ...prev,
      initialized: false,
      activeMessages: [],
    }));
  }, []);

  // Enviar evento
  const send = useCallback((type: string, payload?: Record<string, unknown>) => {
    if (!state.initialized) {
      console.warn('[useConsciousness] Not initialized');
      return;
    }

    const event: RawEvent = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'user_action',
    };

    sendEvent(event);
  }, [state.initialized]);

  // Dispensar mensagem
  const dismiss = useCallback((messageId: string) => {
    const message = state.activeMessages.find(m => m.id === messageId);
    if (message) {
      provideFeedback(message.semanticHash, message.context.screen, 'dismissed');
      removeMessage(messageId);
    }
  }, [state.activeMessages, removeMessage]);

  // Aceitar mensagem
  const accept = useCallback((messageId: string) => {
    const message = state.activeMessages.find(m => m.id === messageId);
    if (message) {
      provideFeedback(message.semanticHash, message.context.screen, 'accepted');
      removeMessage(messageId);
    }
  }, [state.activeMessages, removeMessage]);

  // Solicitar silêncio
  const requestSilence = useCallback((durationMs: number = 300000) => {
    ConsciousnessCore.requestSilence(durationMs);
    syncGlobalState();
  }, [syncGlobalState]);

  // Desabilitar silêncio
  const disableSilence = useCallback(() => {
    ConsciousnessCore.disableSilence();
    syncGlobalState();
  }, [syncGlobalState]);

  // Atualizar contexto
  const setContext = useCallback((updates: { screen?: string; activity?: string }) => {
    updateContext(updates);
    syncGlobalState();
  }, [syncGlobalState]);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeMessages: [],
    }));
  }, []);

  // Auto-inicialização
  useEffect(() => {
    if (autoInit && !state.initialized && !state.loading) {
      initialize();
    }
  }, [autoInit, state.initialized, state.loading, initialize]);

  // Registrar listeners
  useEffect(() => {
    if (!state.initialized) {
      return;
    }

    // Listener para outputs
    const unsubOutput = onOutput(addMessage);

    // Listener para decisões
    const unsubDecision = onDecision((event, decision) => {
      if (onDecisionRef.current) {
        onDecisionRef.current(event, decision);
      }
    });

    // Listener para mudanças de estado global
    const unsubState = subscribeToState((_, changedKeys) => {
      if (
        changedKeys.includes('currentMoment') ||
        changedKeys.includes('identity') ||
        changedKeys.includes('*')
      ) {
        syncGlobalState();
      }
    });

    return () => {
      unsubOutput();
      unsubDecision();
      unsubState();
    };
  }, [state.initialized, addMessage, syncGlobalState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.initialized) {
        shutdown();
      }
    };
  }, []);

  // Auto-expirar mensagens por TTL
  useEffect(() => {
    if (state.activeMessages.length === 0) {
      return;
    }

    const checkExpiry = () => {
      const now = Date.now();
      setState(prev => ({
        ...prev,
        activeMessages: prev.activeMessages.filter(msg => {
          const expiresAt = msg.context.timestamp + msg.ttl;
          if (now >= expiresAt) {
            // Marcar como ignorada se não interagiu
            provideFeedback(msg.semanticHash, msg.context.screen, 'ignored');
            return false;
          }
          return true;
        }),
      }));
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [state.activeMessages.length]);

  return {
    state,
    initialize,
    shutdown,
    send,
    dismiss,
    accept,
    requestSilence,
    disableSilence,
    setContext,
    clearMessages,
  };
}

export default useConsciousness;

