
import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import VolumeControls from "./simulator/VolumeControls";
import ProjectionSummary from "./simulator/ProjectionSummary";
import ProjectionChart from "./simulator/ProjectionChart";
import ScenariosTable from "./simulator/ScenariosTable";
import GoalSimulator from "./simulator/GoalSimulator";

interface SalesVolumeSimulatorProps {
  sellingPrice: number;
  profit: number;
  formatCurrency: (value: number) => string;
}

export default function SalesVolumeSimulator({
  sellingPrice,
  profit,
  formatCurrency,
}: SalesVolumeSimulatorProps) {
  const [salesVolume, setSalesVolume] = useState<number>(10);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(5000);
  
  // Calcular valores com base no volume
  const totalSales = sellingPrice * salesVolume;
  const totalProfit = profit * salesVolume;
  const profitMargin = (profit / sellingPrice) * 100;
  
  // Calcular unidades necessárias para meta
  const unitsForGoal = monthlyGoal > 0 && profit > 0 
    ? Math.ceil(monthlyGoal / profit) 
    : 0;
  
  // Dados para o gráfico
  const chartData = Array.from({ length: Math.max(20, salesVolume + 5) }, (_, i) => {
    const units = i + 1;
    return {
      units,
      sales: units * sellingPrice,
      profit: units * profit,
    };
  });
  
  // Projeções para tabela
  const volumeScenarios = [
    { name: "Vendas Baixas", multiplier: 0.5, volume: Math.round(salesVolume * 0.5) },
    { name: "Vendas Esperadas", multiplier: 1, volume: salesVolume },
    { name: "Vendas Altas", multiplier: 1.5, volume: Math.round(salesVolume * 1.5) },
    { name: "Vendas Excelentes", multiplier: 2, volume: Math.round(salesVolume * 2) },
  ];

  return (
    <Card className="mt-6">
      <CardHeader className="bg-brand-50 p-3 border-b">
        <h3 className="flex items-center gap-2 font-medium">
          <TrendingUp className="h-4 w-4" />
          Simulador de Volume de Vendas
        </h3>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {/* Controle de Volume */}
        <VolumeControls 
          salesVolume={salesVolume} 
          setSalesVolume={setSalesVolume} 
        />
        
        {/* Resumo das Projeções */}
        <ProjectionSummary 
          totalSales={totalSales}
          totalProfit={totalProfit}
          salesVolume={salesVolume}
          profitMargin={profitMargin}
          profit={profit}
          formatCurrency={formatCurrency}
        />
        
        {/* Gráfico de Projeção */}
        <ProjectionChart 
          chartData={chartData}
          formatCurrency={formatCurrency}
        />
        
        {/* Tabela de Cenários */}
        <ScenariosTable 
          scenarios={volumeScenarios}
          sellingPrice={sellingPrice}
          profit={profit}
          formatCurrency={formatCurrency}
        />
        
        {/* Meta de Lucro */}
        <GoalSimulator 
          monthlyGoal={monthlyGoal}
          setMonthlyGoal={setMonthlyGoal}
          profit={profit}
          unitsForGoal={unitsForGoal}
        />
      </CardContent>
    </Card>
  );
}
