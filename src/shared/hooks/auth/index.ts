
import { useEffect } from "react";
import { useAuthState } from "./useAuthState";
import { useAuthMethods } from "./useAuthMethods";
import { useUserProfile } from "./useUserProfile";
import { UserProfileWithDisplayData } from "@/types/auth";

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
    login,
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
