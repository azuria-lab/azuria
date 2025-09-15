
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, AlertTriangle, BarChart3, Clock, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { useAdvancedRateLimit } from '@/hooks/useAdvancedRateLimit';

export default function AdvancedRateLimitDashboard() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'sliding-window' | 'token-bucket'>('sliding-window');
  const [config, setConfig] = useState({
    maxRequests: 1000,
    windowMs: 60000, // 1 minute
    burstCapacity: 200,
    algorithm: selectedAlgorithm,
    adaptiveThrottling: true,
    userTier: 'pro' as 'free' | 'pro' | 'enterprise'
  });

  const rateLimit = useAdvancedRateLimit(config);
  const [isTestRunning, setIsTestRunning] = useState(false);
  type TestResult = { id: number; timestamp: Date; allowed: boolean; remaining: number; metrics: unknown };
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Simulação de requests para teste
  const runLoadTest = async () => {
    setIsTestRunning(true);
    setTestResults([]);
    
    const results = [];
    for (let i = 0; i < 50; i++) {
      const result = rateLimit.checkRateLimit(`test-${i}`);
      results.push({
        id: i,
        timestamp: new Date(),
        allowed: result.allowed,
        remaining: result.remaining,
        metrics: result.metrics
      });
      
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setTestResults(results);
    setIsTestRunning(false);
  };

  const usage = rateLimit.predictUsage();
  const successRate = testResults.length > 0 
    ? (testResults.filter(r => r.allowed).length / testResults.length) * 100 
    : 0;

  const handleAlgorithmChange = (value: string) => {
    const algorithm = value as 'sliding-window' | 'token-bucket';
    setSelectedAlgorithm(algorithm);
    setConfig(prev => ({ ...prev, algorithm }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rate Limiting Inteligente</h2>
          <p className="text-gray-600">Controle avançado de requisições com algoritmos adaptativos</p>
        </div>
        <Button onClick={runLoadTest} disabled={isTestRunning}>
          {isTestRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              Teste de Carga
            </>
          )}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/Minuto</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimit.metrics.requestsInWindow}</div>
            <p className="text-xs text-gray-600">
              de {rateLimit.metrics.adaptiveLimit} permitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Disponíveis</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimit.metrics.burstTokens}</div>
            <p className="text-xs text-gray-600">
              Burst capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível de Throttling</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rateLimit.metrics.throttleLevel.toFixed(1)}%</div>
            <Progress value={rateLimit.metrics.throttleLevel} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              Últimos {testResults.length} requests
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configuration">Configuração</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Rate Limiting</CardTitle>
              <CardDescription>
                Configure os algoritmos e parâmetros de rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Algoritmo</label>
                  <Select value={selectedAlgorithm} onValueChange={handleAlgorithmChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sliding-window">Sliding Window</SelectItem>
                      <SelectItem value="token-bucket">Token Bucket</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tier do Usuário</label>
                  <Select 
                    value={config.userTier} 
                    onValueChange={(value) => setConfig(prev => ({ 
                      ...prev, 
                      userTier: value as 'free' | 'pro' | 'enterprise' 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="pro">PRO</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Requests por Janela: {config.maxRequests}
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={config.maxRequests}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    maxRequests: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Janela de Tempo: {config.windowMs / 1000}s
                </label>
                <input
                  type="range"
                  min="10000"
                  max="300000"
                  step="10000"
                  value={config.windowMs}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    windowMs: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="adaptive"
                  checked={config.adaptiveThrottling}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    adaptiveThrottling: e.target.checked 
                  }))}
                />
                <label htmlFor="adaptive" className="text-sm font-medium">
                  Throttling Adaptativo
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics em Tempo Real</CardTitle>
              <CardDescription>
                Análise do comportamento de rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.filter(r => r.allowed).length}
                      </div>
                      <div className="text-sm text-gray-600">Permitidas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {testResults.filter(r => !r.allowed).length}
                      </div>
                      <div className="text-sm text-gray-600">Bloqueadas</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {testResults.length}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>

                  <div className="h-32 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-end h-full space-x-1">
                      {testResults.slice(-20).map((result, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-t ${
                            result.allowed ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ height: `${(result.remaining / config.maxRequests) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Execute um teste de carga para ver os analytics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Preditiva</CardTitle>
              <CardDescription>
                Previsões baseadas em padrões de uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tendência de Uso</label>
                  <Badge variant={usage.trend === 'increasing' ? 'destructive' : 'default'}>
                    {usage.trend === 'increasing' ? 'Crescente' : 'Estável'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Previsão (req/janela)</label>
                  <div className="text-2xl font-bold">{usage.prediction}</div>
                </div>
              </div>

              {usage.recommendedLimit && usage.recommendedLimit > config.maxRequests && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Recomendamos aumentar o limite para {usage.recommendedLimit} req/janela 
                    para acomodar o padrão de uso atual.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Próximo Reset</label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {new Date(rateLimit.metrics.predictedNextReset).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
