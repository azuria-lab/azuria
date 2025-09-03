
import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/utils/calculator/formatCurrency";

interface MarketplaceComparisonData {
  id: string;
  name: string;
  fee: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
}

interface MarketplaceComparisonChartProps {
  data: MarketplaceComparisonData[];
  bestOption: string;
}

export function MarketplaceComparisonChart({ data, bestOption }: MarketplaceComparisonChartProps) {
  // Preparamos os dados para o gráfico
  const chartData = data.map((item) => ({
    name: item.name,
    id: item.id,
    "Preço de Venda": parseFloat(item.sellingPrice.toFixed(2)),
    "Lucro Líquido": parseFloat(item.profit.toFixed(2)),
  }));

  // Cores para as barras
  const colors = {
    "Preço de Venda": "#64748b",
    "Lucro Líquido": "#0284c7"
  };

  // Função formatadora para os valores no tooltip
  const formatTooltipValue = (value: number) => `R$ ${formatCurrency(value)}`;

  return (
    <div className="w-full h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => `R$ ${formatCurrency(value)}`}
            width={80}
          />
          <Tooltip 
            formatter={formatTooltipValue}
            labelFormatter={(name) => `Marketplace: ${name}`}
          />
          <Legend />
          <Bar dataKey="Preço de Venda" fill={colors["Preço de Venda"]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.id === bestOption ? "#94a3b8" : colors["Preço de Venda"]}
                strokeWidth={entry.id === bestOption ? 2 : 0}
              />
            ))}
          </Bar>
          <Bar dataKey="Lucro Líquido" fill={colors["Lucro Líquido"]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.id === bestOption ? "#0ea5e9" : colors["Lucro Líquido"]}
                strokeWidth={entry.id === bestOption ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
