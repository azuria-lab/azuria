
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Dados mockados para demonstração
const pricingData = [
  { month: "Jan", cost: 100, price: 175, profit: 75, minPrice: 115 },
  { month: "Fev", cost: 110, price: 190, profit: 80, minPrice: 127 },
  { month: "Mar", cost: 105, price: 195, profit: 90, minPrice: 121 },
  { month: "Abr", cost: 120, price: 205, profit: 85, minPrice: 138 },
  { month: "Mai", cost: 125, price: 215, profit: 90, minPrice: 144 },
  { month: "Jun", cost: 130, price: 230, profit: 100, minPrice: 150 },
  { month: "Jul", cost: 120, price: 225, profit: 105, minPrice: 138 },
];

export default function PricingChart() {
  return (
    <Card className="border-brand-100">
      <CardHeader>
        <CardTitle>Tendência de Preços e Margem</CardTitle>
        <CardDescription>
          Evolução de custos, preços e lucros nos últimos 7 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={pricingData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return `R$ ${value.toFixed(2)}`;
                  }
                  return `R$ ${value}`;
                }}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <ReferenceLine
                stroke="#f97316"
                strokeDasharray="3 3"
                strokeWidth={1}
                ifOverflow="extendDomain"
                segment={[
                  { x: 'Jan', y: pricingData[0].minPrice },
                  { x: 'Jul', y: pricingData[6].minPrice }
                ]}
                label={{ value: 'Preço Mínimo', position: 'insideTopRight', fill: '#f97316', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="price"
                name="Preço de Venda"
                stroke="#3b82f6"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                name="Custo"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="profit"
                name="Lucro"
                stroke="#22c55e"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
