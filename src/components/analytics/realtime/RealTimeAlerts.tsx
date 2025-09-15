import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RealTimeAlerts() {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚨 Alertas e Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">✅ Performance Alta</h4>
            <p className="text-sm text-green-700">
              47 usuários online simultaneamente - novo recorde da semana!
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">📈 Crescimento</h4>
            <p className="text-sm text-blue-700">
              Aumento de 12% no número de usuários online vs. mesmo horário ontem.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">💰 Conversão</h4>
            <p className="text-sm text-purple-700">
              2 upgrades PRO nas últimas 10 minutos. Taxa de conversão em alta!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}