/**
 * Tour Button Component
 * 
 * Botão para iniciar um tour específico
 */

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTour } from './TourProvider';

interface TourButtonProps {
  tourId: string;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function TourButton({ 
  tourId, 
  label = 'Tour Guiado',
  variant = 'outline',
  size = 'default'
}: TourButtonProps) {
  const { startTour } = useTour();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => startTour(tourId)}
      className="gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      {label}
    </Button>
  );
}
