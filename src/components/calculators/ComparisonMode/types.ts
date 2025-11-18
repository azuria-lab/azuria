/**
 * Tipos para ComparisonMode
 */

export interface ComparisonModeProps {
  onClose?: () => void;
}

export interface ComparisonResult {
  marketplace: string;
  price: number;
  margin: number;
  profit: number;
  fees: number;
}

