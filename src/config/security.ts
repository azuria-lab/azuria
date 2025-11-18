/**
 * Security configuration constants
 */

export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP: {
    DEFAULT_SRC: "'self'",
    SCRIPT_SRC: "'self' 'unsafe-inline' 'unsafe-eval' https://crpzkppsriranmeumfqs.supabase.co https://vercel.live",
    STYLE_SRC: "'self' 'unsafe-inline'",
    IMG_SRC: "'self' data: https:",
    FONT_SRC: "'self' data:",
    CONNECT_SRC: "'self' http://localhost:54321 http://127.0.0.1:54321 https://crpzkppsriranmeumfqs.supabase.co wss://crpzkppsriranmeumfqs.supabase.co https://vercel.live",
    FRAME_SRC: "'none'",
    OBJECT_SRC: "'none'",
    BASE_URI: "'self'"
  },

  // Security Headers
  HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },

  // Rate Limiting
  RATE_LIMITS: {
    API_CALLS: { max: 100, window: 60000 }, // 100 calls per minute
    AUTH_ATTEMPTS: { max: 5, window: 300000 }, // 5 attempts per 5 minutes
    PASSWORD_RESET: { max: 3, window: 3600000 } // 3 resets per hour
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    FORBIDDEN_PATTERNS: [
      'password', '123456', 'qwerty', 'admin', 'root'
    ]
  },

  // Session Security
  SESSION: {
    MAX_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    IDLE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
    CONCURRENT_SESSIONS: 3
  }
} as const;

/**
 * Generate CSP string from configuration
 */
export const generateCSP = (): string => {
  const csp = SECURITY_CONFIG.CSP;
  return [
    `default-src ${csp.DEFAULT_SRC}`,
    `script-src ${csp.SCRIPT_SRC}`,
    `style-src ${csp.STYLE_SRC}`,
    `img-src ${csp.IMG_SRC}`,
    `font-src ${csp.FONT_SRC}`,
    `connect-src ${csp.CONNECT_SRC}`,
    `frame-src ${csp.FRAME_SRC}`,
    `object-src ${csp.OBJECT_SRC}`,
    `base-uri ${csp.BASE_URI}`
  ].join('; ');
};

/**
 * Validate password against security requirements
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = SECURITY_CONFIG.PASSWORD;

  if (password.length < config.MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${config.MIN_LENGTH} caracteres`);
  }

  if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (config.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  const lowerPassword = password.toLowerCase();
  for (const pattern of config.FORBIDDEN_PATTERNS) {
    if (lowerPassword.includes(pattern)) {
      errors.push('Senha contém padrões muito comuns ou inseguros');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};