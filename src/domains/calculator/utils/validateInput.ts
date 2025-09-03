
export function validateNumericInput(value: string): boolean {
  // Allow empty string
  if (value === "") {return true;}
  // Allow numbers with comma or dot as decimal separator and leading zero
  return /^0*[0-9]{0,}([,.][0-9]*)?$/.test(value) && (!value.includes('-')) && !/[^\d.,]/.test(value);
}
