
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
          emailRedirectTo: `${window.location.origin}/`
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
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {throw error;}
      
      // Limpar localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isPro");
      localStorage.removeItem("azuria-theme");
      
      logger.info("✅ Logout realizado com sucesso");
      return true;
    } catch (err: unknown) {
      logger.error("❌ Erro no logout:", err);
      setError(err instanceof Error ? err.message : 'Erro no logout');
      return false;
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
        redirectTo: `${window.location.origin}/configuracoes?tab=security`
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

  return {
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  };
};
