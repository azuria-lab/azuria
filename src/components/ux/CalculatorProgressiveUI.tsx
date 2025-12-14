import React from 'react';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { Brain, Calculator, Target, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const CalculatorProgressiveUI: React.FC = () => {
  const calculatorSections = [
    {
      id: 'basic-calculator',
      title: 'Calculadora Rápida',
      description: 'Cálculos essenciais de margem e markup',
      level: 'basic' as const,
      preview: (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Calculator className="h-4 w-4" />
          <span>Custo + Margem = Preço Final</span>
        </div>
      ),
      children: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Cálculo Simples
                </CardTitle>
                <CardDescription>
                  Insira o custo e a margem desejada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="cost-input" className="text-sm font-medium">Custo do Produto</label>
                    <input 
                      id="cost-input"
                      type="number" 
                      placeholder="R$ 0,00"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="margin-input" className="text-sm font-medium">Margem (%)</label>
                    <input 
                      id="margin-input"
                      type="number" 
                      placeholder="30%"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                    />
                  </div>
                  <Button className="w-full">Calcular Preço</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Custo:</span>
                    <span className="font-medium">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem:</span>
                    <span className="font-medium">R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Preço Final:</span>
                    <span className="text-green-600">R$ 0,00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'marketplace-calculator',
      title: 'Calculadora Marketplace',
      description: 'Incluindo taxas de plataformas e impostos',
      level: 'intermediate' as const,
      preview: (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Taxas de marketplace + Impostos integrados</span>
        </div>
      ),
      children: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Cálculos avançados considerando todas as taxas de marketplaces como Mercado Livre, 
            Amazon, B2W e impostos brasileiros.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Mercado Livre', 'Amazon', 'B2W'].map((marketplace) => (
              <Card key={marketplace}>
                <CardHeader>
                  <CardTitle className="text-base">{marketplace}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa da plataforma:</span>
                      <span>12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de pagamento:</span>
                      <span>3.5%</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total de taxas:</span>
                      <span>15.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'ai-calculator',
      title: 'Calculadora com IA',
      description: 'Precificação inteligente com análise de mercado',
      level: 'advanced' as const,
      preview: (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Brain className="h-4 w-4" />
          <span>IA analisa concorrência e sugere preços otimizados</span>
        </div>
      ),
      children: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise Inteligente de Preços
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Nossa IA analisa milhares de produtos similares em tempo real para sugerir 
              o preço ideal que maximiza suas vendas e lucro.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Preço Recomendado</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">R$ 89,90</div>
                    <p className="text-sm text-gray-600 mt-1">
                      +15% acima da média do mercado
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Potencial de Vendas</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">Alto</div>
                    <p className="text-sm text-gray-600 mt-1">
                      87% de probabilidade de conversão
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-primary to-secondary">
                <Brain className="h-4 w-4 mr-2" />
                Analisar com IA
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Análise de Concorrência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Preço médio: <span className="font-medium">R$ 78,50</span></div>
                  <div>Menor preço: <span className="font-medium">R$ 65,00</span></div>
                  <div>Maior preço: <span className="font-medium">R$ 95,00</span></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sazonalidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>Tendência: <span className="font-medium text-green-600">↗ Alta</span></div>
                  <div>Demanda: <span className="font-medium">85%</span></div>
                  <div>Melhor momento: <span className="font-medium">Agora</span></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Otimização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>ROI estimado: <span className="font-medium text-green-600">+28%</span></div>
                  <div>Margem: <span className="font-medium">42%</span></div>
                  <div>Competitividade: <span className="font-medium">Alta</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  return (
    <ProgressiveDisclosure
      sections={calculatorSections}
      title="Sistema de Precificação Azuria+"
      description="Comece com o básico e evolua para análises avançadas com IA conforme sua necessidade"
    />
  );
};