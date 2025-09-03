// Optimized input component with debounce and memoization
import React, { memo, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";

interface OptimizedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  suffix?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
}

const OptimizedInput = memo<OptimizedInputProps>(({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  suffix,
  debounceMs = 300,
  disabled = false,
  className = ""
}) => {
  // Debounce the onChange to prevent excessive updates
  const debouncedOnChange = useCallback((newValue: string) => {
    const timeoutId = setTimeout(() => onChange(newValue), debounceMs);
    return () => clearTimeout(timeoutId);
  }, [onChange, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);

  // Memoize the input props to prevent unnecessary re-renders
  const inputProps = useMemo(() => ({
    type,
    value,
    onChange: handleChange,
    placeholder,
    disabled,
    className: `transition-all duration-200 ${className}`,
  }), [type, value, handleChange, placeholder, disabled, className]);

  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <Input
          id={label}
          {...inputProps}
          className={`${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${inputProps.className}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
});

OptimizedInput.displayName = "OptimizedInput";

export default OptimizedInput;