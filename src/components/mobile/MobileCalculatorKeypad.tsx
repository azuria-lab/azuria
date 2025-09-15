
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileCalculatorKeypadProps {
  onNumberInput: (value: string) => void;
  onOperatorInput: (operator: string) => void;
  onClear: () => void;
  onCalculate: () => void;
  className?: string;
}

const keypadButtons = [
  ["C", "±", "%", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "="]
];

export default function MobileCalculatorKeypad({
  onNumberInput,
  onOperatorInput,
  onClear,
  onCalculate,
  className
}: MobileCalculatorKeypadProps) {
  
  const handleButtonPress = (value: string) => {
    // Adiciona feedback tátil se disponível
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (value === "C") {
      onClear();
    } else if (value === "=") {
      onCalculate();
    } else if (["+", "-", "×", "÷", "%"].includes(value)) {
      onOperatorInput(value);
    } else if (value === "±") {
      // Toggle sign
      onOperatorInput("±");
    } else {
      onNumberInput(value);
    }
  };

  const getButtonStyle = (value: string) => {
    if (value === "=") {
      return "bg-blue-600 hover:bg-blue-700 text-white col-span-1";
    }
    if (["+", "-", "×", "÷", "%", "±"].includes(value)) {
      return "bg-gray-200 hover:bg-gray-300 text-gray-800";
    }
    if (value === "C") {
      return "bg-red-100 hover:bg-red-200 text-red-700";
    }
    if (value === "0") {
      return "bg-gray-100 hover:bg-gray-200 text-gray-800 col-span-2";
    }
    return "bg-gray-100 hover:bg-gray-200 text-gray-800";
  };

  return (
    <div className={cn("grid grid-cols-4 gap-2 p-4", className)}>
      {keypadButtons.map((row, rowIndex) => (
        row.map((value, colIndex) => (
          <Button
            key={`${rowIndex}-${colIndex}`}
            onClick={() => handleButtonPress(value)}
            className={cn(
              "h-14 text-lg font-semibold rounded-xl transition-all duration-150",
              "active:scale-95 touch-manipulation",
              getButtonStyle(value)
            )}
            size="lg"
          >
            {value}
          </Button>
        ))
      ))}
    </div>
  );
}
