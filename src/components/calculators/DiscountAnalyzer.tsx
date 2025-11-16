/**
 * Feature #6: Discount Analyzer Component
 * Interactive discount calculator with slider and real-time impact analysis
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Info,
  Percent,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useDiscountAnalyzer } from "@/hooks/useDiscountAnalyzer";
import { DISCOUNT_METADATA, type DiscountInput, type DiscountScenario } from "@/types/discountAnalyzer";
import { cn } from "@/lib/utils";

interface DiscountAnalyzerProps {
  input: DiscountInput;
}

export default function DiscountAnalyzer({ input }: DiscountAnalyzerProps) {
  const { analyzeDiscount, simulateDiscount, getPresetScenarios } = useDiscountAnalyzer();
  const [result, setResult] = useState<ReturnType<typeof analyzeDiscount> | null>(null);
  const [currentDiscount, setCurrentDiscount] = useState(0);
  const [simulation, setSimulation] = useState<DiscountScenario | null>(null);
  const [presetScenarios, setPresetScenarios] = useState<DiscountScenario[]>([]);
  const [selectedView, setSelectedView] = useState<"simulator" | "presets" | "recommendations">("simulator");

  useEffect(() => {
    const analysisResult = analyzeDiscount(input);
    setResult(analysisResult);

    const presets = getPresetScenarios(input);
    setPresetScenarios(presets);

    // Start at safe discount (20% of max)
    const initialDiscount = analysisResult.maxDiscountPercent * 0.2;
    setCurrentDiscount(initialDiscount);
    setSimulation(simulateDiscount(input, initialDiscount));
  }, [input, analyzeDiscount, simulateDiscount, getPresetScenarios]);

  // Update simulation when discount changes
  const handleDiscountChange = (value: number[]) => {
    const newDiscount = value[0];
    setCurrentDiscount(newDiscount);
    setSimulation(simulateDiscount(input, newDiscount));
  };

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
            <Tag className="h-6 w-6 text-blue-600" />
            Analisador de Descontos
          </h3>
          <p className="text-muted-foreground mt-1">
            Qual desconto posso dar sem perder dinheiro?
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Desconto Máximo: {result.maxDiscountPercent.toFixed(1)}%
        </Badge>
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
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="presets">Cenários</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-blue-600" />
                  Desconto Atual: {currentDiscount.toFixed(1)}%
                </span>
                {simulation && (
                  <Badge className={cn(
                    "text-base px-3 py-1",
                    DISCOUNT_METADATA[simulation.status].bgColor,
                    DISCOUNT_METADATA[simulation.status].textColor
                  )}>
                    {simulation.statusLabel}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slider */}
              <div className="space-y-4">
                <Slider
                  value={[currentDiscount]}
                  onValueChange={handleDiscountChange}
                  max={Math.min(result.maxDiscountPercent * 1.5, 100)}
                  step={0.5}
                  className="w-full"
                />
                
                {/* Range indicators */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span className="text-green-600 font-semibold">
                    Seguro: {result.safeRange.maxPercent.toFixed(0)}%
                  </span>
                  <span className="text-orange-600 font-semibold">
                    Máx: {result.maxDiscountPercent.toFixed(0)}%
                  </span>
                  <span>100%</span>
                </div>

                {/* Visual range bar */}
                <div className="h-2 rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className="absolute h-full bg-green-500"
                    style={{ width: `${(result.safeRange.maxPercent / 100) * 100}%` }}
                  />
                  <div
                    className="absolute h-full bg-yellow-500"
                    style={{
                      left: `${(result.safeRange.maxPercent / 100) * 100}%`,
                      width: `${((result.cautionRange.maxPercent - result.safeRange.maxPercent) / 100) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute h-full bg-orange-500"
                    style={{
                      left: `${(result.cautionRange.maxPercent / 100) * 100}%`,
                      width: `${((result.dangerRange.maxPercent - result.cautionRange.maxPercent) / 100) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute h-full bg-red-500"
                    style={{
                      left: `${(result.dangerRange.maxPercent / 100) * 100}%`,
                      width: `${((100 - result.dangerRange.maxPercent) / 100) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Simulation Results */}
              {simulation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <p className="text-sm text-muted-foreground">Preço Final</p>
                      </div>
                      <p className="text-2xl font-bold">
                        R$ {simulation.finalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Desconto: R$ {simulation.discountValue.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-muted-foreground">Lucro por Unidade</p>
                      </div>
                      <p className={cn(
                        "text-2xl font-bold",
                        simulation.profitPerUnit > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        R$ {simulation.profitPerUnit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Margem: {simulation.profitMargin.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                        <p className="text-sm text-muted-foreground">Redução no Lucro</p>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">
                        {simulation.profitLoss.toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        do lucro original
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Volume compensation */}
              {simulation && simulation.volumeIncreaseNeeded !== Infinity && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-900">
                      <strong> Para manter o mesmo lucro total:</strong> Você precisa aumentar o volume de vendas em{" "}
                      <span className="font-bold">{simulation.volumeIncreaseNeeded.toFixed(0)}%</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Compare diferentes níveis de desconto e seu impacto no lucro
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presetScenarios.map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "border-2",
                  DISCOUNT_METADATA[scenario.status].borderColor
                )}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{scenario.statusLabel}</CardTitle>
                      <Badge variant="outline" className="text-lg">
                        {scenario.discountPercent.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Preço Final</p>
                        <p className="text-xl font-bold">R$ {scenario.finalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lucro/Unidade</p>
                        <p className={cn(
                          "text-xl font-bold",
                          scenario.profitPerUnit > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          R$ {scenario.profitPerUnit.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Impacto no Lucro</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              scenario.status === "safe" && "bg-green-500",
                              scenario.status === "caution" && "bg-yellow-500",
                              scenario.status === "danger" && "bg-orange-500",
                              scenario.status === "loss" && "bg-red-500"
                            )}
                            style={{ width: `${Math.min(scenario.profitLoss, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          -{scenario.profitLoss.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setCurrentDiscount(scenario.discountPercent);
                        setSimulation(scenario);
                        setSelectedView("simulator");
                      }}
                    >
                      Aplicar este desconto
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Sugestões personalizadas de desconto baseadas em sua margem e mercado
          </p>

          <div className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{rec.icon}</span>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{rec.description}</CardTitle>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-base">
                            {rec.discountPercent.toFixed(1)}% OFF
                          </Badge>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {rec.finalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2"> Vantagens:</p>
                        <ul className="space-y-1">
                          {rec.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span></span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-700 mb-2"> Desvantagens:</p>
                        <ul className="space-y-1">
                          {rec.cons.map((con, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span></span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {
                        setCurrentDiscount(rec.discountPercent);
                        setSimulation(simulateDiscount(input, rec.discountPercent));
                        setSelectedView("simulator");
                      }}
                    >
                      Simular este desconto
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
