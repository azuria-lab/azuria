/**
 * Admin UID para uso no frontend
 * 
 * SECURITY: Deve ser configurado via variável de ambiente VITE_ADMIN_UID
 * O frontend usa isso para enviar nos headers das requisições admin
 */
export const ADMIN_UID_FRONT = import.meta.env.VITE_ADMIN_UID || '';

// Validação em dev para alertar sobre configuração faltando
if (!ADMIN_UID_FRONT && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[SECURITY WARNING] VITE_ADMIN_UID não configurado. ' +
    'Funcionalidades admin não estarão disponíveis.'
  );
}

/**
 * Verifica se o admin está configurado no frontend
 */
export function isAdminConfigured(): boolean {
  return ADMIN_UID_FRONT.length >= 32;
}

