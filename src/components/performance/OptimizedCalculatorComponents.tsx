
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/calculator/formatCurrency";
import { CalculationResult } from "@/types/simpleCalculator";

// Componente otimizado para inputs da calculadora
interface OptimizedCalculatorInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

export const OptimizedCalculatorInput = React.memo<OptimizedCalculatorInputProps>(({
  label,
  value,
  onChange,
  placeholder,
  type = "text"
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={`input-${label.toLowerCase()}`}>{label}</Label>
      <Input
        id={`input-${label.toLowerCase()}`}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-lg"
      />
    </div>
  );
});

OptimizedCalculatorInput.displayName = "OptimizedCalculatorInput";

// Componente otimizado para resultados
interface OptimizedResultDisplayProps {
  result: CalculationResult | null;
  isLoading: boolean;
}

export const OptimizedResultDisplay = React.memo<OptimizedResultDisplayProps>(({
  result,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 h-24 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Calculando...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-gray-50 h-24 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Insira os valores para calcular</span>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="text-2xl font-bold text-green-800">
        {formatCurrency(result.sellingPrice)}
      </div>
      <div className="text-sm text-green-600">
        Lucro: {formatCurrency(result.profit)} 
        {result.isHealthyProfit ? " ✅" : " ⚠️"}
      </div>
    </div>
  );
});

OptimizedResultDisplay.displayName = "OptimizedResultDisplay";

// Componente otimizado para botões de ação
interface OptimizedActionButtonsProps {
  onCalculate: () => void;
  onReset: () => void;
  onSave?: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

export const OptimizedActionButtons = React.memo<OptimizedActionButtonsProps>(({
  onCalculate,
  onReset,
  onSave,
  isLoading,
  hasResult
}) => {
  return (
    <div className="flex gap-3">
      <Button
        onClick={onCalculate}
        disabled={isLoading}
        className="flex-1 bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {isLoading ? "Calculando..." : "Calcular"}
      </Button>
      
      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
      >
        Limpar
      </Button>
      
      {hasResult && onSave && (
        <Button
          onClick={onSave}
          variant="secondary"
          size="lg"
        >
          Salvar
        </Button>
      )}
    </div>
  );
});

OptimizedActionButtons.displayName = "OptimizedActionButtons";
