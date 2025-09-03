
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calculator, Save } from "lucide-react";
import { motion } from "framer-motion";

interface Scenario {
  name: string;
  costVariation: number;
  marginVariation: number;
  taxVariation: number;
  result: number | null;
}

interface ScenarioSimulatorProps {
  basePrice: number;
  baseCost: number;
  baseMargin: number;
  baseTax: number;
  onSaveScenario?: (scenario: Scenario) => void;
}

export default function ScenarioSimulator({
  basePrice,
  baseCost,
  baseMargin,
  baseTax,
  onSaveScenario,
}: ScenarioSimulatorProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { name: "Pessimista", costVariation: 10, marginVariation: -5, taxVariation: 2, result: null },
    { name: "Otimista", costVariation: -5, marginVariation: 2, taxVariation: -1, result: null },
  ]);
  
  const [activeScenario, setActiveScenario] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [scenarioName, setScenarioName] = useState<string>("");
  
  const calculateScenarioPrice = (scenario: Scenario) => {
    // Ajustar custo e taxa com as variações
    const adjustedCost = baseCost * (1 + scenario.costVariation / 100);
    const adjustedMargin = baseMargin + scenario.marginVariation;
    const adjustedTax = baseTax + scenario.taxVariation;
    
    // Cálculo similar ao usado na calculadora principal
    const divisor = 1 - (adjustedMargin / 100) - (adjustedTax / 100);
    return adjustedCost / (divisor > 0 ? divisor : 0.01);
  };
  
  const updateScenarioResults = () => {
    const updatedScenarios = scenarios.map(scenario => ({
      ...scenario,
      result: calculateScenarioPrice(scenario)
    }));
    setScenarios(updatedScenarios);
  };
  
  React.useEffect(() => {
    if (basePrice > 0) {
      updateScenarioResults();
    }
  }, [basePrice, baseCost, baseMargin, baseTax]);
  
  const addNewScenario = () => {
    if (!scenarioName.trim()) {return;}
    
    const newScenario: Scenario = {
      name: scenarioName,
      costVariation: 0,
      marginVariation: 0, 
      taxVariation: 0,
      result: null
    };
    
    const updatedScenarios = [...scenarios, newScenario];
    setScenarios(updatedScenarios);
    setActiveScenario(updatedScenarios.length - 1);
    setScenarioName("");
    setIsEditMode(false);
    
    // Calcular resultado
    setTimeout(() => updateScenarioResults(), 10);
  };
  
  const updateCurrentScenario = (field: keyof Scenario, value: number) => {
    const updatedScenarios = [...scenarios];
    updatedScenarios[activeScenario] = {
      ...updatedScenarios[activeScenario],
      [field]: value
    };
    setScenarios(updatedScenarios);
    
    // Recalcular o resultado
    updatedScenarios[activeScenario].result = calculateScenarioPrice(updatedScenarios[activeScenario]);
  };
  
  const saveCurrentScenario = () => {
    if (onSaveScenario) {
      onSaveScenario(scenarios[activeScenario]);
    }
  };

  if (!basePrice) {return null;}

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="bg-brand-50 p-3 border-b font-medium flex justify-between items-center">
        <h3 className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Simulador de Cenários
        </h3>
        <div className="flex gap-2">
          {isEditMode ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Nome do cenário"
                className="px-2 py-1 text-sm border rounded"
              />
              <Button 
                size="sm"
                variant="outline"
                onClick={addNewScenario}
              >
                Adicionar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditMode(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditMode(true)}
            >
              Novo Cenário
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {scenarios.map((scenario, index) => (
            <Button
              key={index}
              variant={activeScenario === index ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveScenario(index)}
              className={`whitespace-nowrap ${
                activeScenario === index ? "bg-brand-600" : ""
              }`}
            >
              {scenario.name}
            </Button>
          ))}
        </div>
        
        {scenarios[activeScenario] && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Variação no Custo</Label>
                  <span className={scenarios[activeScenario].costVariation > 0 ? "text-red-500" : "text-green-600"}>
                    {scenarios[activeScenario].costVariation > 0 ? "+" : ""}
                    {scenarios[activeScenario].costVariation}%
                  </span>
                </div>
                <Slider
                  value={[scenarios[activeScenario].costVariation]}
                  min={-20}
                  max={20}
                  step={1}
                  onValueChange={(value) => updateCurrentScenario("costVariation", value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Variação na Margem</Label>
                  <span className={scenarios[activeScenario].marginVariation > 0 ? "text-green-600" : "text-red-500"}>
                    {scenarios[activeScenario].marginVariation > 0 ? "+" : ""}
                    {scenarios[activeScenario].marginVariation}%
                  </span>
                </div>
                <Slider
                  value={[scenarios[activeScenario].marginVariation]}
                  min={-10}
                  max={10}
                  step={0.5}
                  onValueChange={(value) => updateCurrentScenario("marginVariation", value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Variação nos Impostos</Label>
                  <span className={scenarios[activeScenario].taxVariation > 0 ? "text-red-500" : "text-green-600"}>
                    {scenarios[activeScenario].taxVariation > 0 ? "+" : ""}
                    {scenarios[activeScenario].taxVariation}%
                  </span>
                </div>
                <Slider
                  value={[scenarios[activeScenario].taxVariation]}
                  min={-5}
                  max={5}
                  step={0.5}
                  onValueChange={(value) => updateCurrentScenario("taxVariation", value[0])}
                />
              </div>
            </div>
            
            <motion.div 
              className="flex justify-between items-center p-4 rounded-lg bg-brand-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={scenarios[activeScenario].result || 'loading'}
            >
              <div>
                <p className="text-sm text-gray-600">Preço Simulado:</p>
                <p className="text-xl font-bold text-brand-700">
                  R$ {(scenarios[activeScenario].result || 0).toFixed(2).replace(".", ",")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Comparado com o preço base:</p>
                {scenarios[activeScenario].result && (
                  <p className={`font-semibold ${
                    scenarios[activeScenario].result > basePrice ? "text-green-600" : "text-red-500"
                  }`}>
                    {scenarios[activeScenario].result > basePrice ? "+" : ""}
                    {((scenarios[activeScenario].result - basePrice) / basePrice * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </motion.div>
            
            <Button 
              className="w-full flex items-center gap-2 mt-2" 
              variant="outline"
              onClick={saveCurrentScenario}
            >
              <Save className="h-4 w-4" />
              Salvar este Cenário
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
