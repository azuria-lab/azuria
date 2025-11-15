/**
 * Tour Provider
 * 
 * Gerencia o tour guiado da aplicação
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Tour, TourContextType } from './types';
import { TOURS } from './tours';

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: Readonly<TourProviderProps>) {
  const [currentTour, setCurrentTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const endTour = useCallback(() => {
    if (currentTour) {
      const completedTours = JSON.parse(localStorage.getItem('azuria-completed-tours') || '[]');
      if (!completedTours.includes(currentTour.id)) {
        completedTours.push(currentTour.id);
        localStorage.setItem('azuria-completed-tours', JSON.stringify(completedTours));
      }
    }
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
  }, [currentTour]);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS.find((t: Tour) => t.id === tourId);
    if (tour) {
      setCurrentTour(tour);
      setCurrentStep(0);
      setIsActive(true);
      
      // Scroll to first element
      setTimeout(() => {
        const firstTarget = tour.steps[0]?.target;
        if (firstTarget) {
          const element = document.querySelector(firstTarget);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) {
      return;
    }

    if (currentStep < currentTour.steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      
      // Scroll to next element
      setTimeout(() => {
        const nextTarget = currentTour.steps[nextStepIndex]?.target;
        if (nextTarget) {
          const element = document.querySelector(nextTarget);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else {
      endTour();
    }
  }, [currentTour, currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      
      // Scroll to previous element
      if (currentTour) {
        setTimeout(() => {
          const prevTarget = currentTour.steps[prevStepIndex]?.target;
          if (prevTarget) {
            const element = document.querySelector(prevTarget);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [currentStep, currentTour]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, skipTour]);

  const contextValue = useMemo(() => ({
    currentTour,
    currentStep,
    isActive,
    startTour,
    nextStep,
    prevStep,
    endTour,
    skipTour,
    availableTours: TOURS
  }), [currentTour, currentStep, isActive, startTour, nextStep, prevStep, endTour, skipTour]);

  return (
    <TourContext.Provider value={contextValue}>
      {children}
    </TourContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTour(): TourContextType {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
}
