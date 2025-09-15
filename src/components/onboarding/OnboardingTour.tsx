import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calculator, CheckCircle, Target, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector do elemento alvo
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  icon?: React.ReactNode;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: OnboardingStep[];
  onComplete?: () => void;
}

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Azuria! 🎉',
    description: 'Vamos fazer um tour rápido para você dominar nossa calculadora de preços inteligente.',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'calculator-cost',
    title: 'Insira o custo do produto',
    description: 'Comece digitando quanto custa para você produzir ou comprar o item.',
    target: '[data-onboarding="cost-input"]',
    position: 'bottom',
    icon: <Calculator className="h-5 w-5" />
  },
  {
    id: 'calculator-margin',
    title: 'Defina sua margem de lucro',
    description: 'Use o slider para ajustar qual porcentagem de lucro você deseja.',
    target: '[data-onboarding="margin-slider"]',
    position: 'top',
    icon: <Zap className="h-5 w-5" />
  },
  {
    id: 'calculator-taxes',
    title: 'Configure taxas (opcional)',
    description: 'Adicione impostos, taxas de cartão e outros custos para um cálculo mais preciso.',
    target: '[data-onboarding="tax-section"]',
    position: 'left'
  },
  {
    id: 'calculate-button',
    title: 'Calcule o preço ideal',
    description: 'Clique em "Calcular Preço" para ver sua margem de lucro otimizada.',
    target: '[data-onboarding="calculate-button"]',
    position: 'top',
    action: 'click'
  },
  {
    id: 'results',
    title: 'Analise os resultados',
    description: 'Veja o preço sugerido, lucro estimado e análise de competitividade.',
    target: '[data-onboarding="results-section"]',
    position: 'top'
  },
  {
    id: 'templates',
    title: 'Use templates prontos',
    description: 'Economize tempo com templates pré-configurados para diferentes tipos de produto.',
    target: '[data-onboarding="template-selector"]',
    position: 'bottom'
  },
  {
    id: 'complete',
    title: 'Parabéns! 🚀',
    description: 'Agora você está pronto para precificar seus produtos como um profissional. Explore os recursos PRO para funcionalidades avançadas!',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  steps,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<Element | null>(null);
  const { toast } = useToast();

  // Use default steps if none provided or if an empty array is passed
  const effectiveSteps: OnboardingStep[] = (steps && steps.length > 0) ? steps : defaultSteps;

  useEffect(() => {
    if (!isOpen) {return;}

    const step = effectiveSteps[currentStep];
    if (step?.target) {
      const element = document.querySelector(step.target);
      if (element) {
        setHighlightElement(element);
        
        // Scroll suave para o elemento
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    } else {
      setHighlightElement(null);
    }
  }, [currentStep, isOpen, effectiveSteps]);

  useEffect(() => {
    if (!isOpen || !highlightElement) {return;}

    // Adicionar classe de destaque
    highlightElement.classList.add('onboarding-highlight');
    
    return () => {
      highlightElement.classList.remove('onboarding-highlight');
    };
  }, [isOpen, highlightElement]);

  if (!isOpen) {return null;}

  const currentStepData = effectiveSteps[currentStep];
  const progress = effectiveSteps.length > 0 ? (((currentStep + 1) / effectiveSteps.length) * 100) : 0;

  const handleNext = () => {
    if (currentStep < effectiveSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('azuria-onboarding-completed', 'true');
  onClose();
    toast({
      title: "Tour ignorado",
      description: "Você pode reativar o tour nas configurações a qualquer momento.",
    });
  };

  const handleComplete = () => {
    localStorage.setItem('azuria-onboarding-completed', 'true');
    onComplete?.();
    onClose();
    toast({
      title: "🎉 Parabéns!",
      description: "Você completou o tour. Agora está pronto para usar o Azuria!",
    });
  };

  const getTooltipPosition = (): React.CSSProperties => {
    if (!highlightElement || !currentStepData?.target) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999
      };
    }

    const rect = highlightElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const gap = 16;

    let top = rect.top;
    let left = rect.left;

  switch (currentStepData.position) {
      case 'top':
        top = rect.top - tooltipHeight - gap;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + gap;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + gap;
        break;
      default:
        top = rect.bottom + gap;
        left = rect.left;
    }

    // Ajustar para não sair da tela
    top = Math.max(gap, Math.min(window.innerHeight - tooltipHeight - gap, top));
    left = Math.max(gap, Math.min(window.innerWidth - tooltipWidth - gap, left));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
      width: `${tooltipWidth}px`
    };
  };

  // If for some reason there are no steps to render, don't crash
  if (!currentStepData) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
        onClick={handleSkip}
      />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          style={getTooltipPosition()}
          className="z-[9999]"
        >
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentStepData.icon}
                  <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {currentStep + 1} de {effectiveSteps.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Progress value={progress} className="mt-2" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStepData.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                  >
                    Pular tour
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {currentStep === effectiveSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                    {currentStep < effectiveSteps.length - 1 && (
                      <ArrowRight className="h-4 w-4 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* CSS para o highlight */}
      <style>{`
        .onboarding-highlight {
          position: relative;
          z-index: 9999;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};