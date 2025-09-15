import { createContext, useContext } from 'react';
import type { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import type { useAuditLog } from '@/hooks/useAuditLog';

export interface SecurityContextType {
  securityMonitor: ReturnType<typeof useSecurityMonitor>;
  auditLog: ReturnType<typeof useAuditLog>;
}

export const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};
