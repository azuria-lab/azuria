
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CartesianGrid, 
  Line, 
  LineChart, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis 
} from "recharts";
import { Calculator } from "lucide-react";

interface SalesGoalsProjectionProps {
  sellingPrice: number;
  profitMargin: number;
  profitAmount: number;
  formatCurrency: (value: number) => string;
}

export default function SalesGoalsProjection({
  sellingPrice,
  profitMargin,
  profitAmount,
  formatCurrency
}: SalesGoalsProjectionProps) {
  const [monthlyGoal, setMonthlyGoal] = useState<number>(5000);
  
  // Calcular quantas unidades precisam ser vendidas para atingir a meta
  const unitsForGoal = sellingPrice > 0 ? Math.ceil(monthlyGoal / profitAmount) : 0;
  
  // Preparar dados para o gráfico
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const units = i + 1;
    const sales = units * sellingPrice;
    const profit = units * profitAmount;
    return {
      units,
      sales,
      profit
    };
  });
  
  // Adicionar o ponto específico da meta
  if (unitsForGoal > 0) {
    chartData.push({
      units: unitsForGoal,
      sales: unitsForGoal * sellingPrice,
      profit: unitsForGoal * profitAmount
    });
    
    // Ordenar por unidades
    chartData.sort((a, b) => a.units - b.units);
  }
  
  // Criar tabela de metas
  const goalsTable = [
    { name: "R$ 1.000", units: Math.ceil(1000 / profitAmount) },
    { name: "R$ 3.000", units: Math.ceil(3000 / profitAmount) },
    { name: "R$ 5.000", units: Math.ceil(5000 / profitAmount) },
    { name: "R$ 10.000", units: Math.ceil(10000 / profitAmount) },
    { name: "R$ 20.000", units: Math.ceil(20000 / profitAmount) },
  ];
  
  if (!sellingPrice || profitAmount <= 0) {return null;}
  
  return (
    <Card className="mt-6">
      <div className="bg-brand-50 p-3 border-b font-medium">
        <h3 className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Projeção de Vendas
        </h3>
      </div>
      <CardContent className="p-4 space-y-5">
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="space-y-2 flex-1">
              <Label htmlFor="monthlyGoal">Meta mensal de lucro (R$)</Label>
              <Input
                id="monthlyGoal"
                type="number"
                min="1000"
                step="1000"
                value={monthlyGoal}
                onChange={(e) => setMonthlyGoal(Number(e.target.value))}
              />
            </div>
            <div className="text-center space-y-1 min-w-[150px]">
              <p className="text-sm text-gray-600">Unidades necessárias</p>
              <div className="text-2xl font-bold text-brand-700">
                {unitsForGoal}
              </div>
              <p className="text-xs text-gray-500">Com {profitMargin.toFixed(0)}% de margem</p>
            </div>
          </div>
          
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="units"
                  label={{ value: 'Unidades', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${formatCurrency(value)}`}
                />
                <RechartsTooltip 
                  formatter={(value: number) => [`R$ ${formatCurrency(value)}`]}
                  labelFormatter={(value) => `${value} unidades`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3182CE" 
                  name="Vendas" 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#38A169" 
                  name="Lucro" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="border rounded-lg overflow-hidden mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meta mensal</TableHead>
                  <TableHead className="text-right">Unidades necessárias</TableHead>
                  <TableHead className="text-right">Faturamento total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goalsTable.map((goal) => (
                  <TableRow key={goal.name}>
                    <TableCell>{goal.name}</TableCell>
                    <TableCell className="text-right">{goal.units}</TableCell>
                    <TableCell className="text-right">R$ {formatCurrency(goal.units * sellingPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
