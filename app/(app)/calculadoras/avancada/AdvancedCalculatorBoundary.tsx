"use client";
import React from 'react';
import AdvancedCalculator from '@/components/calculators/AdvancedCalculator';

interface AdvancedBoundaryProps { userId?: string }

// Boundary client para a calculadora avançada unificada.
export function AdvancedCalculatorBoundary({ userId }: AdvancedBoundaryProps) {
  return <AdvancedCalculator userId={userId} />;
}
