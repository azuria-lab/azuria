import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, Play, Star, Target, X, Zap } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
  completion?: {
    check: () => boolean;
    instruction: string;
  };
}

export function OnboardingSystem() {
  const [isActive, setIsActive] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<string>>(new Set());
  const [isMinimized, setIsMinimized] = React.useState(false);

  const steps: OnboardingStep[] = React.useMemo(() => [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Azuria+',
      description: 'Sua plataforma completa de precificação inteligente. Vamos começar sua jornada!',
      icon: <Star className="w-6 h-6" />,
      action: {
        text: 'Vamos começar!',
        onClick: () => setCurrentStep((s) => s + 1)
      }
    },
    {
      id: 'calculator',
      title: 'Calculadora IA',
      description: 'Use nossa calculadora inteligente para precificar seus produtos com precisão.',
      icon: <Target className="w-6 h-6" />,
      completion: {
        check: () => localStorage.getItem('first_calculation') === 'true',
        instruction: 'Faça seu primeiro cálculo na Calculadora IA'
      },
      action: {
        text: 'Ir para Calculadora',
        onClick: () => window.location.href = '/calculator'
      }
    },
    {
      id: 'ai-chat',
      title: 'Assistente IA',
      description: 'Converse com nossa IA especializada em precificação para obter insights personalizados.',
      icon: <Zap className="w-6 h-6" />,
      completion: {
        check: () => localStorage.getItem('first_ai_chat') === 'true',
        instruction: 'Inicie uma conversa com o Assistente IA'
      },
      action: {
        text: 'Abrir Chat IA',
        onClick: () => {
          const event = new CustomEvent('open-ai-chat');
          window.dispatchEvent(event);
        }
      }
    },
    {
      id: 'profile',
      title: 'Complete seu Perfil',
      description: 'Configure suas preferências e informações do negócio para recomendações mais precisas.',
      icon: <CheckCircle className="w-6 h-6" />,
      completion: {
        check: () => localStorage.getItem('profile_completed') === 'true',
        instruction: 'Complete as informações do seu perfil'
      },
      action: {
        text: 'Ir para Perfil',
        onClick: () => window.location.href = '/profile'
      }
    }
  ], []);

  const completeOnboarding = React.useCallback(() => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsActive(false);
    const event = new CustomEvent('onboarding-completed');
    window.dispatchEvent(event);
  }, []);

  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasSeenOnboarding) {
      setIsActive(true);
    }

    const completed = new Set<string>();
    steps.forEach(step => {
      if (step.completion?.check()) {
        completed.add(step.id);
      }
    });
    setCompletedSteps(completed);

    const interval = setInterval(() => {
      const currentStepData = steps[currentStep];
      if (currentStepData?.completion?.check() && !completedSteps.has(currentStepData.id)) {
        setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
        setTimeout(() => {
          setCurrentStep((s) => {
            if (s < steps.length - 1) {return s + 1;}
            completeOnboarding();
            return s;
          });
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, completedSteps, steps, completeOnboarding]);

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsActive(false);
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const isStepCompleted = completedSteps.has(currentStepData?.id);

  if (!isActive) {return null;}

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative ${isMinimized ? 'w-80' : 'w-full max-w-2xl'}`}
        >
          <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-lg border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <Play className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h2 className="font-semibold text-lg">Tour Guiado</h2>
                  <p className="text-sm text-muted-foreground">
                    Passo {currentStep + 1} de {steps.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? 'Expandir' : 'Minimizar'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipOnboarding}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <div className="p-6">
                {/* Progress */}
                <div className="mb-6">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepData.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={isStepCompleted ? { scale: [1, 1.2, 1] } : {}}
                        className={`p-3 rounded-full transition-colors ${
                          isStepCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {isStepCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          currentStepData.icon
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl mb-2">
                          {currentStepData.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {currentStepData.description}
                        </p>
                        
                        {currentStepData.completion && !isStepCompleted && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-yellow-800">
                              📝 {currentStepData.completion.instruction}
                            </p>
                          </div>
                        )}
                        
                        {isStepCompleted && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4"
                          >
                            <p className="text-sm text-green-800">
                              ✅ Passo concluído! Parabéns!
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex gap-2">
                        {currentStepData.action && !isStepCompleted && (
                          <Button
                            onClick={currentStepData.action.onClick}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            {currentStepData.action.text}
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => {
                            if (currentStep === steps.length - 1) {
                              completeOnboarding();
                            } else {
                              setCurrentStep((s) => s + 1);
                            }
                          }}
                          variant={isStepCompleted ? "default" : "outline"}
                          disabled={currentStepData.completion && !isStepCompleted}
                        >
                          {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* Minimized View */}
            {isMinimized && (
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">{currentStep + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{currentStepData.title}</p>
                    <Progress value={progressPercentage} className="h-1 mt-1" />
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}