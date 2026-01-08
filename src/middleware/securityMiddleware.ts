import { SECURITY_CONFIG } from '@/config/security';

/**
 * Security middleware for detecting and preventing attacks
 */
export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private attemptCounters: Map<string, { count: number; firstAttempt: number }> = new Map();
  private blockedIPs: Set<string> = new Set();

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
    }
    return SecurityMiddleware.instance;
  }

  /**
   * Check if IP is rate limited
   */
  isRateLimited(identifier: string, limit: { max: number; window: number }): boolean {
    const now = Date.now();
    const counter = this.attemptCounters.get(identifier);

    if (!counter) {
      this.attemptCounters.set(identifier, { count: 1, firstAttempt: now });
      return false;
    }

    // Reset counter if window has passed
    if (now - counter.firstAttempt > limit.window) {
      this.attemptCounters.set(identifier, { count: 1, firstAttempt: now });
      return false;
    }

    // Increment counter
    counter.count++;
    
    // Check if limit exceeded
    if (counter.count > limit.max) {
      this.blockedIPs.add(identifier);
      this.dispatchSecurityEvent('rate_limit_exceeded', {
        identifier,
        attempts: counter.count,
        timeWindow: limit.window
      }, 'high');
      return true;
    }

    return false;
  }

  /**
   * Detect SQL injection attempts
   */
  detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
  /('|;|--|\|\||\*|%27|%3B|\+|%2B|%20|\s+|\s*)/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi,
      /(script|javascript|vbscript|onload|onerror|onclick)/gi
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        this.dispatchSecurityEvent('sql_injection_attempt', {
          input: input.substring(0, 100), // Only log first 100 chars
          pattern: pattern.source
        }, 'critical');
        return true;
      }
    }

    return false;
  }

  /**
   * Detect XSS attempts
   */
  detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,  // Fixed: use [\s\S] instead of .*? for multiline
      /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,  // Fixed: use [\s\S] instead of .*? for multiline
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*onerror[^>]*>/gi,
      /<svg[^>]*onload[^>]*>/gi,
      /<body[^>]*onload[^>]*>/gi
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        this.dispatchSecurityEvent('xss_attempt', {
          input: input.substring(0, 100),
          pattern: pattern.source
        }, 'high');
        return true;
      }
    }

    return false;
  }

  /**
   * Validate session security
   */
  validateSession(sessionData: { created_at: string; last_activity?: string } | null | undefined): boolean {
    if (!sessionData) {return false;}

    const now = Date.now();
    const sessionAge = now - new Date(sessionData.created_at).getTime();
    const lastActivity = sessionData.last_activity ? 
      now - new Date(sessionData.last_activity).getTime() : 0;

    // Check session age
    if (sessionAge > SECURITY_CONFIG.SESSION.MAX_DURATION) {
      this.dispatchSecurityEvent('session_expired', {
        sessionAge,
        maxDuration: SECURITY_CONFIG.SESSION.MAX_DURATION
      }, 'medium');
      return false;
    }

    // Check idle timeout
    if (lastActivity > SECURITY_CONFIG.SESSION.IDLE_TIMEOUT) {
      this.dispatchSecurityEvent('session_idle_timeout', {
        idleTime: lastActivity,
        maxIdle: SECURITY_CONFIG.SESSION.IDLE_TIMEOUT
      }, 'medium');
      return false;
    }

    return true;
  }

  /**
   * Check for suspicious activity patterns
   */
  detectSuspiciousActivity(userAgent: string, ip: string): boolean {
    // Check for bot-like user agents
    const botPatterns = [
      /bot|crawler|spider|scraper/gi,
      /curl|wget|python|php/gi,
      /automated|script/gi
    ];

    for (const pattern of botPatterns) {
      if (pattern.test(userAgent)) {
        this.dispatchSecurityEvent('suspicious_user_agent', {
          userAgent,
          ip,
          pattern: pattern.source
        }, 'medium');
        return true;
      }
    }

    // Check for multiple rapid requests from same IP
    if (this.isRateLimited(ip, SECURITY_CONFIG.RATE_LIMITS.API_CALLS)) {
      return true;
    }

    return false;
  }

  /**
   * Sanitize input data and validate URL schemes
   */
  sanitizeInput(input: string): string {
    // Use proper Unicode-aware sanitization
    // Remove HTML tags and event handlers - handle multi-byte characters correctly
    let sanitized = input
      .replace(/<[^>]+>/g, '') // Remove all HTML tags (handles multi-byte correctly)
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers with quoted values
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '') // Remove remaining event handlers
      .replace(/javascript:/gi, '')
      .trim();

    // Validate and sanitize dangerous URL schemes with proper Unicode handling
    const dangerousSchemes = [
      /javascript\s*:/gi,
      /data\s*:/gi,
      /vbscript\s*:/gi,
      /file\s*:/gi,
      /about\s*:/gi,
      /chrome\s*:/gi,
      /chrome-extension\s*:/gi
    ];

    for (const scheme of dangerousSchemes) {
      if (scheme.test(sanitized)) {
        // Remove the dangerous protocol with Unicode-safe replacement
        sanitized = sanitized.replace(scheme, '');
        this.dispatchSecurityEvent('dangerous_url_scheme_detected', {
          scheme: scheme.source,
          input: input.substring(0, 100)
        }, 'high');
      }
    }

    // Additional Unicode-aware sanitization
    // Remove zero-width spaces and other invisible characters that could be used for evasion
    sanitized = sanitized
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width spaces
      .replace(/[\u202A-\u202E]/g, ''); // Remove directional formatting characters

    return sanitized;
  }

  /**
   * Clean expired rate limit counters
   */
  cleanupCounters(): void {
    const now = Date.now();
    for (const [key, counter] of this.attemptCounters.entries()) {
      if (now - counter.firstAttempt > 3600000) { // 1 hour
        this.attemptCounters.delete(key);
      }
    }
  }

  /**
   * Dispatch security event
   */
  private dispatchSecurityEvent(type: string, details: Record<string, unknown>, severity: 'low' | 'medium' | 'high' | 'critical'): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-event', {
        detail: { type, details, severity }
      }));
    }
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics() {
    return {
      activeCounters: this.attemptCounters.size,
      blockedIPs: this.blockedIPs.size,
      topOffenders: Array.from(this.attemptCounters.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([ip, data]) => ({ ip, attempts: data.count }))
    };
  }

  /**
   * Reset all security data (use with caution)
   */
  reset(): void {
    this.attemptCounters.clear();
    this.blockedIPs.clear();
  }
}

export const securityMiddleware = SecurityMiddleware.getInstance();