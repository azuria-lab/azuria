
import { supabase } from "@/integrations/supabase/client";
import { validatePassword } from '@/config/security';
import { logger } from '@/services/logger';

/**
 * Hook for authentication methods (login, register, logout, etc.)
 */
export const useAuthMethods = (
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  // Login com email e senha
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      logger.info("🔐 Fazendo login para:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      
  if (error) { throw error; }
      
      if (!data.session) {
        throw new Error("Sessão não foi criada após login");
      }
      
  logger.info("✅ Login realizado com sucesso");
      
      // Verificar assinatura após login
      setTimeout(() => {
  supabase.functions.invoke('check-subscription').catch((e) => logger.error('check-subscription failed', e));
      }, 1000);
      
      return data.session;
    } catch (err: unknown) {
      logger.error("❌ Erro no login:", err);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos";
      } else if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login";
      } else if (errorMessage.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos";
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Registro de novo usuário
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      if (!email?.trim() || !password || !name?.trim()) {
        throw new Error("Todos os campos são obrigatórios");
      }

      // Validação de senha com as regras de segurança
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      if (name.trim().length < 2) {
        throw new Error("O nome deve ter pelo menos 2 caracteres");
      }

  logger.info("🔐 Registrando usuário:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${globalThis.location.origin}/`
        }
      });
      
  if (error) {
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message;
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email já está cadastrado. Tente fazer login";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Email inválido";
        }
        
        throw new Error(errorMessage);
      }
      
      logger.info("✅ Registro realizado com sucesso:", data.user?.email);
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro no registro';
      logger.error("❌ Falha no registro:", message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info("🔐 Fazendo logout...");
      
      // Tentar fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      // Se houver erro, verificar se é relacionado a sessão ausente
      // Se a sessão já não existe, não é um problema - o objetivo é fazer logout mesmo assim
      if (error) {
        const errorMessage = error.message || '';
        const isSessionMissing = errorMessage.includes('session') || 
                                 errorMessage.includes('Auth session missing') ||
                                 errorMessage.includes('403');
        
        if (isSessionMissing) {
          // Sessão já não existe - isso é ok, continuar com limpeza local
          logger.info("⚠️ Sessão já não existe, continuando com limpeza local");
        } else {
          // Outro tipo de erro - logar mas continuar mesmo assim
          logger.warn("⚠️ Erro no logout do Supabase (continuando mesmo assim):", error);
        }
      }
      
      // SEMPRE limpar localStorage, independente de erros
      try {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isPro");
        localStorage.removeItem("azuria-theme");
        // Limpar outros dados de sessão que possam existir
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('supabase.') || key.startsWith('sb-'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (storageError) {
        logger.warn("⚠️ Erro ao limpar localStorage:", storageError);
      }
      
      logger.info("✅ Logout concluído (limpeza local realizada)");
      return true; // Sempre retornar true para permitir redirecionamento
    } catch (err: unknown) {
      // Em caso de erro inesperado, ainda assim limpar localStorage
      logger.error("❌ Erro inesperado no logout:", err);
      
      try {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("isPro");
        localStorage.removeItem("azuria-theme");
      } catch (storageError) {
        logger.warn("⚠️ Erro ao limpar localStorage após erro:", storageError);
      }
      
      // Não setar erro para não mostrar mensagem ao usuário
      // O objetivo é sempre fazer logout, mesmo com erros
      return true; // Retornar true mesmo com erro para permitir redirecionamento
    } finally {
      setIsLoading(false);
    }
  };

  // Recuperação de senha
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${globalThis.location.origin}/configuracoes?tab=security`
      });
      
      if (error) {throw error;}
      
      return true;
    } catch (err: unknown) {
      logger.error("❌ Erro na recuperação de senha:", err);
      setError(err instanceof Error ? err.message : 'Erro na recuperação de senha');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar senha
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {throw error;}
      
      return true;
    } catch (err: unknown) {
      logger.error("❌ Erro ao atualizar senha:", err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar senha');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Google OAuth
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      logger.info("🔐 Iniciando login com Google...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${globalThis.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      logger.info("✅ Redirecionamento para Google iniciado");
      return data;
    } catch (err: unknown) {
      logger.error("❌ Erro no login com Google:", err);
      
      let errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMessage.includes("OAuth")) {
        errorMessage = "Erro ao conectar com o Google. Tente novamente.";
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    loginWithGoogle
  };
};
