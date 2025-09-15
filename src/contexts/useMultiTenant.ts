import React from 'react';
import type { MultiTenantContext } from '@/types/multi-tenant';
import { MultiTenantContextProvider } from './multiTenantContextInstance';

export function useMultiTenant(): MultiTenantContext {
  const ctx = React.useContext(MultiTenantContextProvider);
  if (!ctx) {
    throw new Error('useMultiTenant must be used within a MultiTenantProvider');
  }
  return ctx;
}
