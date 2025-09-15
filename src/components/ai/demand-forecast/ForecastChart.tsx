
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";

interface ForecastData {
  period: string;
  demand: number;
  forecast?: boolean;
}

interface ForecastChartProps {
  forecastData: ForecastData[];
}

export default function ForecastChart({ forecastData }: ForecastChartProps) {
  const chartHistoricalData = forecastData.filter(d => !d.forecast);
  const forecastOnlyData = forecastData.filter(d => d.forecast);

  return (
    <div className="bg-white rounded-lg p-4 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700">Histórico vs Previsão</h4>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Calendar className="h-3 w-3 mr-1" />
            Histórico
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <TrendingUp className="h-3 w-3 mr-1" />
            Previsão
          </Badge>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, _name: string, item: unknown) => {
                const payload = (item as { payload?: ForecastData })?.payload;
                return [value, payload?.forecast ? 'Previsão' : 'Histórico'] as const;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              stroke="#3B82F6"
              strokeWidth={2}
              data={chartHistoricalData}
              dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="demand" 
              data={forecastOnlyData}
              stroke="#A855F7"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#A855F7", stroke: "#7C3AED", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
