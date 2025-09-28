import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  permissions: string[];
  settings: {
    theme: 'light' | 'dark' | 'system';
    language: 'pt' | 'en' | 'es';
    notifications: boolean;
    twoFactorEnabled: boolean;
  };
  lastLoginAt: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'azuria_auth_token',
  USER: 'azuria_auth_user',
  REFRESH_TOKEN: 'azuria_refresh_token'
} as const;

// Mock API service (replace with real API calls)
class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'admin@azuria.com' && credentials.password === 'admin123') {
      const user: User = {
        id: '1',
        email: credentials.email,
        name: 'Administrador',
        avatar: '/api/placeholder/32/32',
        role: 'admin',
        permissions: ['*'],
        settings: {
          theme: 'system',
          language: 'pt',
          notifications: true,
          twoFactorEnabled: false
        },
        lastLoginAt: new Date(),
        createdAt: new Date('2024-01-01')
      };
      
      return {
        user,
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      };
    }
    
    throw new Error('Credenciais inválidas');
  }

  async register(data: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (data.password !== data.confirmPassword) {
      throw new Error('Senhas não coincidem');
    }
    
    if (!data.acceptTerms) {
      throw new Error('Você deve aceitar os termos de uso');
    }
    
    const user: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: 'user',
      permissions: ['dashboard:read', 'reports:read', 'reports:create'],
      settings: {
        theme: 'system',
        language: 'pt',
        notifications: true,
        twoFactorEnabled: false
      },
      lastLoginAt: new Date(),
      createdAt: new Date()
    };
    
    return {
      user,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now()
    };
  }

  async forgotPassword(_email: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would send an email
    // Development only: Password reset email sent
  }

  async resetPassword(_token: string, _password: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would validate the token and update the password
    // Development only: Password reset
  }

  async refreshToken(_refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now()
    };
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would update the user in the database
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = { ...user, ...data };
      return updatedUser;
    }
    
    throw new Error('Usuário não encontrado');
  }
}

// Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  const authService = AuthService.getInstance();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          
          // Validate token (in a real app, you'd verify with the server)
          if (isTokenValid(token)) {
            setState(prev => ({
              ...prev,
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            }));
          } else {
            // Token expired, try to refresh
            await refreshToken();
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // Auth initialization failed
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: 'Falha ao inicializar autenticação'
        }));
        throw error;
      }
    };

    initializeAuth();
  }, []);

  // Check if token is valid (simplified check)
  const isTokenValid = (token: string): boolean => {
    try {
      // In a real app, you'd decode and validate JWT
      return token.startsWith('mock_jwt_token_');
    } catch {
      return false;
    }
  };

  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.login(credentials);
      
      // Store in localStorage if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      } else {
        // Store in sessionStorage for current session only
        sessionStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      }
      
      setState(prev => ({
        ...prev,
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro no login'
      }));
      throw error;
    }
  }, [authService]);

  // Register
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authService.register(data);
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      
      setState(prev => ({
        ...prev,
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro no registro'
      }));
      throw error;
    }
  }, [authService]);

  // Logout
  const logout = useCallback((): void => {
    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.forgotPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao solicitar recuperação'
      }));
      throw error;
    }
  }, [authService]);

  // Reset Password
  const resetPassword = useCallback(async (token: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.resetPassword(token, password);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao redefinir senha'
      }));
      throw error;
    }
  }, [authService]);

  // Update Profile
  const updateProfile = useCallback(async (data: Partial<User>): Promise<void> => {
    if (!state.user) {
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedUser = await authService.updateProfile(state.user.id, data);
      
      // Update storage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      }));
      throw error;
    }
  }, [authService, state.user]);

  // Refresh Token
  const refreshToken = useCallback(async (): Promise<void> => {
    const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshTokenValue) {
      logout();
      return;
    }
    
    try {
      const response = await authService.refreshToken(refreshTokenValue);
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      
      setState(prev => ({
        ...prev,
        token: response.token,
        isLoading: false
      }));
    } catch (error) {
      logout();
      throw error;
    }
  }, [authService]);

  // Clear Error
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshToken,
    clearError
  }), [state, login, register, logout, forgotPassword, resetPassword, updateProfile, refreshToken, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };