
import { motion } from "framer-motion";

interface ProjectionSummaryProps {
  totalSales: number;
  totalProfit: number;
  salesVolume: number;
  profitMargin: number;
  profit: number;
  formatCurrency: (value: number) => string;
}

export default function ProjectionSummary({
  totalSales,
  totalProfit,
  salesVolume,
  profitMargin,
  profit,
  formatCurrency
}: ProjectionSummaryProps) {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-brand-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600">Faturamento Total</p>
        <p className="text-xl font-bold text-brand-700">
          R$ {formatCurrency(totalSales)}
        </p>
        <p className="text-xs text-gray-500">Com {salesVolume} unidades</p>
      </div>
      
      <div className="bg-green-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600">Lucro Total</p>
        <p className="text-xl font-bold text-green-700">
          R$ {formatCurrency(totalProfit)}
        </p>
        <p className="text-xs text-gray-500">Margem de {profitMargin.toFixed(1)}%</p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-600">Lucro por Unidade</p>
        <p className="text-xl font-bold text-blue-700">
          R$ {formatCurrency(profit)}
        </p>
        <p className="text-xs text-gray-500">Por item vendido</p>
      </div>
    </motion.div>
  );
}
