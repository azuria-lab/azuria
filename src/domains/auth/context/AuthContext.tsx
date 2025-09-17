/* eslint-disable react-refresh/only-export-components */
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useAuth, UserProfileWithDisplayData } from "@/hooks/auth";
import { logger } from '@/services/logger';

// Auth State Types
interface AuthState {
  session: Session | null;
  user: User | null;
  userProfile: UserProfileWithDisplayData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isPro: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_PROFILE'; payload: UserProfileWithDisplayData | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_PRO'; payload: boolean }
  | { type: 'SET_ALL'; payload: Partial<AuthState> }
  | { type: 'RESET_AUTH' };

// Auth Context Type
interface AuthContextType extends AuthState {
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<Session | null>;
  register: (email: string, password: string, name: string) => Promise<{ user: User | null; session: Session | null; } | null>;
  logout: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<UserProfileWithDisplayData>) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  updateProStatus: (isPro: boolean) => Promise<boolean>;
}

// Initial State
const initialAuthState: AuthState = {
  session: null,
  user: null,
  userProfile: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isPro: false,
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SESSION':
      return { 
        ...state, 
        session: action.payload,
        isAuthenticated: !!action.payload 
      };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROFILE':
      return { 
        ...state, 
        userProfile: action.payload,
        isPro: action.payload?.isPro || false
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_PRO':
      return { ...state, isPro: action.payload };
    case 'SET_ALL':
      return { ...state, ...action.payload };
    case 'RESET_AUTH':
      return initialAuthState;
    default:
      return state;
  }
}

// Default Context Value
const defaultAuthValue: AuthContextType = {
  ...initialAuthState,
  dispatch: () => {},
  login: async () => null,
  register: async () => null,
  logout: async () => false,
  resetPassword: async () => false,
  updateProfile: async () => false,
  updatePassword: async () => false,
  updateProStatus: async () => false,
};

// Context
const AuthContext = createContext<AuthContextType>(defaultAuthValue);

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const auth = useAuth();
  // Single sync effect to batch updates => mitigates multiple act() warnings in tests
  useEffect(() => {
    // Build next state snapshot derived from auth hook
    const next: Partial<AuthState> = {
      session: auth.session ?? null,
      user: auth.user ?? null,
      userProfile: auth.userProfile ?? null,
      isLoading: auth.isLoading ?? false,
      error: auth.error ?? null,
      isAuthenticated: auth.isAuthenticated ?? false,
      isPro: auth.isPro ?? (auth.userProfile?.isPro ?? false),
    };

    // Shallow compare to current state to avoid unnecessary dispatch
    let changed = false;
    for (const k of Object.keys(next) as (keyof AuthState)[]) {
      if (state[k] !== next[k]) { changed = true; break; }
    }
    if (changed) {
      dispatch({ type: 'SET_ALL', payload: next });
    }
  // Only re-run when primitive auth snapshot values change
  }, [auth.session, auth.user, auth.userProfile, auth.isLoading, auth.error, auth.isAuthenticated, auth.isPro, state]);

  // Context value with actions
  const contextValue = useMemo(() => ({
    ...state,
    dispatch,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    resetPassword: auth.resetPassword,
    updateProfile: auth.updateProfile,
    updatePassword: auth.updatePassword,
    updateProStatus: auth.updateProStatus,
  }), [state, auth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
  logger.error('🔒 useAuthContext usado fora do AuthProvider - problema de segurança detectado');
    
    // Security event logging
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-event', {
        detail: {
          type: 'Auth Context Access Error',
          details: { location: 'useAuthContext', error: 'Context not found' },
          severity: 'medium'
        }
      }));
    }
    
  return defaultAuthValue;
  }
  return context;
};

// Action Creators
export const authActions = {
  setLoading: (loading: boolean): AuthAction => ({ type: 'SET_LOADING', payload: loading }),
  setSession: (session: Session | null): AuthAction => ({ type: 'SET_SESSION', payload: session }),
  setUser: (user: User | null): AuthAction => ({ type: 'SET_USER', payload: user }),
  setProfile: (profile: UserProfileWithDisplayData | null): AuthAction => ({ type: 'SET_PROFILE', payload: profile }),
  setError: (error: string | null): AuthAction => ({ type: 'SET_ERROR', payload: error }),
  setAuthenticated: (authenticated: boolean): AuthAction => ({ type: 'SET_AUTHENTICATED', payload: authenticated }),
  setPro: (isPro: boolean): AuthAction => ({ type: 'SET_PRO', payload: isPro }),
  setAll: (payload: Partial<AuthState>): AuthAction => ({ type: 'SET_ALL', payload }),
  resetAuth: (): AuthAction => ({ type: 'RESET_AUTH' }),
};

export type { AuthState, AuthAction, AuthContextType };