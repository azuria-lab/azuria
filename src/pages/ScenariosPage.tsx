
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Calculator, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Scenario {
  id: string;
  name: string;
  cost: number;
  margin: number;
  tax: number;
  sellingPrice: number;
  profit: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [baseCost, setBaseCost] = useState(100);
  const [baseMargin, setBaseMargin] = useState([30]);
  const [baseTax, setBaseTax] = useState([10]);
  const [scenarioName, setScenarioName] = useState("");

  // Corrigido cálculo de preço (margem + desconto de imposto depois)
  const calculatePrice = (cost: number, margin: number, tax: number) => {
    // Primeiro aplica a margem, depois desconta impostos/taxas sobre o valor final
    const priceWithMargin = cost * (1 + margin / 100);
    const finalPrice = priceWithMargin * (1 - tax / 100);
    return finalPrice;
  };

  const addScenario = () => {
    if (!scenarioName.trim()) {
      toast.error("Digite um nome para o cenário");
      return;
    }

    const cost = baseCost;
    const margin = baseMargin[0];
    const tax = baseTax[0];
    const sellingPrice = calculatePrice(cost, margin, tax);
    const profit = sellingPrice - cost;

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: scenarioName,
      cost,
      margin,
      tax,
      sellingPrice,
      profit
    };

    setScenarios([...scenarios, newScenario]);
    setScenarioName("");
    toast.success("Cenário adicionado com sucesso!");
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
    toast.success("Cenário removido");
  };

  const bestScenario = scenarios.reduce((best, current) => 
    current.profit > best.profit ? current : best, 
    scenarios[0]
  );

  const worstScenario = scenarios.reduce((worst, current) => 
    current.profit < worst.profit ? current : worst, 
    scenarios[0]
  );

  return (
    <motion.div 
        className="container mx-auto py-8 px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cenários de Precificação</h1>
          <p className="text-gray-600">
            Simule diferentes combinações de custos, margens e impostos para encontrar a melhor estratégia de precificação.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuração de Cenário */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-brand-600" />
                  Novo Cenário
                </CardTitle>
                <CardDescription>
                  Configure os parâmetros para criar um novo cenário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scenario-name">Nome do Cenário</Label>
                  <Input
                    id="scenario-name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="Ex: Cenário Conservador"
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Custo do Produto (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={baseCost}
                    onChange={(e) => setBaseCost(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label>Margem de Lucro: {baseMargin[0]}%</Label>
                  <Slider
                    value={baseMargin}
                    onValueChange={setBaseMargin}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Impostos e Taxas: {baseTax[0]}%</Label>
                  <Slider
                    value={baseTax}
                    onValueChange={setBaseTax}
                    max={50}
                    min={0}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Preço de Venda Calculado:</p>
                  <p className="text-xl font-bold text-brand-600">
                    R$ {calculatePrice(baseCost, baseMargin[0], baseTax[0]).toFixed(2)}
                  </p>
                </div>

                <Button onClick={addScenario} className="w-full">
                  Adicionar Cenário
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Cenários */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-600" />
                  Cenários Comparados
                </CardTitle>
                <CardDescription>
                  Analise e compare os diferentes cenários criados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scenarios.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum cenário criado ainda.</p>
                    <p className="text-sm">Crie seu primeiro cenário ao lado para começar a comparação.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scenarios.map((scenario) => (
                      <div
                        key={scenario.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{scenario.name}</h3>
                            <p className="text-sm text-gray-600">
                              Custo: R$ {scenario.cost} | Margem: {scenario.margin}% | Impostos: {scenario.tax}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {scenario === bestScenario && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Melhor
                              </Badge>
                            )}
                            {scenario === worstScenario && scenarios.length > 1 && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                Pior
                              </Badge>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeScenario(scenario.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Preço de Venda</p>
                            <p className="text-lg font-semibold text-brand-600">
                              R$ {scenario.sellingPrice.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Lucro</p>
                            <p className="text-lg font-semibold text-green-600">
                              R$ {scenario.profit.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Resumo dos Cenários */}
        {scenarios.length > 0 && (
          <motion.div variants={itemVariants} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Melhor Cenário</p>
                    <p className="font-semibold">{bestScenario?.name}</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {bestScenario?.profit.toFixed(2)} lucro
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Lucro Médio</p>
                    <p className="text-lg font-bold text-blue-600">
                      R$ {(scenarios.reduce((sum, s) => sum + s.profit, 0) / scenarios.length).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Diferença</p>
                    <p className="text-lg font-bold text-orange-600">
                      R$ {(bestScenario?.profit - worstScenario?.profit || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
  );
}
