import { useEffect, useState } from 'react';

export const useOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Verificar se o onboarding já foi completado
    const completed = localStorage.getItem('azuria-onboarding-completed');
    const isComplete = completed === 'true';
    
    setIsOnboardingComplete(isComplete);
    
    // Se não foi completado e é um novo usuário, mostrar onboarding
    if (!isComplete) {
      // Delay para garantir que a página carregou
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  const completeOnboarding = () => {
    localStorage.setItem('azuria-onboarding-completed', 'true');
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('azuria-onboarding-completed');
    setIsOnboardingComplete(false);
    setShowOnboarding(true);
  };

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  return {
    isOnboardingComplete,
    showOnboarding,
    startOnboarding,
    completeOnboarding,
    resetOnboarding,
    closeOnboarding
  };
};