/**
 * Feature #5: Break-Even & ROI Calculator Component
 * Visual interface for break-even and ROI analysis
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  DollarSign,
  Info,
  Target,
  TrendingUp,
} from "lucide-react";
import { useBreakEvenROI } from "@/hooks/useBreakEvenROI";
import { BREAK_EVEN_SCENARIOS, type BreakEvenInput, type ROIScenario } from "@/types/breakEvenROI";
import { cn } from "@/lib/utils";

interface BreakEvenROIProps {
  input: BreakEvenInput;
}

export default function BreakEvenROI({ input }: BreakEvenROIProps) {
  const { calculateBreakEven, compareScenarios, generateMonthlyProjections } = useBreakEvenROI();
  const [result, setResult] = useState<ReturnType<typeof calculateBreakEven> | null>(null);
  const [scenarios, setScenarios] = useState<ROIScenario[]>([]);
  const [projections, setProjections] = useState<ReturnType<typeof generateMonthlyProjections>>([]);
  const [selectedView, setSelectedView] = useState<"summary" | "scenarios" | "timeline">("summary");

  useEffect(() => {
    const calculatedResult = calculateBreakEven(input);
    setResult(calculatedResult);

    if (input.averageDailySales && input.averageDailySales > 0) {
      const scenarioResults = compareScenarios(input);
      setScenarios(scenarioResults);

      const monthlyData = generateMonthlyProjections(input, 12);
      setProjections(monthlyData);
    }
  }, [input, calculateBreakEven, compareScenarios, generateMonthlyProjections]);

  if (!result) {
    return null;
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "danger": return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "success": return "bg-green-50 border-green-200 text-green-900";
      case "warning": return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "danger": return "bg-red-50 border-red-200 text-red-900";
      default: return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Break-Even & ROI
          </h3>
          <p className="text-muted-foreground mt-1">
            Quantas vendas você precisa para lucrar?
          </p>
        </div>
      </div>

      {/* Alerts */}
      {result.alerts && result.alerts.length > 0 && (
        <div className="space-y-2">
          {result.alerts.map((alert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn("p-3 rounded-lg border flex items-start gap-2 text-sm", getAlertColor(alert.type))}
            >
              {getAlertIcon(alert.type)}
              <p>{alert.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as typeof selectedView)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="timeline">Projeção</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Break-Even Units */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-muted-foreground">Ponto de Equilíbrio</p>
                </div>
                <p className="text-3xl font-bold">{result.breakEvenUnits}</p>
                <p className="text-sm text-muted-foreground mt-1">unidades/mês</p>
                {result.breakEvenDays !== null && (
                  <Badge variant="outline" className="mt-2">
                    {result.breakEvenDays} dias
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Unit Profit */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-muted-foreground">Lucro por Unidade</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  R$ {result.unitProfit.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Margem: {result.profitMargin.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            {/* ROI */}
            {result.roi !== null && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-medium text-muted-foreground">ROI Anual</p>
                  </div>
                  <p className={cn(
                    "text-3xl font-bold",
                    result.roi > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {result.roi > 0 ? "+" : ""}{result.roi.toFixed(0)}%
                  </p>
                  {result.monthlyROI !== null && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {result.monthlyROI.toFixed(1)}% ao mês
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payback Period */}
            {result.paybackPeriod !== null && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <p className="text-sm font-medium text-muted-foreground">Payback</p>
                  </div>
                  <p className="text-3xl font-bold">{result.paybackPeriod.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground mt-1">meses</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Target Achievement */}
          {result.unitsForTarget !== null && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Meta de Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas Necessárias</p>
                    <p className="text-2xl font-bold">{result.unitsForTarget} unidades</p>
                  </div>
                  {result.daysForTarget !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo Estimado</p>
                      <p className="text-2xl font-bold">{result.daysForTarget} dias</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-0.5"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Compare diferentes cenários de vendas e veja o impacto no break-even e ROI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario, index) => {
              const scenarioInfo = BREAK_EVEN_SCENARIOS.find(s => s.id === scenario.id);
              
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2" style={{ borderColor: scenario.color }}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{scenarioInfo?.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{scenario.label}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {scenario.dailySales.toFixed(1)} vendas/dia
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Break-Even</p>
                          <p className="text-xl font-bold">{scenario.result.breakEvenUnits} un</p>
                        </div>
                        {scenario.result.breakEvenDays !== null && (
                          <div>
                            <p className="text-xs text-muted-foreground">Tempo</p>
                            <p className="text-xl font-bold">{scenario.result.breakEvenDays} dias</p>
                          </div>
                        )}
                      </div>

                      {scenario.result.roi !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">ROI Anual</p>
                          <p className={cn(
                            "text-2xl font-bold",
                            scenario.result.roi > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {scenario.result.roi > 0 ? "+" : ""}{scenario.result.roi.toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          {projections.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Projeção mês a mês baseada em {input.averageDailySales} vendas/dia
              </p>

              <div className="space-y-2">
                {projections.map((proj, index) => (
                  <motion.div
                    key={proj.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "border-2",
                      proj.reachedBreakEven && "border-green-500 bg-green-50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Mês</p>
                              <p className="text-2xl font-bold">{proj.month}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Lucro Acumulado</p>
                              <p className={cn(
                                "text-xl font-bold",
                                proj.cumulativeProfit >= 0 ? "text-green-600" : "text-red-600"
                              )}>
                                R$ {proj.cumulativeProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">ROI</p>
                              <p className="text-lg font-semibold">
                                {proj.roi.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                          {proj.reachedBreakEven && !projections[index - 1]?.reachedBreakEven && (
                            <Badge className="bg-green-600">
                              <Target className="h-3 w-3 mr-1" />
                              Break-Even!
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Configure vendas médias diárias para ver a projeção temporal
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
