
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Download, WifiOff } from "lucide-react";
import { usePWA } from "@/shared/hooks/usePWA";

export default function OfflineIndicator() {
  // Call hook unconditionally
  const pwaData = usePWA();
  const isOnline = pwaData?.isOnline ?? true;

  if (isOnline) {
    return null;
  }

  return (
    <Card className="mx-4 mb-4 border-yellow-200 bg-yellow-50">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">Modo Offline</p>
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
