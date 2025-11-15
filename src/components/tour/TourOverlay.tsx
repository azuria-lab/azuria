/**
 * Tour Overlay Component
 * 
 * Exibe a interface visual do tour guiado com spotlight no elemento alvo
 */

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from './TourProvider';

export function TourOverlay() {
  const { currentTour, currentStep, isActive, nextStep, prevStep, endTour, skipTour } = useTour();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Atualiza a posição do elemento alvo
  useEffect(() => {
    if (!isActive || !currentTour) {
      return;
    }

    const updateTargetPosition = () => {
      const step = currentTour.steps[currentStep];
      if (step) {
        const element = document.querySelector(step.target);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        }
      }
    };

    updateTargetPosition();

    // Atualiza quando a janela é redimensionada ou scrollada
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition, true);

    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition, true);
    };
  }, [isActive, currentTour, currentStep]);

  if (!isActive || !currentTour) {
    return null;
  }

  const step = currentTour.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === currentTour.steps.length - 1;

  // Calcula a posição do tooltip
  const getTooltipPosition = () => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const placement = step.placement || 'bottom';
    const offset = 16;

    switch (placement) {
      case 'top':
        return {
          top: `${targetRect.top - offset}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: `${targetRect.bottom + offset}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - offset}px`,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + offset}px`,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: `${targetRect.bottom + offset}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translate(-50%, 0)'
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <>
      {/* Backdrop escurecido */}
      <div className="fixed inset-0 bg-black/50 z-[9998] pointer-events-none" />

      {/* Spotlight no elemento alvo */}
      {targetRect && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            transition: 'all 0.3s ease-in-out'
          }}
        />
      )}

      {/* Tooltip com conteúdo do tour */}
      <div
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4"
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Passo {currentStep + 1} de {currentTour.steps.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar tour</span>
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300">
            {step.content}
          </p>
        </div>

        {/* Footer com navegação */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-1">
            {currentTour.steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : index < currentStep
                    ? 'bg-blue-300 dark:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            )}

            {!isLastStep ? (
              <Button
                size="sm"
                onClick={nextStep}
                className="gap-1"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={endTour}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Concluir Tour
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
