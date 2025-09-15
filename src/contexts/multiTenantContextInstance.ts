import { createContext } from 'react';
import type { MultiTenantContext } from '@/types/multi-tenant';

export const MultiTenantContextProvider = createContext<MultiTenantContext | null>(null);
