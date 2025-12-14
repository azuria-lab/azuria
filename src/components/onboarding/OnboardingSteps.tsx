
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, SkipForward, X } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface OnboardingStepsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  step: OnboardingStep;
}

export default function OnboardingSteps({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  step
}: Readonly<OnboardingStepsProps>) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" />
      
      {/* Onboarding Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="border-brand-200 shadow-2xl bg-white dark:bg-gray-900">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array.from({ length: totalSteps }).map((_, index) => (
                        <div
                          key={`step-${step.id}-indicator-${index}`}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index <= currentStep 
                              ? 'bg-brand-600' 
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {currentStep + 1} de {totalSteps}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                    aria-label="Pular tour"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {step.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {step.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Step Content */}
                <div className="min-h-[200px]">
                  {step.content}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    {currentStep > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onPrevious}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onSkip}
                      className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
                    >
                      <SkipForward className="h-4 w-4" />
                      Pular
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={currentStep === totalSteps - 1 ? onComplete : onNext}
                      className="bg-brand-600 hover:bg-brand-700 flex items-center gap-2"
                    >
                      {currentStep === totalSteps - 1 ? (
                        "Finalizar Tour"
                      ) : (
                        <>
                          Próximo
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
