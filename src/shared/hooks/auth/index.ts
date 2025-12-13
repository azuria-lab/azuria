import { useCallback, useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthMethods } from './useAuthMethods';
import { useUserProfile } from './useUserProfile';

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
    isAuthenticated,
  } = useAuthState();

  const { login, register, logout, resetPassword, updatePassword, loginWithGoogle } =
    useAuthMethods(setIsLoading, setError);

  const { fetchUserProfile, updateProfile, updateProStatus } = useUserProfile(
    user,
    setUserProfile,
    setIsLoading,
    setError
  );

  // Fetch user profile when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  // Wrapper para login que carrega o perfil imediatamente
  const loginWithProfile = useCallback(
    async (email: string, password: string) => {
      const sessionResult = await login(email, password);

      if (sessionResult?.user?.id) {
        // Carregar perfil do usuário imediatamente
        // O listener onAuthStateChange já atualizou o estado de session/user
        await fetchUserProfile(sessionResult.user.id);
      }

      return sessionResult;
    },
    [login, fetchUserProfile]
  );

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
    loginWithGoogle,

    // User profile methods
    updateProfile,
    updateProStatus,
  };
};

// Export types from @/types/auth
export type { UserProfileWithDisplayData } from '@/types/auth';
