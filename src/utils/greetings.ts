/**
 * Retorna a saudação apropriada baseada no horário atual
 */
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
};

/**
 * Retorna saudação completa com nome do usuário
 */
export const getGreetingWithName = (name?: string): string => {
  const greeting = getTimeBasedGreeting();
  return name ? `${greeting}, ${name}` : greeting;
};

/**
 * Extrai o primeiro nome de um nome completo
 */
export const getFirstName = (fullName?: string | null): string => {
  if (!fullName || fullName.trim() === '') {
    return "";
  }
  return fullName.trim().split(" ")[0];
};
