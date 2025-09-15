
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  units: number;
  sales: number;
  profit: number;
}

interface ProjectionChartProps {
  chartData: ChartDataPoint[];
  formatCurrency: (value: number) => string;
}

export default function ProjectionChart({ chartData, formatCurrency }: ProjectionChartProps) {
  return (
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
          <Tooltip 
            formatter={(value: number) => [`R$ ${formatCurrency(value)}`]}
            labelFormatter={(value) => `${value} unidades`}
          />
          <Line 
            type="monotone" 
            dataKey="sales" 
            name="Faturamento" 
            stroke="#3182CE" 
            strokeWidth={2} 
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            name="Lucro" 
            stroke="#38A169" 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
