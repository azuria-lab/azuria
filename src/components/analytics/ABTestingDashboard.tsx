
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useABTesting } from '@/hooks/useABTesting';
import { Beaker, Target, TrendingUp, Users } from 'lucide-react';

export const ABTestingDashboard: React.FC = () => {
  const { getActiveTests, getTestResults, trackConversion } = useABTesting();
  type VariantStat = {
    id: string;
    name: string;
    weight: number;
    assignments: number;
    conversions: number;
    conversionRate: number;
  };

  type TestResult = {
    id: string;
    name: string;
    description?: string;
    active: boolean;
    totalAssignments: number;
    totalConversions: number;
    variants: VariantStat[];
  };

  type ABTestMeta = {
    id: string;
    name: string;
    active: boolean;
    description?: string;
  };
  
  const activeTests = getActiveTests() as ABTestMeta[];
  const testResults = getTestResults() as TestResult[];

  const handleTestConversion = (testId: string) => {
    trackConversion(testId, 'manual_conversion');
  };

  const getWinningVariant = (test: TestResult): VariantStat => {
    return test.variants.reduce<VariantStat>((winner, current) => 
      current.conversionRate > winner.conversionRate ? current : winner
    , test.variants[0]);
  };

  const getStatisticalSignificance = (variantA: VariantStat, variantB: VariantStat) => {
    // Simple statistical significance calculation
    const totalA = variantA.assignments;
    const totalB = variantB.assignments;
    const convA = variantA.conversions;
    const convB = variantB.conversions;
    
    if (totalA < 30 || totalB < 30) {return 'Insuficiente';}
    
    const pA = convA / totalA;
    const pB = convB / totalB;
    const diff = Math.abs(pA - pB);
    
    if (diff > 0.05 && Math.min(convA, convB) > 5) {return 'Significativo';}
    if (diff > 0.02) {return 'Promissor';}
    return 'Não significativo';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Beaker className="h-6 w-6" />
          A/B Testing Dashboard
        </h2>
        <Badge variant="outline">
          {activeTests.length} testes ativos
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Testes Ativos</p>
                <p className="text-2xl font-bold">{activeTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">
                  {testResults.reduce((sum, test) => sum + test.totalAssignments, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Conversões</p>
                <p className="text-2xl font-bold">
                  {testResults.reduce((sum, test) => sum + test.totalConversions, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Taxa Média</p>
                <p className="text-2xl font-bold">
                  {testResults.length > 0 
                    ? (testResults.reduce((sum, test) => 
                        sum + (test.totalAssignments > 0 ? (test.totalConversions / test.totalAssignments) * 100 : 0)
                      , 0) / testResults.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {testResults.map((test) => {
          const winningVariant = getWinningVariant(test);
          const significance = test.variants.length >= 2 
            ? getStatisticalSignificance(test.variants[0], test.variants[1])
            : 'N/A';

          return (
            <Card key={test.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={test.active ? "default" : "secondary"}>
                      {test.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{significance}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total de Usuários</p>
                      <p className="font-semibold">{test.totalAssignments}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Conversões</p>
                      <p className="font-semibold">{test.totalConversions}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {test.variants.map((variant) => (
                      <div key={variant.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{variant.name}</span>
                            {variant.id === winningVariant.id && variant.conversionRate > 0 && (
                              <Badge variant="default" className="text-xs">
                                🏆 Melhor
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-mono">
                            {variant.conversionRate.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <Progress 
                            value={variant.conversionRate} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{variant.assignments} usuários</span>
                            <span>{variant.conversions} conversões</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConversion(test.id)}
                      className="w-full"
                    >
                      Simular Conversão
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar os A/B Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">1. Hook useABTesting</h4>
                <code className="text-sm bg-white p-2 rounded block">
                  const {`{ getVariant }`} = useABTesting();<br/>
                  const variant = getVariant('test_id');
                </code>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">2. Renderização Condicional</h4>
                <code className="text-sm bg-white p-2 rounded block">
                  {`{variant === 'compact' ? `}<br/>
                  {`  <CompactLayout /> :`}<br/>
                  {`  <DefaultLayout />`}<br/>
                  {`}`}
                </code>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">3. Track Conversão</h4>
                <code className="text-sm bg-white p-2 rounded block">
                  const {`{ trackConversion }`} = useABTesting();<br/>
                  trackConversion('test_id');
                </code>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Testes Disponíveis:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>calculator_layout:</strong> 'default' | 'compact'</li>
                <li><strong>pricing_cta:</strong> 'upgrade_now' | 'try_pro' | 'unlock_features'</li>
                <li><strong>onboarding_flow:</strong> 'tutorial' | 'direct'</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
