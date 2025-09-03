
import React from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SeasonalData {
  month: string;
  sales: number;
  seasonalIndex: number;
  trend: number;
  icon: React.ReactNode;
}

interface SeasonalityChartsProps {
  analysisData: SeasonalData[];
}

export default function SeasonalityCharts({ analysisData }: SeasonalityChartsProps) {
  return (
    <>
      {/* Gráfico de Índice Sazonal */}
      <div className="bg-white rounded-lg p-6 border border-green-100">
        <h4 className="font-semibold text-gray-700 mb-4">Índice de Sazonalidade por Mês</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  `${(value * 100).toFixed(0)}%`,
                  'Índice Sazonal'
                ]}
              />
              <Bar 
                dataKey="seasonalIndex" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Vendas Históricas */}
      <div className="bg-white rounded-lg p-6 border border-green-100">
        <h4 className="font-semibold text-gray-700 mb-4">Vendas por Mês (Últimos 12 meses)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analysisData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [
                  `${value} unidades`,
                  'Vendas'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
