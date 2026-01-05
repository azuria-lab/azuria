/**
 * MarginSection
 * 
 * Seção para margem de lucro (adaptada da Calculadora Rápida)
 * Design limpo estilo Apple
 */

import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface MarginSectionProps {
  margin: number;
  onMarginChange: (value: number) => void;
}

const getMarginColor = (margin: number) => {
  if (margin >= 30) {return 'text-green-600 dark:text-green-500';}
  if (margin >= 20) {return 'text-blue-600 dark:text-blue-500';}
  if (margin >= 10) {return 'text-cyan-600 dark:text-cyan-500';}
  return 'text-slate-600 dark:text-slate-400';
};

const getMarginIconColor = (margin: number) => {
  if (margin >= 30) {return 'text-green-500';}
  if (margin >= 20) {return 'text-blue-500';}
  if (margin >= 10) {return 'text-cyan-500';}
  return 'text-slate-500';
};

const getMarginBorderColor = (margin: number) => {
  if (margin >= 30) {return 'border-l-green-500';}
  if (margin >= 20) {return 'border-l-blue-500';}
  if (margin >= 10) {return 'border-l-cyan-500';}
  return 'border-l-slate-500';
};

const getMarginStatus = (margin: number) => {
  if (margin >= 30) {return 'Excelente';}
  if (margin >= 20) {return 'Boa';}
  if (margin >= 10) {return 'Adequada';}
  return 'Baixa';
};

export default function MarginSection({ margin, onMarginChange }: MarginSectionProps) {
  return (
    <Card className={`border-l-4 ${getMarginBorderColor(margin)}`}>
      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md border ${
              margin >= 30 ? 'bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-800' :
              margin >= 20 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-800' :
              margin >= 10 ? 'bg-cyan-50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-800' :
              'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
            }`}>
              <TrendingUp className={`h-4 w-4 ${getMarginIconColor(margin)}`} />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Margem de Lucro</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Defina a margem de lucro desejada para o cálculo
              </p>
            </div>
          </div>

          {/* Margin Display */}
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className={`text-2xl sm:text-3xl font-semibold ${getMarginColor(margin)}`}>
                {margin}%
              </span>
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 ${getMarginColor(margin)} bg-opacity-5 dark:bg-opacity-10`}>
                {getMarginStatus(margin)}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <Slider
                value={[margin]}
                onValueChange={(values) => onMarginChange(values[0])}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
