
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CompetitorData } from "@/types/realTimeMetrics";

interface CompetitorChartProps {
  data: CompetitorData[];
}

export default function CompetitorChart({ data }: CompetitorChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação com Concorrentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              <Line 
                type="monotone" 
                dataKey="nossoPreco" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Nosso Preço"
              />
              <Line 
                type="monotone" 
                dataKey="concorrente1" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Concorrente A"
              />
              <Line 
                type="monotone" 
                dataKey="concorrente2" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Concorrente B"
              />
              <Line 
                type="monotone" 
                dataKey="concorrente3" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Concorrente C"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
