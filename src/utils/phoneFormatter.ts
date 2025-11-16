/**
 * Formata um número de telefone brasileiro
 * @param value - Valor do telefone (apenas números ou com formatação)
 * @returns Telefone formatado no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (DDD + número)
  const limited = numbers.slice(0, 11);
  
  // Aplica a formatação baseada na quantidade de dígitos
  if (limited.length <= 2) {
    return limited;
  }
  
  if (limited.length <= 6) {
    // (XX) XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  }
  
  if (limited.length <= 10) {
    // (XX) XXXX-XXXX
    return `(${limited.slice(0, 2)}) ${limited.slice(2, 6)}-${limited.slice(6)}`;
  }
  
  // (XX) XXXXX-XXXX (celular com 9 dígitos)
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7, 11)}`;
}

/**
 * Remove a formatação do telefone, mantendo apenas os números
 * @param value - Telefone formatado
 * @returns Apenas os números do telefone
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida se um telefone brasileiro está completo
 * @param value - Telefone (com ou sem formatação)
 * @returns true se o telefone tem 10 ou 11 dígitos
 */
export function isValidPhone(value: string): boolean {
  const numbers = unformatPhoneNumber(value);
  return numbers.length === 10 || numbers.length === 11;
}
