
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Calculator, FileText, History, Home, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { icon: Home, label: "Início", path: "/" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Calculator, label: "Calcular", path: "/calculadora-simples" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Settings, label: "Config", path: "/configuracoes" }
];

export default function MobileNavigationBar() {
  const [routerReady, setRouterReady] = useState(false);

  // Safely get location with error handling
  let location = null;
  try {
    location = useLocation();
    if (!routerReady) {
      setRouterReady(true);
    }
  } catch (error) {
    console.log('Router context not ready yet');
  }

  // Render basic navigation without Link components until router is ready
  if (!routerReady) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navigationItems.map(({ icon: Icon, label, path }) => (
            <div
              key={path}
              className="flex flex-col items-center justify-center gap-1 text-xs text-gray-400"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </div>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="grid grid-cols-5 h-16">
        {navigationItems.map(({ icon: Icon, label, path }) => {
          const isActive = location?.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-blue-600 active:bg-gray-100"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
