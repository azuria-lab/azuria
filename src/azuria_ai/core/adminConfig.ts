/**
 * Admin UID Configuration
 * 
 * SECURITY: O UID de admin DEVE ser configurado via variável de ambiente.
 * Nunca usar fallback hardcoded em produção.
 */

// Lista de UIDs de admin permitidos (suporta múltiplos admins)
// Usar import.meta.env para Vite (browser) 
const ADMIN_UIDS_ENV = import.meta.env.VITE_ADMIN_UIDS || import.meta.env.VITE_ADMIN_UID || '';

// Parse da lista de UIDs (separados por vírgula)
export const ADMIN_UIDS: Set<string> = new Set(
  ADMIN_UIDS_ENV.split(',')
    .map(uid => uid.trim())
    .filter(uid => uid.length > 0 && uid.length >= 32) // UUID tem 36 chars, mínimo 32 sem hífens
);

// Compatibilidade: exportar primeiro UID como ADMIN_UID
export const ADMIN_UID = ADMIN_UIDS.size > 0 
  ? Array.from(ADMIN_UIDS)[0] 
  : '';

// Validação em runtime - alertar se não configurado
if (ADMIN_UIDS.size === 0) {
  console.warn(
    '[SECURITY WARNING] ADMIN_UID/ADMIN_UIDS não configurado. ' +
    'Defina a variável de ambiente ADMIN_UID ou ADMIN_UIDS para habilitar acesso admin.'
  );
}

/**
 * Verifica se um UID é um admin válido
 */
export function isValidAdminUID(uid: string | null | undefined): boolean {
  if (!uid || uid.length < 32) {return false;}
  return ADMIN_UIDS.has(uid);
}

