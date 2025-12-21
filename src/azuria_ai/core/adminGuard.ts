// Tipos genéricos para compatibilidade (não requer dependência de 'next')

type GenericRequest = {
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
  socket?: { remoteAddress?: string };
};

type GenericResponse = {
  status: (code: number) => { json: (data: unknown) => void };
};

import { ADMIN_UIDS, isValidAdminUID } from './adminConfig';

function headerToString(h: string | string[] | undefined): string {
  if (!h) {
    return '';
  }
  return Array.isArray(h) ? h[0] : h;
}

/**
 * Rate limiting simples para proteção contra brute force
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minuto
const RATE_LIMIT_MAX_ATTEMPTS = 10; // máximo 10 tentativas por minuto

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  return false;
}

function getClientIP(req: GenericRequest): string {
  const forwarded = headerToString(req.headers['x-forwarded-for']);
  const realIP = headerToString(req.headers['x-real-ip']);
  return (
    forwarded?.split(',')[0]?.trim() ||
    realIP ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Verifica se a requisição é de um admin autenticado
 *
 * SECURITY: Requer UID válido configurado via variável de ambiente
 */
export function isAdminRequest(req: GenericRequest): boolean {
  // Se não há admins configurados, bloquear tudo
  if (ADMIN_UIDS.size === 0) {
    console.warn(
      '[SECURITY] Admin access attempted but no ADMIN_UID configured'
    );
    return false;
  }

  const uidHeader = headerToString(
    req.headers['x-admin-uid'] || req.headers['x-user-id']
  );
  const uidQuery = headerToString(req.query?.admin_uid as string);
  const candidate = uidHeader || uidQuery;

  // Validar UID
  if (!candidate) {
    return false;
  }

  return isValidAdminUID(candidate);
}

/**
 * Middleware para exigir autenticação admin
 * Inclui rate limiting e logging de segurança
 */
export function requireAdmin(
  req: GenericRequest,
  res: GenericResponse
): boolean {
  const clientIP = getClientIP(req);

  // Rate limiting
  if (isRateLimited(clientIP)) {
    console.warn(`[SECURITY] Rate limit exceeded for IP: ${clientIP}`);
    res.status(429).json({ error: 'Too many requests. Try again later.' });
    return false;
  }

  if (!isAdminRequest(req)) {
    console.warn(
      `[SECURITY] Unauthorized admin access attempt from IP: ${clientIP}`
    );
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

/**
 * Limpa registros antigos de rate limit (chamar periodicamente)
 */
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

/**
 * Limpa todos os registros de rate limit (para testes)
 * @internal
 */
export function _resetRateLimitForTesting(): void {
  rateLimitMap.clear();
}
