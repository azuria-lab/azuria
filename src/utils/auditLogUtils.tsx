
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calculator, Database, Settings, Shield, User } from "lucide-react";

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'auth': return <User className="h-4 w-4" />;
    case 'calculation': return <Calculator className="h-4 w-4" />;
    case 'settings': return <Settings className="h-4 w-4" />;
    case 'data': return <Database className="h-4 w-4" />;
    case 'security': return <Shield className="h-4 w-4" />;
    default: return <Shield className="h-4 w-4" />;
  }
};

export const getRiskBadge = (risk: string) => {
  const variants = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800", 
    high: "bg-red-100 text-red-800"
  };
  
  const labels = {
    low: "Baixo",
    medium: "Médio",
    high: "Alto"
  };

  return (
    <Badge className={variants[risk as keyof typeof variants]}>
      {labels[risk as keyof typeof labels]}
    </Badge>
  );
};
