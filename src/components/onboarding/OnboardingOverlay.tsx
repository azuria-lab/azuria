
import React, { useCallback, useEffect, useState } from "react";
import { useOnboarding } from "./OnboardingProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, SkipForward, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const OnboardingOverlay: React.FC = () => {
  const { isActive, currentStep, steps, nextStep, prevStep, skipOnboarding } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isReady, setIsReady] = useState(false);

  const currentStepData = steps[currentStep];

  const findTargetWithRetry = useCallback(async (target: string, maxRetries = 10): Promise<HTMLElement | null> => {
    // Support multiple selectors separated by comma
    const selectors = target.split(',').map(s => s.trim());
    
    for (let i = 0; i < maxRetries; i++) {
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector) as HTMLElement;
          if (element && element.offsetParent !== null) { // Check if element is visible
            return element;
          }
        } catch (e) {
          // Invalid selector, try next one
          continue;
        }
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.warn(`Onboarding: Could not find any target element from: ${target}`);
    return null;
  }, []);

  const calculatePosition = useCallback((element: HTMLElement, placement: string = 'bottom') => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;

    // Adjust position based on placement with better positioning
    switch (placement) {
      case "bottom":
        top += rect.height + 20;
        left += rect.width / 2;
        break;
      case "top":
        top -= 20;
        left += rect.width / 2;
        break;
      case "right":
        top += rect.height / 2;
        left += rect.width + 20;
        break;
      case "left":
        top += rect.height / 2;
        left -= 20;
        break;
      default:
        top += rect.height + 20;
        left += rect.width / 2;
    }

    return { top, left };
  }, []);

  useEffect(() => {
    if (!isActive || !currentStepData) {
      setIsReady(false);
      return;
    }

    const setupTarget = async () => {
      setIsReady(false);
      
      try {
        const element = await findTargetWithRetry(currentStepData.target);
        
        if (element) {
          setTargetElement(element);
          
          // Ensure element is in viewport before positioning
          element.scrollIntoView({ 
            behavior: "smooth", 
            block: "center",
            inline: "center"
          });
          
          // Wait for scroll to complete before positioning
          setTimeout(() => {
            const newPosition = calculatePosition(element, currentStepData.placement);
            setPosition(newPosition);
            
            // Add highlight class for better visibility
            element.classList.add('onboarding-highlight');
            setIsReady(true);
          }, 500); // Wait for scroll animation
          
        } else {
          // If specific element not found, position modal in center of screen
          console.warn(`Element not found for step ${currentStep}, showing centered modal`);
          setTargetElement(null);
          setPosition({ 
            top: window.innerHeight / 2 - 150, 
            left: window.innerWidth / 2 - 150 
          });
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error setting up onboarding target:', error);
        // Fallback to center position
        setPosition({ 
          top: window.innerHeight / 2 - 150, 
          left: window.innerWidth / 2 - 150 
        });
        setIsReady(true);
      }
    };

    setupTarget();

    const handleResize = () => {
      if (targetElement) {
        const newPosition = calculatePosition(targetElement, currentStepData.placement);
        setPosition(newPosition);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      // Clean up highlight class
      if (targetElement) {
        targetElement.classList.remove('onboarding-highlight');
      }
    };
  }, [isActive, currentStep, currentStepData, findTargetWithRetry, calculatePosition, nextStep, targetElement]);

  if (!isActive || !currentStepData || !isReady) {return null;}

  return (
    <>
      {/* Enhanced backdrop with gradient */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 z-40 backdrop-blur-sm" 
        onClick={skipOnboarding} 
      />
      
      {/* Enhanced spotlight effect - only show if target element exists */}
      {targetElement && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.3 }}
          className="fixed pointer-events-none z-45"
          style={{
            top: targetElement.getBoundingClientRect().top - 8,
            left: targetElement.getBoundingClientRect().left - 8,
            width: targetElement.getBoundingClientRect().width + 16,
            height: targetElement.getBoundingClientRect().height + 16,
            boxShadow: `
              0 0 0 4px hsl(var(--primary) / 0.8),
              0 0 0 8px hsl(var(--primary) / 0.4),
              0 0 0 9999px rgba(0, 0, 0, 0.6)
            `,
            borderRadius: "12px",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        />
      )}

      {/* Modern onboarding card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          className="fixed z-50 max-w-sm"
          style={{
            top: Math.min(Math.max(position.top, 20), window.innerHeight - 250),
            left: Math.min(Math.max(position.left - 150, 20), window.innerWidth - 370),
            transform: targetElement ? 'none' : 'translate(-50%, -50%)', // Center if no target
          }}
        >
          <Card className="border-2 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-md dark:bg-background/90">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-3 h-3 bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground font-medium">
                    {currentStep + 1} de {steps.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipOnboarding}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Pular tour"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {currentStepData.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={prevStep} className="transition-all duration-200">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={skipOnboarding}
                    className="transition-all duration-200"
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Pular
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={nextStep} 
                    className="bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
                    {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};
