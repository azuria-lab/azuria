/**
 * Product Tour Types
 */

export interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
  spotlightClicks?: boolean;
}

export interface Tour {
  id: string;
  name: string;
  steps: TourStep[];
  completedAt?: string;
}

export interface TourContextType {
  currentTour: Tour | null;
  currentStep: number;
  isActive: boolean;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  skipTour: () => void;
  availableTours: Tour[];
}
