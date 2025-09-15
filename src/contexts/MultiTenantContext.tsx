
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '@/domains/auth/context/AuthContext';
import { MultiTenantContext, Organization, Store } from '@/types/multi-tenant';
import { MultiTenantContextProvider } from './multiTenantContextInstance';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/services/logger';
// Removed the useMultiTenant hook to satisfy react-refresh rule

// Context moved to separate file to satisfy react-refresh rule

interface MultiTenantProviderProps {
  children: ReactNode;
}

export const MultiTenantProvider: React.FC<MultiTenantProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<object | null>(null);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  // Initialize component safely
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 150);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Always call hooks at the top level (Rule of Hooks)
  const authContext = useAuthContext();
  // Only use the value once initialized to avoid flicker
  const authUser = isInitialized ? (authContext?.user || null) : null;

  // Mock data for development (stable references)
  const mockOrganizations: Organization[] = useMemo(() => ([
    {
      id: '1',
      name: 'Empresa Principal',
      slug: 'empresa-principal',
      plan: 'pro',
      settings: {
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        features: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]), []);

  const mockStores: Store[] = useMemo(() => ([
    {
      id: '1',
      organizationId: '1',
      name: 'Loja Principal',
      slug: 'loja-principal',
      settings: {
        defaultMargin: 30,
        defaultTax: 10,
        defaultCardFee: 3.5,
        defaultShipping: 15,
        includeShippingDefault: false
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      organizationId: '1',
      name: 'Loja Centro',
      slug: 'loja-centro',
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil'
      },
      settings: {
        defaultMargin: 25,
        defaultTax: 12,
        defaultCardFee: 4.0,
        defaultShipping: 20,
        includeShippingDefault: true
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]), []);

  // Load user organizations
  const loadUserOrganizations = useCallback(async () => {
    if (!user) {return;}

    try {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setOrganizations(mockOrganizations);
      setStores(mockStores);
      setUserRole('owner');
      setUserPermissions(['store_manage', 'reports_view', 'team_manage']);
      
      if (mockOrganizations.length > 0) {
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const orgToSet = savedOrgId ? mockOrganizations.find(o => o.id === savedOrgId) || mockOrganizations[0] : mockOrganizations[0];
        setCurrentOrganization(orgToSet);
        
        const savedStoreId = localStorage.getItem('currentStoreId');
        const storeToSet = savedStoreId ? mockStores.find(s => s.id === savedStoreId) || mockStores[0] : mockStores[0];
        setCurrentStore(storeToSet);
      }
      
    } catch (_err: unknown) {
      logger.error('Erro ao carregar organizações');
    } finally {
      setIsLoading(false);
    }
  }, [user, mockOrganizations, mockStores]);

  // Switch organization
  const switchOrganization = async (organizationId: string) => {
    const org = organizations.find(o => o.id === organizationId);
    if (!org) {return;}

    setCurrentOrganization(org);
    setCurrentStore(null);
    
    const orgStores = mockStores.filter(s => s.organizationId === organizationId);
    if (orgStores.length > 0) {
      setCurrentStore(orgStores[0]);
    }
    
    localStorage.setItem('currentOrganizationId', organizationId);
    toast.success(`Organização alterada para ${org.name}`);
  };

  // Switch store
  const switchStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (store) {
      setCurrentStore(store);
      localStorage.setItem('currentStoreId', storeId);
      toast.success(`Loja alterada para ${store.name}`);
    }
  };

  // Check permission
  const hasPermission = (permission: string, _storeId?: string) => {
    if (!userRole) {return false;}
    if (userRole === 'owner' || userRole === 'admin') {return true;}
    return userPermissions.includes(permission);
  };

  // Load data when user is authenticated
  useEffect(() => {
    if (isInitialized && authUser) {
      setUser(authUser);
      loadUserOrganizations();
    } else if (isInitialized && !authUser) {
      setCurrentOrganization(null);
      setCurrentStore(null);
      setOrganizations([]);
      setStores([]);
      setUserRole(null);
      setUserPermissions([]);
      setIsLoading(false);
    }
  }, [isInitialized, authUser, loadUserOrganizations]);

  // Provide safe default value until ready
  if (!isInitialized) {
    return <>{children}</>;
  }

  const value: MultiTenantContext = {
    currentOrganization,
    currentStore,
    organizations,
    stores,
    userRole,
    userPermissions,
    switchOrganization,
    switchStore,
    hasPermission
  };

  return (
    <MultiTenantContextProvider.Provider value={value}>
      {children}
    </MultiTenantContextProvider.Provider>
  );
};
