/**
 * API Validation Module
 * 
 * Funções de validação para inputs de API do Modo Deus.
 * Previne injection, XSS e dados malformados.
 */

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: unknown;
}

export interface ValidatorOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: string[];
  min?: number;
  max?: number;
  sanitize?: boolean;
}

export interface FieldValidator {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'uuid';
  options?: ValidatorOptions;
}

// ============================================================================
// Sanitization
// ============================================================================

/**
 * Remove caracteres perigosos de strings
 * Inclui caracteres de controle (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let result = input.trim();
  
  // Remove null bytes
  result = result.replaceAll('\0', '');
  
  // Escape HTML entities básicos
  result = result
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
  
  // Remove caracteres de controle (exceto newline \n=0x0A, carriage return \r=0x0D, tab \t=0x09)
  // eslint-disable-next-line no-control-regex
  result = result.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return result;
}

/**
 * Sanitiza para uso em logs (sem HTML escape, mas remove perigosos)
 */
export function sanitizeForLog(input: unknown): string {
  if (input === null || input === undefined) {
    return '';
  }
  const str = String(input).slice(0, 1000); // Limita tamanho
  
  // eslint-disable-next-line no-control-regex
  return str.replaceAll(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').replaceAll('\0', '');
}

// ============================================================================
// Validators
// ============================================================================

/**
 * Valida UUID v4
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Valida string
 */
export function validateString(
  value: unknown,
  options: ValidatorOptions = {}
): ValidationResult {
  const { required = true, minLength = 1, maxLength = 10000, pattern, sanitize = true } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, error: 'Required field is missing' };
    }
    return { valid: true, sanitized: '' };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Expected string' };
  }

  const sanitized = sanitize ? sanitizeString(value) : value;

  if (sanitized.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength}` };
  }

  if (sanitized.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength}` };
  }

  if (pattern && !pattern.test(sanitized)) {
    return { valid: false, error: 'Invalid format' };
  }

  return { valid: true, sanitized };
}

/**
 * Valida número
 */
export function validateNumber(
  value: unknown,
  options: ValidatorOptions = {}
): ValidationResult {
  const { required = true, min, max } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, error: 'Required field is missing' };
    }
    return { valid: true, sanitized: undefined };
  }

  const num = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (typeof num !== 'number' || Number.isNaN(num)) {
    return { valid: false, error: 'Expected number' };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `Minimum value is ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `Maximum value is ${max}` };
  }

  return { valid: true, sanitized: num };
}

/**
 * Valida enum
 */
export function validateEnum(
  value: unknown,
  allowedValues: string[],
  options: ValidatorOptions = {}
): ValidationResult {
  const { required = true } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, error: 'Required field is missing' };
    }
    return { valid: true, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: 'Expected string' };
  }

  if (!allowedValues.includes(value)) {
    return { valid: false, error: `Must be one of: ${allowedValues.join(', ')}` };
  }

  return { valid: true, sanitized: value };
}

/**
 * Valida UUID
 */
export function validateUUID(
  value: unknown,
  options: ValidatorOptions = {}
): ValidationResult {
  const { required = true } = options;

  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, error: 'Required field is missing' };
    }
    return { valid: true, sanitized: undefined };
  }

  if (!isValidUUID(value)) {
    return { valid: false, error: 'Invalid UUID format' };
  }

  return { valid: true, sanitized: value };
}

// ============================================================================
// Request Validators
// ============================================================================

/**
 * Valida body da request com schema
 */
export function validateRequestBody(
  body: unknown,
  validators: FieldValidator[]
): { valid: boolean; errors: Record<string, string>; data: Record<string, unknown> } {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};
  
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: { _body: 'Request body must be an object' }, data: {} };
  }

  const bodyObj = body as Record<string, unknown>;

  for (const validator of validators) {
    const value = bodyObj[validator.field];
    let result: ValidationResult;

    switch (validator.type) {
      case 'string':
        result = validateString(value, validator.options);
        break;
      case 'number':
        result = validateNumber(value, validator.options);
        break;
      case 'uuid':
        result = validateUUID(value, validator.options);
        break;
      case 'boolean':
        result = validateBooleanField(value, validator.options);
        break;
      default:
        result = { valid: true, sanitized: value };
    }

    if (result.valid) {
      data[validator.field] = result.sanitized;
    } else {
      errors[validator.field] = result.error || 'Invalid value';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

/**
 * Valida campo booleano (helper extraído para reduzir complexidade)
 */
function validateBooleanField(
  value: unknown,
  options?: ValidatorOptions
): ValidationResult {
  const isOptional = options?.required === false;
  const isNullish = value === null || value === undefined;

  if (isNullish) {
    if (isOptional) {
      return { valid: true, sanitized: undefined };
    }
    return { valid: false, error: 'Required field is missing' };
  }

  if (typeof value === 'boolean') {
    return { valid: true, sanitized: value };
  }

  return { valid: false, error: 'Expected boolean' };
}

/**
 * Valida query params
 */
export function validateQueryParams(
  query: Record<string, string | string[] | undefined>,
  validators: FieldValidator[]
): { valid: boolean; errors: Record<string, string>; data: Record<string, unknown> } {
  const errors: Record<string, string> = {};
  const data: Record<string, unknown> = {};

  for (const validator of validators) {
    let value = query[validator.field];
    // Query params podem ser arrays, pegar primeiro valor
    if (Array.isArray(value)) {
      value = value[0];
    }

    let result: ValidationResult;

    switch (validator.type) {
      case 'string':
        result = validateString(value, validator.options);
        break;
      case 'number':
        result = validateNumber(value, validator.options);
        break;
      case 'uuid':
        result = validateUUID(value, validator.options);
        break;
      default:
        result = { valid: true, sanitized: value };
    }

    if (!result.valid) {
      errors[validator.field] = result.error || 'Invalid value';
    } else if (result.sanitized !== undefined) {
      data[validator.field] = result.sanitized;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}
