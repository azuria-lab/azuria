import { useCallback } from 'react';
import { useAuthContext } from '@/domains/auth';
import { generateSecureId } from '@/utils/secureRandom';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  category:
    | 'auth'
    | 'calculation'
    | 'settings'
    | 'data'
    | 'security'
    | 'system';
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  riskLevel: 'low' | 'medium' | 'high';
  success: boolean;
}

export const useAuditLog = () => {
  const { user } = useAuthContext();

  const logAction = useCallback(
    async (
      action: string,
      category: AuditLogEntry['category'],
      details: Record<string, unknown> = {},
      riskLevel: AuditLogEntry['riskLevel'] = 'low',
      success: boolean = true
    ) => {
      const logEntry: AuditLogEntry = {
        id: `audit_${Date.now()}_${generateSecureId(9)}`,
        timestamp: new Date(),
        userId: user?.id || 'anonymous',
        action,
        category,
        details,
        ipAddress: await getClientIP(),
        userAgent: navigator.userAgent,
        riskLevel,
        success,
      };

      // Store in localStorage for now (in production, send to server)
      const existingLogs = JSON.parse(
        localStorage.getItem('audit_logs') || '[]'
      ) as AuditLogEntry[];
      existingLogs.push(logEntry);

      // Keep only last 1000 entries
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }

      localStorage.setItem('audit_logs', JSON.stringify(existingLogs));

      return logEntry;
    },
    [user]
  );

  const getAuditLogs = useCallback(
    (filters?: {
      category?: AuditLogEntry['category'];
      userId?: string;
      riskLevel?: AuditLogEntry['riskLevel'];
      startDate?: Date;
      endDate?: Date;
    }): AuditLogEntry[] => {
      const logs = JSON.parse(
        localStorage.getItem('audit_logs') || '[]'
      ) as AuditLogEntry[];

      if (!filters) {
        return logs;
      }

      return logs.filter((log: AuditLogEntry) => {
        if (filters.category && log.category !== filters.category) {
          return false;
        }
        if (filters.userId && log.userId !== filters.userId) {
          return false;
        }
        if (filters.riskLevel && log.riskLevel !== filters.riskLevel) {
          return false;
        }
        if (filters.startDate && new Date(log.timestamp) < filters.startDate) {
          return false;
        }
        if (filters.endDate && new Date(log.timestamp) > filters.endDate) {
          return false;
        }
        return true;
      });
    },
    []
  );

  const clearAuditLogs = useCallback(() => {
    localStorage.removeItem('audit_logs');
  }, []);

  return {
    logAction,
    getAuditLogs,
    clearAuditLogs,
  };
};

// Helper function to get client IP (simplified for demo)
async function getClientIP(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch('https://api.ipify.org?format=json', {
      cache: 'no-store', // Don't cache IP addresses
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
}
