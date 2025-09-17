
import React, { useState } from "react";
import { getApiBase } from '@/config/branding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Code2, Copy, TrendingUp, Webhook, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type SdkLanguage = 'javascript' | 'python' | 'php';

export default function AdvancedApiDocumentation() {
  const [selectedLanguage, setSelectedLanguage] = useState<SdkLanguage>('javascript');
  const [apiKey, setApiKey] = useState("your_api_key_here");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado para a área de transferência!");
  };

  const baseV2 = getApiBase(2);
  const sdkExamples: Record<SdkLanguage, { installation: string; quickStart: string; rateLimit: string }> = {
    javascript: {
      installation: `npm install @precifica/sdk-js`,
      quickStart: `import PrecificaSDK from '@precifica/sdk-js';

const client = new PrecificaSDK({
  apiKey: '${apiKey}',
  baseURL: '${baseV2}',
  rateLimit: {
    maxRequests: 1000,
    windowMs: 60000,
    adaptiveThrottling: true
  }
});

// Cálculo básico
const result = await client.calculations.create({
  cost: 100,
  margin: 30,
  marketplace: 'mercado_livre'
});

// Cálculo em lote
const batchResults = await client.calculations.batch([
  { cost: 100, margin: 30 },
  { cost: 200, margin: 25 }
]);

// Webhooks bidirecionais
client.webhooks.onReceive('price_update', (data) => {
  console.log('Preço atualizado:', data);
});

await client.webhooks.send('calculation_completed', {
  calculationId: result.id,
  sellingPrice: result.sellingPrice
});`,
      
      rateLimit: `// Rate limiting inteligente automático
const rateLimitedClient = new PrecificaSDK({
  apiKey: '${apiKey}',
  rateLimit: {
    algorithm: 'sliding-window', // ou 'token-bucket'
    maxRequests: 1000,
    windowMs: 60000,
    burstCapacity: 200,
    adaptiveThrottling: true,
    retryOnLimit: true,
    backoffStrategy: 'exponential'
  }
});

// O SDK automaticamente gerencia rate limits
try {
  const results = await Promise.all([
    rateLimitedClient.calculations.create(calc1),
    rateLimitedClient.calculations.create(calc2),
    rateLimitedClient.calculations.create(calc3)
  ]);
} catch (rateLimitError) {
  console.log('Rate limit atingido, retry automático em:', rateLimitError.retryAfter);
}`
  },
    
    python: {
      installation: `pip install precifica-sdk`,
      quickStart: `from precifica_sdk import PrecificaClient
import asyncio

client = PrecificaClient(
    api_key="${apiKey}",
    base_url="${baseV2}",
    rate_limit_config={
        "max_requests": 1000,
        "window_ms": 60000,
        "adaptive_throttling": True
    }
)

# Cálculo síncrono
result = client.calculations.create(
    cost=100,
    margin=30,
    marketplace="mercado_livre"
)

# Cálculo assíncrono
async def async_calculation():
    async_client = client.async_client()
    result = await async_client.calculations.create(
        cost=100,
        margin=30
    )
    return result

# Webhooks
@client.webhooks.handler("price_update")
async def handle_price_update(payload):
    print(f"Preço atualizado: {payload}")

# Enviar webhook
await client.webhooks.send("calculation_completed", {
    "calculation_id": result.id,
    "selling_price": result.selling_price
})`,
      
      rateLimit: `# Rate limiting com configuração avançada
from precifica_sdk import PrecificaClient, RateLimitConfig

rate_limit_config = RateLimitConfig(
    algorithm="sliding_window",  # ou "token_bucket"
    max_requests=1000,
    window_ms=60000,
    burst_capacity=200,
    adaptive_throttling=True,
    retry_on_limit=True,
    backoff_strategy="exponential"
)

client = PrecificaClient(
    api_key="${apiKey}",
    rate_limit_config=rate_limit_config
)

# Monitoramento de rate limit
@client.rate_limit.on_limit_reached
def handle_rate_limit(metrics):
    print(f"Rate limit atingido: {metrics.remaining} requests restantes")
    print(f"Reset em: {metrics.reset_time}")

# Cálculos com retry automático
try:
    results = await asyncio.gather(*[
        client.calculations.create_async(calc) 
        for calc in calculations_list
    ])
except RateLimitException as e:
    print(f"Rate limit: retry em {e.retry_after} segundos")`
  },
    
    php: {
      installation: `composer require precifica/sdk-php`,
      quickStart: `<?php
use Precifica\\SDK\\PrecificaClient;
use Precifica\\SDK\\Config\\RateLimitConfig;

$client = new PrecificaClient([
    'apiKey' => '${apiKey}',
    'baseUrl' => 'https://api.precifica.app/v2',
    'rateLimit' => new RateLimitConfig([
        'maxRequests' => 1000,
        'windowMs' => 60000,
        'adaptiveThrottling' => true
    ])
]);

// Cálculo básico
$result = $client->calculations()->create([
    'cost' => 100,
    'margin' => 30,
    'marketplace' => 'mercado_livre'
]);

// Cálculo em lote
$batchResults = $client->calculations()->batch([
    ['cost' => 100, 'margin' => 30],
    ['cost' => 200, 'margin' => 25]
]);

// Webhooks
$client->webhooks()->onReceive('price_update', function($data) {
    echo "Preço atualizado: " . json_encode($data);
});

$client->webhooks()->send('calculation_completed', [
    'calculationId' => $result->getId(),
    'sellingPrice' => $result->getSellingPrice()
]);`,
      
      rateLimit: `<?php
// Rate limiting avançado
use Precifica\\SDK\\Config\\RateLimitConfig;
use Precifica\\SDK\\Exceptions\\RateLimitException;

$rateLimitConfig = new RateLimitConfig([
    'algorithm' => 'sliding-window', // ou 'token-bucket'
    'maxRequests' => 1000,
    'windowMs' => 60000,
    'burstCapacity' => 200,
    'adaptiveThrottling' => true,
    'retryOnLimit' => true,
    'backoffStrategy' => 'exponential'
]);

$client = new PrecificaClient([
    'apiKey' => '${apiKey}',
    'rateLimit' => $rateLimitConfig
]);

// Monitoramento de rate limit
$client->rateLimitMonitor()->onLimitReached(function($metrics) {
    echo "Rate limit atingido: {$metrics->remaining} requests restantes\\n";
    echo "Reset em: {$metrics->resetTime}\\n";
});

// Cálculos com retry automático
try {
    $results = $client->calculations()->batchAsync($calculations);
} catch (RateLimitException $e) {
    echo "Rate limit: retry em {$e->getRetryAfter()} segundos";
}`
  }
  };

  const advancedEndpoints = [
    {
      method: "POST",
      endpoint: "/v2/calculations/batch",
      description: "Cálculos em lote com processamento paralelo",
      params: "Array de objetos de cálculo",
      response: "Array de resultados com IDs de tracking"
    },
    {
      method: "GET",
      endpoint: "/v2/analytics/insights",
      description: "Insights automáticos com IA",
      params: "timeRange, categories, metrics",
      response: "Insights personalizados e recomendações"
    },
    {
      method: "POST",
      endpoint: "/v2/ai/price-optimization",
      description: "Otimização de preços com machine learning",
      params: "productData, marketConditions, goals",
      response: "Preços otimizados e análise de impacto"
    },
    {
      method: "WebSocket",
      endpoint: "/v2/realtime/price-alerts",
      description: "Alertas de preço em tempo real",
      params: "Conexão WebSocket",
      response: "Stream de alertas e mudanças de preço"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">API Avançada v2.0</h1>
        <p className="text-muted-foreground">
          Rate limiting inteligente, webhooks bidirecionais e SDKs otimizados
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="playground">Playground</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rate Limiting Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Algoritmos adaptativos (sliding window, token bucket)</li>
                  <li>• Análise comportamental automatizada</li>
                  <li>• Burst capacity para picos de tráfego</li>
                  <li>• Previsão de uso baseada em ML</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhooks Bidirecionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• Incoming e outgoing webhooks</li>
                  <li>• Retry policies configuráveis</li>
                  <li>• Dead letter queues</li>
                  <li>• Filtragem avançada de eventos</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="h-5 w-5" />
                  SDKs Oficiais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li>• JavaScript/TypeScript</li>
                  <li>• Python (sync + async)</li>
                  <li>• PHP com Laravel support</li>
                  <li>• Rate limiting automático</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recursos Enterprise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Integração Avançada</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• GraphQL endpoint flexível</li>
                    <li>• WebSocket connections para real-time</li>
                    <li>• Bulk operations otimizadas</li>
                    <li>• API gateway personalizado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">IA e Machine Learning</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Sugestões de preço inteligentes</li>
                    <li>• Previsão de demanda</li>
                    <li>• Análise de competitividade</li>
                    <li>• Otimização automática de margens</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limiting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Rate Limiting Inteligente
              </CardTitle>
              <CardDescription>
                Sistema adaptativo que aprende com o comportamento do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="secondary">Sliding Window</Badge>
                  <p className="mt-2 text-sm">Análise em janela deslizante para distribuição uniforme</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-brand-50 text-brand-700">Token Bucket</Badge>
                  <p className="mt-2 text-sm">Permite rajadas controladas com burst capacity</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">Adaptativo</Badge>
                  <p className="mt-2 text-sm">Aprende padrões e ajusta limites automaticamente</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-medium mb-2">Configuração Inteligente</h4>
                <pre className="text-sm overflow-x-auto">
                  <code>{`{
  "algorithm": "sliding-window",
  "maxRequests": 1000,
  "windowMs": 60000,
  "burstCapacity": 200,
  "adaptiveThrottling": true,
  "behaviorAnalysis": {
    "enabled": true,
    "trustScoreThreshold": 0.8,
    "adaptiveMultiplier": 1.5
  }
}`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhooks Bidirecionais</CardTitle>
              <CardDescription>
                Sistema completo de webhooks com entrada e saída
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Outgoing Webhooks</h4>
                  <div className="bg-gray-50 p-3 rounded border">
                    <pre className="text-xs overflow-x-auto">
                      <code>{`POST https://your-app.com/webhook
Content-Type: application/json
X-Precifica-Signature: sha256=abc123...

{
  "id": "wh_123",
  "event": "calculation.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "calculation_id": "calc_456",
    "selling_price": 142.85,
    "margin": 30
  }
}`}</code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Incoming Webhooks</h4>
                  <div className="bg-gray-50 p-3 rounded border">
                    <pre className="text-xs overflow-x-auto">
                      <code>{`POST https://api.precifica.app/v2/webhooks/receive
Authorization: Bearer your_api_key
Content-Type: application/json

{
  "event": "competitor.price_changed",
  "data": {
    "product_id": "prod_789",
    "competitor": "competitor_x",
    "old_price": 150.00,
    "new_price": 145.00,
    "marketplace": "mercado_livre"
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Recursos Avançados</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>Retry Policy:</strong> Backoff exponencial com até 5 tentativas</li>
                  <li>• <strong>Dead Letter Queue:</strong> Armazena webhooks falhados para reprocessamento</li>
                  <li>• <strong>Filtros:</strong> Condicional baseado em campos e valores</li>
                  <li>• <strong>Segurança:</strong> HMAC signatures e autenticação Bearer</li>
                  <li>• <strong>Rate Limiting:</strong> Proteção contra spam em webhooks incoming</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sdks" className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Label htmlFor="language">Linguagem:</Label>
            <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as SdkLanguage)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript/Node.js</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="php">PHP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Instalação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded border relative">
                  <code className="text-sm">{sdkExamples[selectedLanguage].installation}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sdkExamples[selectedLanguage].installation)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded border relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{sdkExamples[selectedLanguage].quickStart}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sdkExamples[selectedLanguage].quickStart)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Avançado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded border relative">
                  <pre className="text-sm overflow-x-auto">
                    <code>{sdkExamples[selectedLanguage].rateLimit}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(sdkExamples[selectedLanguage].rateLimit)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Endpoints Avançados
              </CardTitle>
              <CardDescription>
                APIs com recursos de IA e processamento em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {advancedEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={endpoint.method === 'POST' ? 'default' : 
                                   endpoint.method === 'GET' ? 'secondary' : 'outline'}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {endpoint.endpoint}
                      </code>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <strong>Parâmetros:</strong> {endpoint.params}
                      </div>
                      <div>
                        <strong>Resposta:</strong> {endpoint.response}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playground" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Playground</CardTitle>
              <CardDescription>
                Teste os endpoints da API diretamente no navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apiKeyInput">API Key</Label>
                  <Input
                    id="apiKeyInput"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Sua chave da API"
                  />
                </div>
                <div>
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um endpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calculations">POST /v2/calculations</SelectItem>
                      <SelectItem value="batch">POST /v2/calculations/batch</SelectItem>
                      <SelectItem value="insights">GET /v2/analytics/insights</SelectItem>
                      <SelectItem value="ai-optimization">POST /v2/ai/price-optimization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="requestBody">Request Body (JSON)</Label>
                <textarea
                  id="requestBody"
                  className="w-full h-32 p-3 border rounded resize-none font-mono text-sm"
                  placeholder={`{
  "cost": 100,
  "margin": 30,
  "marketplace": "mercado_livre"
}`}
                />
              </div>

              <Button className="w-full">
                Executar Request
              </Button>

              <div>
                <Label>Response</Label>
                <div className="bg-gray-50 p-3 rounded border h-32 overflow-y-auto">
                  <p className="text-sm text-gray-500">A resposta aparecerá aqui...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
