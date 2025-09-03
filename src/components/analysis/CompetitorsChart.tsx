
import React from "react";
import { 
  ChartContainer, 
  ChartLegendContent,
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

interface Competitor {
  id: string;
  store: string;
  price: number;
  marketplace: string;
  productUrl: string;
  productType: "Original" | "Similar" | "Genérico";
  isCheapest?: boolean;
  isRecommended?: boolean;
}

interface CompetitorsChartProps {
  competitors: Competitor[];
}

export default function CompetitorsChart({ competitors }: CompetitorsChartProps) {
  const data = competitors.map(comp => ({
    name: comp.store,
    price: comp.price,
    marketplace: comp.marketplace,
    type: comp.productType
  }));
  
  // Colors handled by Bar props; keep helper for future customization
  // const getBarColor = (type: string): string => {
  //   switch (type) {
  //     case "Original":
  //       return "#3b82f6";  // blue-500
  //     case "Similar":
  //       return "#8b5cf6";  // purple-500
  //     case "Genérico":
  //       return "#f97316";  // orange-500
  //     default:
  //       return "#6b7280";  // gray-500
  //   }
  // };

  const config = {
    price: { label: "Preço" }
  };
  
  return (
    <div className="w-full h-80 mt-4">
      <ChartContainer config={config}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            height={60}
            tickMargin={8}
            interval={0}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={80}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip
            content={
              <ChartTooltipContent
                formatter={(value, _name) => [`R$ ${Number(value).toFixed(2)}`, "Preço"]}
                labelFormatter={(name) => name}
              />
            }
          />
          <Legend 
            content={
              <ChartLegendContent 
                className="py-4" 
                verticalAlign="top"
              />
            } 
          />
          <Bar 
            dataKey="price" 
            name="Preço" 
            fill="#3b82f6"
            fillOpacity={0.8}
            stroke="#3b82f6"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
