
import React, { createContext, useContext, useEffect, useState } from "react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  placement?: "top" | "bottom" | "left" | "right";
  action?: () => void;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  isCompleted: boolean;
  showWelcomeOnboarding: boolean;
  setShowWelcomeOnboarding: (show: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Azuria! 🎉",
    description: "Vamos fazer um tour rápido pelas principais funcionalidades da sua plataforma de precificação inteligente.",
    target: "body",
    placement: "bottom"
  },
  {
    id: "calculator",
    title: "Calculadora de Preços",
    description: "Comece aqui para calcular o preço ideal dos seus produtos com inteligência artificial.",
    target: "[data-onboarding='calculator-button'], .nav-link:contains('Calculadora'), a[href='/calculator']",
    placement: "bottom"
  },
  {
    id: "ai-batch",
    title: "Lote Inteligente + IA",
    description: "Processe múltiplos produtos simultaneamente com nossa IA avançada.",
    target: "[data-onboarding='ai-batch-button'], .nav-link:contains('Lote'), a[href='/ai-batch']",
    placement: "bottom"
  },
  {
    id: "analytics",
    title: "Analytics Avançados",
    description: "Acompanhe suas métricas de performance e insights de mercado em tempo real.",
    target: "[data-onboarding='analytics-button'], .nav-link:contains('Analytics'), a[href='/analytics']",
    placement: "bottom"
  }
];

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWelcomeOnboarding, setShowWelcomeOnboarding] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeOnboarding = () => {
      if (!mounted) {return;}
      
      try {
        setIsReady(true);
        
        const completed = typeof window !== 'undefined' 
          ? localStorage.getItem("azuria-onboarding-completed")
          : null;
          
        if (!completed) {
          // Mostrar onboarding de boas-vindas para novos usuários
          const timer = setTimeout(() => {
            if (mounted) {
              setShowWelcomeOnboarding(true);
            }
          }, 1500); // Reduzido para ativar mais rápido
          return () => clearTimeout(timer);
        } else {
          setIsCompleted(true);
        }
      } catch (error) {
        console.error('Error initializing onboarding:', error);
        setIsReady(true);
        setIsCompleted(true);
      }
    };

    const initTimer = setTimeout(initializeOnboarding, 100);
    
    return () => {
      mounted = false;
      clearTimeout(initTimer);
    };
  }, []);

  const startOnboarding = () => {
    try {
      setIsActive(true);
      setCurrentStep(0);
      setShowWelcomeOnboarding(false);
    } catch (error) {
      console.error('Error starting onboarding:', error);
    }
  };

  const nextStep = () => {
    try {
      if (currentStep < ONBOARDING_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        completeOnboarding();
      }
    } catch (error) {
      console.error('Error in nextStep:', error);
    }
  };

  const prevStep = () => {
    try {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
    } catch (error) {
      console.error('Error in prevStep:', error);
    }
  };

  const skipOnboarding = () => {
    try {
      setIsActive(false);
      setShowWelcomeOnboarding(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem("azuria-onboarding-completed", "true");
      }
      setIsCompleted(true);
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const completeOnboarding = () => {
    try {
      setIsActive(false);
      setShowWelcomeOnboarding(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem("azuria-onboarding-completed", "true");
      }
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value = {
    isActive,
    currentStep,
    steps: ONBOARDING_STEPS,
    startOnboarding,
    nextStep,
    prevStep,
    skipOnboarding,
    completeOnboarding,
    isCompleted,
    showWelcomeOnboarding,
    setShowWelcomeOnboarding
  };

  if (!isReady) {
    return <>{children}</>;
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    return {
      isActive: false,
      currentStep: 0,
      steps: ONBOARDING_STEPS,
      startOnboarding: () => {},
      nextStep: () => {},
      prevStep: () => {},
      skipOnboarding: () => {},
      completeOnboarding: () => {},
      isCompleted: false,
      showWelcomeOnboarding: false,
      setShowWelcomeOnboarding: () => {}
    };
  }
  return context;
};
