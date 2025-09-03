
import { cn } from "@/lib/utils";
import React from "react";

interface FieldGroupProps {
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function FieldGroup({ children, className, ...props }: FieldGroupProps) {
  return (
    <fieldset
      className={cn(
        "bg-white rounded-lg px-3 py-2 mb-2 shadow-sm border border-gray-100 space-y-2",
        className
      )}
      {...props}
    >
      {children}
    </fieldset>
  );
}
