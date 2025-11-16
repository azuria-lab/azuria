
import { useCallback, useEffect } from "react";
import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";
import { useUserProfile } from "./useUserProfile";

/**
 * Main authentication hook that combines all auth-related functionality
 */
export const useAuth = () => {
  const {
    session,
    user,
    userProfile,
    setUserProfile,
    isLoading,
    setIsLoading,
    error,
    setError,
    isAuthenticated
  } = useAuthState();

  const {
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  } = useAuthMethods(setIsLoading, setError);

  const {
    fetchUserProfile,
    updateProfile,
    updateProStatus
  } = useUserProfile(user, setUserProfile, setIsLoading, setError);

  // Fetch user profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  // Wrapper para login que carrega o perfil imediatamente
  const loginWithProfile = useCallback(async (email: string, password: string) => {
    // Setar loading antes de iniciar
    setIsLoading(true);
    
    const sessionResult = await login(email, password);
    
    if (sessionResult?.user?.id) {
      // Aguardar que o listener onAuthStateChange processe a mudança
      // Isso é necessário porque o login retorna a sessão, mas o estado local
      // só é atualizado quando o listener dispara
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Forçar carregamento imediato do perfil (fetchUserProfile já gerencia isLoading)
      await fetchUserProfile(sessionResult.user.id);
    } else {
      // Se não há sessão, desligar loading
      setIsLoading(false);
    }
    
    return sessionResult;
  }, [login, fetchUserProfile, setIsLoading]);

  return {
    // Auth state
    session,
    user,
    userProfile,
    isLoading,
    error,
    isAuthenticated,
    isPro: userProfile?.isPro || false,
    
    // Auth methods
    login: loginWithProfile, // Usar login com carregamento de perfil
    register,
    logout,
    resetPassword,
    updatePassword,
    
    // User profile methods
    updateProfile,
    updateProStatus
  };
};

// Export types from @/types/auth
export type { UserProfileWithDisplayData } from "@/types/auth";
