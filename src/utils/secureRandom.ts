/**
 * Secure random utilities to replace Math.random() usage
 * Addresses CodeQL security alerts about insecure randomness
 */

/**
 * Generates a cryptographically secure random string
 * @param length - Length of the generated string
 * @returns Secure random string
 */
export function generateSecureId(length: number = 9): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Use Web Crypto API for secure randomness
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').slice(0, length);
  }
  
  // Fallback for environments without crypto (should not happen in modern browsers)
  return Math.random().toString(36).substr(2, length);
}

/**
 * Generates a secure session ID
 * @returns Secure session ID with timestamp
 */
export function generateSecureSessionId(): string {
  return `session_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure message ID
 * @returns Secure message ID with timestamp
 */
export function generateSecureMessageId(): string {
  return `msg_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure alert ID
 * @returns Secure alert ID with timestamp
 */
export function generateSecureAlertId(): string {
  return `alert_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure forecast ID
 * @returns Secure forecast ID with timestamp
 */
export function generateSecureForecastId(): string {
  return `forecast_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure rule ID
 * @returns Secure rule ID with timestamp
 */
export function generateSecureRuleId(): string {
  return `rule_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure promotion ID
 * @returns Secure promotion ID with timestamp
 */
export function generateSecurePromotionId(): string {
  return `promo_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure backup ID
 * @returns Secure backup ID with timestamp
 */
export function generateSecureBackupId(): string {
  return `backup_${Date.now()}_${generateSecureId(9)}`;
}

/**
 * Generates a secure anonymous ID
 * @returns Secure anonymous ID
 */
export function generateSecureAnonymousId(): string {
  return `anon_${generateSecureId(9)}`;
}

/**
 * Generates a secure random number between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Cryptographically secure random number
 */
export function generateSecureRandomNumber(min: number, max: number): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const range = max - min + 1;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % range);
  }
  
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a secure random percentage (0-100)
 * @returns Secure random percentage
 */
export function generateSecureRandomPercentage(): number {
  return generateSecureRandomNumber(0, 100);
}