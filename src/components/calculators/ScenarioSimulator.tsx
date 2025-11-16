/**
 * Component: ScenarioSimulator - VERSÃO PREMIUM
 * Interface visual completa para criar e comparar cenários de precificação
 */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftRight,
  BarChart3, 
  CheckCircle2,
  Copy, 
  Edit2, 
  Lightbulb, 
  Plus, 
  Trash2,
} from "lucide-react";
import { useScenarioSimulator } from "@/hooks/useScenarioSimulator";
import type { ScenarioInput } from "@/types/scenarioSimulator";
import { SCENARIO_COLORS, SCENARIO_TEMPLATES } from "@/types/scenarioSimulator";
import { cn } from "@/lib/utils";

interface ScenarioSimulatorProps {
  baseScenario: Omit<ScenarioInput, "id" | "name" | "color">;
}

export default function ScenarioSimulator({ baseScenario }: ScenarioSimulatorProps) {
  const { compareScenarios } = useScenarioSimulator();
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([
    { id: "1", name: "Cenário Base", color: SCENARIO_COLORS[0], ...baseScenario },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addScenario = (template?: typeof SCENARIO_TEMPLATES[0]) => {
    const newId = (scenarios.length + 1).toString();
    const colorIndex = scenarios.length % SCENARIO_COLORS.length;
    const newScenario: ScenarioInput = {
      id: newId,
      name: template ? template.name : `Cenário ${newId}`,
      color: SCENARIO_COLORS[colorIndex],
      ...baseScenario,
      ...(template?.adjustments || {}),
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) {
      return;
    }
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  const updateScenario = (id: string, updates: Partial<ScenarioInput>) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const duplicateScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (!scenario) {
      return;
    }
    const newId = (scenarios.length + 1).toString();
    const colorIndex = scenarios.length % SCENARIO_COLORS.length;
    setScenarios([...scenarios, { ...scenario, id: newId, name: `${scenario.name} (Cópia)`, color: SCENARIO_COLORS[colorIndex] }]);
  };

  const comparison = scenarios.length > 0 ? compareScenarios(scenarios) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
            Simulador de Cenários
          </h3>
          <p className="text-gray-600 mt-1">
            Compare diferentes estratégias de precificação lado a lado
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {scenarios.length} {scenarios.length === 1 ? 'cenário' : 'cenários'}
        </Badge>
      </div>

      {/* Quick Templates */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Templates Rápidos
          </CardTitle>
          <CardDescription>
            Adicione cenários pré-configurados para análise rápida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SCENARIO_TEMPLATES.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => addScenario(template)}
                className="h-auto py-3 flex flex-col items-start gap-1 hover:bg-blue-100 hover:border-blue-400 transition-all"
              >
                <span className="font-semibold text-sm">{template.icon} {template.name}</span>
                <span className="text-xs text-gray-600">{template.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {comparison?.scenarios.map((result, index) => {
            const isBest = index === 0;
            const scenario = scenarios.find(s => s.id === result.id);
            
            return (
              <motion.div
                key={result.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  isBest && "ring-2 ring-green-500 shadow-xl"
                )}>
                  {/* Best Badge */}
                  {isBest && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white shadow-lg">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Melhor Opção
                      </Badge>
                    </div>
                  )}

                  {/* Color Bar */}
                  <div 
                    className="h-2 w-full" 
                    style={{ backgroundColor: scenario?.color || SCENARIO_COLORS[0] }}
                  />

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === result.id ? (
                          <Input
                            value={scenario?.name || ''}
                            onChange={(e) => updateScenario(result.id, { name: e.target.value })}
                            onBlur={() => setEditingId(null)}
                            autoFocus
                            className="h-8 text-lg font-bold"
                          />
                        ) : (
                          <CardTitle 
                            className="text-xl flex items-center gap-2 cursor-pointer hover:text-blue-600"
                            onClick={() => setEditingId(result.id)}
                          >
                            {result.name}
                            <Edit2 className="h-4 w-4 opacity-0 hover:opacity-100" />
                          </CardTitle>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Main Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Preço Final</p>
                        <p className="text-xl font-bold text-blue-600">
                          R$ {result.finalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Lucro Líquido</p>
                        <p className="text-xl font-bold text-green-600">
                          R$ {result.netProfit.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Margem</p>
                        <p className="text-xl font-bold text-purple-600">
                          {result.effectiveMargin.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Secondary Metrics */}
                    {result.monthlyProfit && (
                      <div className="space-y-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Receita Mensal</span>
                          <span className="font-semibold">R$ {result.monthlyRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Lucro Mensal</span>
                          <span className="font-semibold text-green-700">R$ {result.monthlyProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {result.roi && (
                          <div className="flex items-center justify-between pt-2 border-t border-green-200">
                            <span className="text-sm font-semibold text-green-800">ROI</span>
                            <span className="font-bold text-green-700">{result.roi.toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateScenario(result.id)}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicar
                      </Button>
                      {scenarios.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeScenario(result.id)}
                          className="text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Scenario Button */}
      {scenarios.length < 4 && (
        <Button
          onClick={() => addScenario()}
          className="w-full h-16 text-lg border-2 border-dashed"
          variant="outline"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Novo Cenário
        </Button>
      )}

      {/* Comparison Summary */}
      {comparison && scenarios.length > 1 && (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-700" />
              Resumo Comparativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Melhor Preço</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {comparison.bestScenario.finalPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{comparison.bestScenario.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Maior Lucro</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {comparison.bestScenario.netProfit.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{comparison.bestScenario.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Melhor Margem</p>
                <p className="text-2xl font-bold text-purple-600">
                  {comparison.bestScenario.effectiveMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">{comparison.bestScenario.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
