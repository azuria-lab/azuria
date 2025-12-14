import { useUserRoles } from './useUserRoles';

export function useUserPlan() {
  const { data: roles } = useUserRoles();

  // Determinar o role principal do usuário (pega o mais alto)
  const role = roles && roles.length > 0 ? roles[0].role : null;

  // Por enquanto, considera apenas se é free ou não
  // No futuro, implementar lógica completa de planos
  const isFreePlan = role === 'guest' || role === null;
  const isIniciante = role === 'member' || role === 'manager' || role === 'admin' || role === 'owner';
  const isPremium = role === 'admin' || role === 'owner';

  // Determinar plano atual
  let currentPlan: 'free' | 'iniciante' | 'premium';
  if (isFreePlan) {
    currentPlan = 'free';
  } else if (isPremium) {
    currentPlan = 'premium';
  } else {
    currentPlan = 'iniciante';
  }

  return {
    isFreePlan,
    isIniciante,
    isPremium,
    currentPlan,
  };
}
