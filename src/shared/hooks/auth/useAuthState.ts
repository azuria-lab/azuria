
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { UserProfileWithDisplayData } from "@/types/auth";
import { logger } from "@/services/logger";

/**
 * Hook to manage authentication state with optimized loading
 */
export const useAuthState = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileWithDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Changed to false to prevent white screen
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const initStartedRef = useRef(false);

  // Função estável para atualizar sessão
  const updateSession = useCallback((newSession: Session | null) => {
    try {
  logger.info("Atualizando sessão:", newSession ? "Ativa" : "Nula");
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Limpar perfil se não há usuário
      if (!newSession?.user) {
        setUserProfile(null);
      }
      
      // Clear any previous errors when session changes successfully
      setError(null);
  } catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  logger.error("Erro ao atualizar sessão:", message);
  setError(message);
    }
  }, []);

  // Verificar sessão atual e configurar listener
  useEffect(() => {
    let isMounted = true;
  // Timer handled with const below to avoid redeclaration
    
    // Prevent multiple initializations
    if (initStartedRef.current) {
      return;
    }
    initStartedRef.current = true;
    
    const initializeAuth = async () => {
      let retryCount = 0;
      const maxRetries = 3;
      
  const attemptInit = async (): Promise<unknown> => {
        try {
          logger.info("Inicializando autenticação... (tentativa:", retryCount + 1, ")");
          
          // Configurar listener primeiro
          const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, currentSession) => {
              logger.debug("Evento de auth:", event);
              
              // Log security event for auth state changes
              if (typeof window !== 'undefined' && event !== 'INITIAL_SESSION') {
                window.dispatchEvent(new CustomEvent('security-event', {
                  detail: {
                    type: 'Auth State Change',
                    details: { event, hasSession: !!currentSession },
                    severity: 'low'
                  }
                }));
              }
              
              if (isMounted) {
                updateSession(currentSession);
                setIsLoading(false);
                setIsInitialized(true);
              }
            }
          );
        
        // Buscar sessão atual com timeout otimizado
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 2000)
        );
        
  type Raced = { data?: { session: Session | null }; error?: { message?: string } } | void;
  const raced = (await Promise.race([sessionPromise, timeoutPromise])) as Raced;
  const data = raced && typeof raced === 'object' && 'data' in raced ? (raced as { data: { session: Session | null } }).data : undefined;
  const error = raced && typeof raced === 'object' && 'error' in raced ? (raced as { error: { message?: string } }).error : undefined;
        
        if (error && error.message !== 'Auth timeout') {
          logger.error("Erro ao obter sessão:", error);
          throw error;
        }
        
  logger.info("Sessão obtida:", data?.session ? "Ativa" : "Nenhuma");
        
        if (isMounted) {
          updateSession(data?.session || null);
          setIsLoading(false);
          setIsInitialized(true);
        }

        return () => authListener.subscription.unsubscribe();
        
  } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn("Erro na inicialização da auth (tentativa", retryCount + 1, "):", message);
          
          // Log security event for initialization failures
          if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-event', {
              detail: {
                type: 'Auth Initialization Error',
        details: { error: message, attempt: retryCount + 1 },
                severity: retryCount >= maxRetries ? 'high' : 'medium'
              }
            }));
          }
          
          if (retryCount < maxRetries) {
            retryCount++;
            // Exponential backoff: 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            return attemptInit();
          }
          
          if (isMounted) {
            // Só definir como erro se não foi timeout e excedeu tentativas
            if (message !== 'Auth timeout') {
              setError(`Falha na autenticação após ${maxRetries} tentativas: ${message}`);
            }
            setIsLoading(false);
            setIsInitialized(true);
          }
          throw err;
        }
      };
      
      try {
        return await attemptInit();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Falha final na inicialização da auth:", message);
      }
    };

    // Timeout de segurança reduzido para 500ms
  const timeoutId = setTimeout(() => {
      if (isMounted && !isInitialized) {
  logger.debug("Timeout de inicialização - forçando conclusão");
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 500);

    const cleanup = initializeAuth();

    return () => {
      isMounted = false;
      if (timeoutId) {clearTimeout(timeoutId);}
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then((unsubscribe) => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        });
      }
    };
  }, [updateSession, isInitialized]);

  return {
    session,
    user,
    userProfile,
    setUserProfile,
    isLoading: isLoading && !isInitialized,
    setIsLoading,
    error,
    setError,
    isAuthenticated: !!session && !!user && isInitialized
  };
};
