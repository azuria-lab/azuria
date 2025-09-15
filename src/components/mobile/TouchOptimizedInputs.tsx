
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TouchOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function TouchOptimizedInputs({
  label,
  error,
  success,
  icon,
  className,
  type = "text",
  onFocus,
  onBlur,
  ...props
}: TouchOptimizedInputProps) {
  
  const getKeyboardType = () => {
    switch (type) {
      case "number":
        return { inputMode: "decimal" as const, pattern: "[0-9]*" };
      case "tel":
        return { inputMode: "tel" as const, pattern: "[0-9]*" };
      case "email":
        return { inputMode: "email" as const };
      case "url":
        return { inputMode: "url" as const };
      default:
        return {};
    }
  };

  const keyboardProps = getKeyboardType();

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Scroll into view on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 300);
    }
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    
    onFocus?.();
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label 
          htmlFor={props.id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <Input
          type={type}
          className={cn(
            // Larger touch targets for mobile
            "h-12 text-base transition-all duration-200",
            // Improved focus states
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            // Better visual feedback
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            success && "border-green-500 focus:ring-green-500 focus:border-green-500",
            // Icon padding
            icon && "pl-10",
            className
          )}
          onFocus={handleFocus}
          onBlur={onBlur}
          {...keyboardProps}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
      
      {success && (
        <p className="text-sm text-green-600 animate-fade-in">
          {success}
        </p>
      )}
    </div>
  );
}
