/**
 * Security Configuration for Azuria
 * Centralized CORS and Security Headers management
 */

// Environment-based allowed origins
const ALLOWED_ORIGINS = {
  production: new Set([
    'https://azuria.app.br',
    'https://www.azuria.app.br',
    'https://app.azuria.app.br',
  ]),
  staging: new Set([
    'https://staging.azuria.app.br',
    'https://azuria-lab-azuria.vercel.app',
  ]),
  development: new Set([
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173',
  ]),
};

// Detect environment
function getEnvironment(): 'production' | 'staging' | 'development' {
  const url = Deno.env.get('VERCEL_URL') || Deno.env.get('FRONTEND_URL') || '';

  if (url.includes('azuria.app.br') && !url.includes('staging')) {
    return 'production';
  }
  if (url.includes('staging') || url.includes('vercel.app')) {
    return 'staging';
  }
  return 'development';
}

// Get allowed origins for current environment
function getAllowedOrigins(): Set<string> {
  const env = getEnvironment();
  const origins = new Set<string>();

  // Add environment-specific origins
  ALLOWED_ORIGINS[env].forEach(origin => origins.add(origin));

  // In development, also allow staging origins
  if (env === 'development') {
    ALLOWED_ORIGINS.staging.forEach(origin => origins.add(origin));
  }

  return origins;
}

// Validate origin against whitelist
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {return false;}

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.has(origin);
}

// Get CORS headers for a request
export interface CorsOptions {
  allowCredentials?: boolean;
  allowedMethods?: string[];
  allowedHeaders?: string[];
  maxAge?: number;
}

export function getCorsHeaders(
  request: Request,
  options: CorsOptions = {}
): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowed = isOriginAllowed(origin);

  const {
    allowCredentials = false,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: customAllowedHeaders,
    maxAge = 86400, // 24 hours
  } = options;

  // Default allowed headers
  const defaultHeaders = ['Authorization', 'Content-Type', 'X-Requested-With'];
  
  // If credentials are allowed, include Supabase client headers
  const supabaseHeaders = allowCredentials 
    ? ['x-client-info', 'apikey'] 
    : [];
  
  const allowedHeaders = customAllowedHeaders || [...defaultHeaders, ...supabaseHeaders];

  const headers: Record<string, string> = {};

  if (isAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;

    if (allowCredentials) {
      headers['Access-Control-Allow-Credentials'] = 'true';
    }
  } else {
    // For blocked origins, don't set CORS headers
    // This will cause browser to block the request
    return {};
  }

  headers['Access-Control-Allow-Methods'] = allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ');
  headers['Access-Control-Max-Age'] = maxAge.toString();

  return headers;
}

// Security Headers
export function getSecurityHeaders(nonce?: string): Record<string, string> {
  const headers: Record<string, string> = {
    // HSTS - Force HTTPS
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy - restrict features
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), interest-cohort=()',

    // Cross-Origin policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',

    // XSS Protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',
  };

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    nonce
      ? `script-src 'self' 'nonce-${nonce}'`
      : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.stripe.com https://api.mercadopago.com https://api.ipify.org",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ];

  headers['Content-Security-Policy'] = cspDirectives.join('; ');

  return headers;
}

// Combined headers for responses
export function getResponseHeaders(
  request: Request,
  options: CorsOptions & { nonce?: string } = {}
): Record<string, string> {
  const corsHeaders = getCorsHeaders(request, options);
  const securityHeaders = getSecurityHeaders(options.nonce);

  return {
    ...corsHeaders,
    ...securityHeaders,
    'Content-Type': 'application/json',
  };
}

// Create error response for blocked origins
export function createBlockedOriginResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Forbidden',
      message: 'Origin not allowed',
      code: 'ORIGIN_NOT_ALLOWED',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
        ...getSecurityHeaders(),
      },
    }
  );
}

// Middleware wrapper for Edge Functions
export function withSecurityMiddleware(
  handler: (req: Request) => Promise<Response> | Response,
  options: CorsOptions = {}
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      const corsHeaders = getCorsHeaders(req, options);

      if (Object.keys(corsHeaders).length === 0) {
        return createBlockedOriginResponse();
      }

      return new Response(null, {
        status: 204,
        headers: {
          ...corsHeaders,
          ...getSecurityHeaders(),
        },
      });
    }

    // Validate origin for non-OPTIONS requests
    const origin = req.headers.get('origin');
    if (origin && !isOriginAllowed(origin)) {
      return createBlockedOriginResponse();
    }

    try {
      // Call the actual handler
      const response = await handler(req);

      // Add security headers to response
      const headers = new Headers(response.headers);
      const responseHeaders = getResponseHeaders(req, options);

      Object.entries(responseHeaders).forEach(([key, value]) => {
        if (!headers.has(key)) {
          headers.set(key, value);
        }
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (error) {
      // Error handling with security headers
      const errorMessage =
        error instanceof Error ? error.message : 'Internal server error';

      return new Response(
        JSON.stringify({
          error: 'Internal Server Error',
          message: errorMessage,
        }),
        {
          status: 500,
          headers: getResponseHeaders(req, options),
        }
      );
    }
  };
}

// Export allowed origins for testing
export function getAllowedOriginsForTesting(): Set<string> {
  return getAllowedOrigins();
}
