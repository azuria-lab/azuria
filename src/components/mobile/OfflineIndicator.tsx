
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Wifi, WifiOff } from "lucide-react";

export default function OfflineIndicator() {
  // Safe hook usage with error handling
  let isOnline = true;
  
  try {
    const { usePWA } = require('@/hooks/usePWA');
    const pwaData = usePWA();
    isOnline = pwaData?.isOnline ?? true;
  } catch (error) {
    console.log('PWA hook not available yet, defaulting to online');
    // Default to online if hook fails
    isOnline = true;
  }

  if (isOnline) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4 border-yellow-200 bg-yellow-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">
              Modo Offline
            </p>
            <p className="text-xs text-yellow-600">
              Suas calculadoras funcionam normalmente. Os dados serão sincronizados quando voltar online.
            </p>
          </div>
          <Download className="h-4 w-4 text-yellow-600" />
        </div>
      </CardContent>
    </Card>
  );
}
