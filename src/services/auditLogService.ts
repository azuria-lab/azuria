import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/services/logger";

export class AuditLogService {
  /**
   * Log security event to server-side audit_logs table
   */
  static async logSecurityEvent(
    action: string,
    category: 'auth' | 'calculation' | 'settings' | 'data' | 'security',
    details: Record<string, unknown> = {},
    riskLevel: 'low' | 'medium' | 'high' = 'low'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Cannot log audit event: No authenticated user');
        return;
      }

      // Get additional context
      const ipAddress = await this.getClientIP();
      const userAgent = navigator.userAgent;
      const timestamp = new Date().toISOString();

      const auditLog = {
        user_id: user.id,
        action,
        category,
        details: {
          ...details,
          timestamp,
          url: window.location.href,
          referrer: document.referrer
        },
        risk_level: riskLevel,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: true
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(auditLog);

      if (error) {
        logger.error('Failed to log audit event:', error);
        // Fallback to local storage for critical events
        this.fallbackLocalLog(auditLog);
      } else {
        logger.info('Audit event logged', { action, category, riskLevel });
      }
    } catch (error) {
      logger.error('Error logging security event:', error);
      // Fallback to local storage
      this.fallbackLocalLog({ action, category, details, riskLevel });
    }
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(
    event: 'login' | 'logout' | 'register' | 'password_reset' | 'failed_login',
    details: Record<string, unknown> = {},
    success: boolean = true
  ): Promise<void> {
    const riskLevel = success ? 'low' : 'medium';
    await this.logSecurityEvent(event, 'auth', details, riskLevel);
  }

  /**
   * Log data access events
   */
  static async logDataAccess(
    action: string,
    resourceType: string,
    resourceId?: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    await this.logSecurityEvent(
      action,
      'data',
      {
        resourceType,
        resourceId,
        ...details
      },
      'low'
    );
  }

  /**
   * Log security violations
   */
  static async logSecurityViolation(
    violationType: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    await this.logSecurityEvent(
      `security_violation_${violationType}`,
      'security',
      details,
      'high'
    );
  }

  /**
   * Get client IP address (best effort)
   */
  private static async getClientIP(): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timer);
      const data = (await response.json()) as { ip?: string };
      return typeof data.ip === 'string' ? data.ip : null;
    } catch {
      return null;
    }
  }

  /**
   * Fallback logging to localStorage when server logging fails
   */
  private static fallbackLocalLog(logData: Record<string, unknown>): void {
    try {
      const raw = localStorage.getItem('fallback_audit_logs');
      const fallbackLogs: Array<Record<string, unknown>> = raw ? JSON.parse(raw) : [];
      fallbackLogs.push({
        ...logData,
        timestamp: new Date().toISOString(),
        fallback: true
      });
      
      // Keep only last 100 fallback logs
      if (fallbackLogs.length > 100) {
        fallbackLogs.splice(0, fallbackLogs.length - 100);
      }
      
      localStorage.setItem('fallback_audit_logs', JSON.stringify(fallbackLogs));
    } catch (error) {
      logger.error('Failed to save fallback audit log:', error);
    }
  }

  /**
   * Sync fallback logs to server when connection is restored
   */
  static async syncFallbackLogs(): Promise<void> {
    try {
  const raw = localStorage.getItem('fallback_audit_logs');
  const fallbackLogs: Array<Record<string, unknown>> = raw ? JSON.parse(raw) : [];
      
      if (fallbackLogs.length === 0) {return;}

  logger.info('Syncing fallback audit logs', { count: fallbackLogs.length });

      for (const raw of fallbackLogs) {
        try {
          const log = (raw ?? {}) as Record<string, unknown>;
          const user_id = typeof log.user_id === 'string' ? log.user_id : undefined;
          const action = typeof log.action === 'string' ? log.action : undefined;
          const category = typeof log.category === 'string' ? log.category : undefined;
          const risk_level = (typeof log.risk_level === 'string' ? log.risk_level : 'low') as 'low' | 'medium' | 'high';
          const ip_address = typeof log.ip_address === 'string' ? log.ip_address : null;
          const user_agent = typeof log.user_agent === 'string' ? log.user_agent : (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown');
          const baseDetails = (typeof log.details === 'object' && log.details !== null) ? (log.details as Record<string, unknown>) : {};
          const details = { ...baseDetails, synced_from_fallback: true } as Record<string, unknown>;

          // Require minimal fields
          if (!user_id || !action || !category) {
            logger.warn('Skipping malformed fallback audit log during sync', { user_id, action, category });
            continue;
          }

          const payload = {
            user_id,
            action,
            category,
            details,
            risk_level,
            ip_address,
            user_agent,
            success: true,
          };

          const { error } = await supabase.from('audit_logs').insert(payload as never);

          if (error) {
            logger.error('Failed to sync fallback log:', error);
            break; // Stop syncing if we hit an error
          }
        } catch (syncError) {
          logger.error('Error syncing individual log:', syncError);
        }
      }

      // Clear synced logs
      localStorage.removeItem('fallback_audit_logs');
      logger.info('Fallback logs synced successfully');
    } catch (error) {
      logger.error('Error syncing fallback logs:', error);
    }
  }
}
