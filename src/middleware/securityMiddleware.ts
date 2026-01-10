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
    if (typeof input !== 'string') {
      return false;
    }

    // Use proper character classes for Unicode-aware matching
    // Use non-greedy matching with proper boundaries to prevent ReDoS
    const xssPatterns = [
      // Script tags - match tag opening and closing with non-greedy content and length limit
      // Use bounded quantifiers and avoid overly complex patterns to prevent ReDoS
      // Process script tags more carefully with explicit boundaries
      /<script(?:\s[^>]*)?>[\s\S]{0,50000}?<\/script\s*>/gi,
      // Iframe tags
      /<iframe[^>]*>[\s\S]*?<\/iframe\s*>/gi,
      // Dangerous protocols - use word boundary
      /\bjavascript\s*:/gi,
      /\bdata\s*:\s*text\/html/gi,  // Block data URLs with HTML
      /\bvbscript\s*:/gi,
      // Event handlers with quotes - limit length to prevent ReDoS
      /\bon\w+\s*=\s*["'][^"']{0,1000}["']/gi,
      // Event handlers without quotes - match until space or > with limit
      /\bon\w+\s*=\s*[^\s>]{0,1000}/gi,
      // Dangerous attributes on tags
      /<img[^>]*\bonerror\s*=/gi,
      /<svg[^>]*\bonload\s*=/gi,
      /<body[^>]*\bonload\s*=/gi,
      // Style tags with content
      /<style[^>]*>[\s\S]{0,10000}?<\/style\s*>/gi,
      // Link tags with javascript
      /<link[^>]*href\s*=\s*["']javascript:/gi
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
    if (typeof input !== 'string') {
      return '';
    }

    // Normalize Unicode characters first (handles multi-byte characters properly)
    let sanitized = input.normalize('NFC');

    // Remove HTML tags - match all characters including newlines and Unicode
    // Use non-greedy matching with length limit to prevent ReDoS
    sanitized = sanitized.replace(/<[^>]{0,10000}>/g, '');

    // Remove event handlers with proper Unicode-aware matching and length limits
    // IMPORTANTE: Processar caracteres Unicode corretamente para evitar bypasses multi-byte
    // Use bounded quantifiers with explicit character classes to prevent ReDoS
    // First pass: event handlers with quotes - handle Unicode properly
    // Match onEventName="value" or onEventName='value' with explicit limits
    // Process Unicode characters by matching any character except quote, but with length limit
    sanitized = sanitized.replace(/on[a-zA-Z0-9]+\s*=\s*["'][^"']{0,500}["']/gu, '');
    // Second pass: event handlers without quotes - handle Unicode characters  
    // Ensure we match specific event handler patterns, not arbitrary content
    // Use Unicode flag (u) to properly handle multi-byte characters
    sanitized = sanitized.replace(/on[a-zA-Z0-9]+\s*=\s*[^\s>]{0,500}/gu, '');
    // Third pass: Catch any remaining event handlers with mixed quotes/unicode
    // This handles edge cases where multi-byte characters might bypass previous patterns
    sanitized = sanitized.replace(/on[a-zA-Z0-9]+\s*=\s*[^>]{0,500}(?:\s|>)/gu, '');

    // Validate and sanitize dangerous URL schemes
    // Check for complete URL scheme patterns (must include :// or : after scheme)
    const dangerousUrlPatterns = [
      /\bjavascript\s*:\s*/gi,
      /\bdata\s*:\s*/gi,
      /\bvbscript\s*:\s*/gi,
      /\bfile\s*:\s*\/\/\/?/gi,
      /\babout\s*:\s*/gi,
      /\bchrome\s*:\s*/gi,
      /\bchrome-extension\s*:\s*/gi
    ];

    for (const pattern of dangerousUrlPatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '');
        this.dispatchSecurityEvent('dangerous_url_scheme_detected', {
          pattern: pattern.source,
          input: input.substring(0, 100)
        }, 'high');
      }
    }

    // Additional Unicode-aware sanitization
    // Remove zero-width and invisible characters that could be used for evasion
    sanitized = sanitized
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
      .replace(/[\u202A-\u202E]/g, '') // Directional formatting
      .replace(/[\u2060-\u206F]/g, '') // Word joiners and invisible separators
      .replace(/[\uFE00-\uFE0F]/g, ''); // Variation selectors

    return sanitized.trim();
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