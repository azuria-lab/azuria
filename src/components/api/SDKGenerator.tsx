
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code2, Copy, Download, Package } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { logger } from "@/services/logger";

type SdkLanguage = 'javascript' | 'python' | 'php';

export default function SDKGenerator() {
  const [selectedLanguage, setSelectedLanguage] = useState<SdkLanguage>('javascript');
  const [projectName, setProjectName] = useState("my-precifica-app");
  const [apiKey, setApiKey] = useState("");

  const sdkOptions: Record<SdkLanguage, {
    name: string;
    version: string;
    size: string;
    features: string[];
    packageManager: string;
    installCommand: string;
    configExample: string;
  }> = {
    javascript: {
      name: "JavaScript/TypeScript SDK",
      version: "2.0.0",
      size: "45KB",
      features: ["TypeScript support", "Rate limiting", "Webhooks", "Retry logic"],
      packageManager: "npm",
      installCommand: `npm install @precifica/sdk-js`,
      configExample: `import PrecificaSDK from '@precifica/sdk-js';

const client = new PrecificaSDK({
  apiKey: '${apiKey || 'your_api_key'}',
  baseURL: 'https://api.precifica.app/v2',
  timeout: 30000,
  rateLimit: {
    maxRequests: 1000,
    windowMs: 60000,
    adaptiveThrottling: true
  },
  retry: {
    attempts: 3,
    backoffStrategy: 'exponential'
  }
});`
    },
    python: {
      name: "Python SDK",
      version: "2.0.0", 
      size: "120KB",
      features: ["Async/await support", "Type hints", "Pydantic models", "Auto-retry"],
      packageManager: "pip",
      installCommand: `pip install precifica-sdk`,
      configExample: `from precifica_sdk import PrecificaClient

client = PrecificaClient(
    api_key="${apiKey || 'your_api_key'}",
    base_url="https://api.precifica.app/v2",
    timeout=30,
    rate_limit_config={
        "max_requests": 1000,
        "window_ms": 60000,
        "adaptive_throttling": True
    },
    retry_config={
        "attempts": 3,
        "backoff_strategy": "exponential"
    }
)`
    },
    php: {
      name: "PHP SDK",
      version: "2.0.0",
      size: "85KB", 
      features: ["PSR-4 compliance", "Guzzle HTTP", "Laravel support", "Doctrine annotations"],
      packageManager: "composer",
      installCommand: `composer require precifica/sdk-php`,
      configExample: `<?php
use Precifica\\SDK\\PrecificaClient;

$client = new PrecificaClient([
    'apiKey' => '${apiKey || 'your_api_key'}',
    'baseUrl' => 'https://api.precifica.app/v2',
    'timeout' => 30,
    'rateLimit' => [
        'maxRequests' => 1000,
        'windowMs' => 60000,
        'adaptiveThrottling' => true
    ],
    'retry' => [
        'attempts' => 3,
        'backoffStrategy' => 'exponential'
    ]
]);`
    }
  };

  const generateSDK = () => {
    const sdk = sdkOptions[selectedLanguage];
    toast.success(`SDK ${sdk.name} gerado com sucesso!`);
    
  // Aqui você implementaria a geração real do SDK
  logger.info(`Generating ${sdk.name} for project: ${projectName}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado!");
  };

  const downloadSDK = () => {
    const sdk = sdkOptions[selectedLanguage];
    toast.success(`Download do ${sdk.name} iniciado`);
    
    // Simular download
    const element = document.createElement('a');
    element.href = '#';
    element.download = `precifica-sdk-${selectedLanguage}-${sdk.version}.zip`;
    element.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Gerador de SDK</h2>
        <p className="text-muted-foreground">
          Gere SDKs personalizados para sua linguagem preferida
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="language">Linguagem</Label>
          <Select value={selectedLanguage} onValueChange={(v) => setSelectedLanguage(v as SdkLanguage)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript/TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="projectName">Nome do Projeto</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="my-precifica-app"
          />
        </div>

        <div>
          <Label htmlFor="apiKey">API Key (opcional)</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Sua chave da API"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="configuration">Configuração</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {sdkOptions[selectedLanguage].name}
              </CardTitle>
              <CardDescription>
                SDK oficial para integração com a API do Precifica+
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Versão</p>
                  <Badge variant="outline">{sdkOptions[selectedLanguage].version}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Tamanho</p>
                  <Badge variant="outline">{sdkOptions[selectedLanguage].size}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Gerenciador</p>
                  <Badge variant="outline">{sdkOptions[selectedLanguage].packageManager}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Licença</p>
                  <Badge variant="outline">MIT</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Recursos Incluídos:</p>
                <div className="flex flex-wrap gap-2">
                  {sdkOptions[selectedLanguage].features.map((feature, index) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instalação Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-3 rounded border relative">
                <code className="text-sm">{sdkOptions[selectedLanguage].installCommand}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(sdkOptions[selectedLanguage].installCommand)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração Inicial</CardTitle>
              <CardDescription>
                Configure o SDK com suas credenciais e preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded border relative">
                <pre className="text-sm overflow-x-auto">
                  <code>{sdkOptions[selectedLanguage].configExample}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(sdkOptions[selectedLanguage].configExample)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opções Avançadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Rate Limiting</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• <code>maxRequests</code>: Máximo de requests por janela</li>
                    <li>• <code>windowMs</code>: Duração da janela em millisegundos</li>
                    <li>• <code>adaptiveThrottling</code>: Throttling inteligente automático</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Retry Policy</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• <code>attempts</code>: Número máximo de tentativas</li>
                    <li>• <code>backoffStrategy</code>: Estratégia de backoff (linear/exponential)</li>
                    <li>• <code>retryCondition</code>: Condições para retry customizáveis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cálculo Básico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  {selectedLanguage === 'javascript' && (
                    <pre>{`const result = await client.calculations.create({
  cost: 100,
  margin: 30,
  marketplace: 'mercado_livre'
});

console.log(result.sellingPrice);`}</pre>
                  )}
                  {selectedLanguage === 'python' && (
                    <pre>{`result = await client.calculations.create(
    cost=100,
    margin=30,
    marketplace="mercado_livre"
)

print(result.selling_price)`}</pre>
                  )}
                  {selectedLanguage === 'php' && (
                    <pre>{`$result = $client->calculations()->create([
    'cost' => 100,
    'margin' => 30,
    'marketplace' => 'mercado_livre'
]);

echo $result->getSellingPrice();`}</pre>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded border text-sm">
                  {selectedLanguage === 'javascript' && (
                    <pre>{`// Receber webhook
client.webhooks.on('price_update', (data) => {
  console.log('Preço atualizado:', data);
});

// Enviar webhook
await client.webhooks.send('calculation_completed', {
  calculationId: result.id
});`}</pre>
                  )}
                  {selectedLanguage === 'python' && (
                    <pre>{`# Receber webhook
@client.webhooks.handler("price_update")
async def handle_price_update(payload):
    print(f"Preço atualizado: {payload}")

# Enviar webhook
await client.webhooks.send("calculation_completed", {
    "calculation_id": result.id
})`}</pre>
                  )}
                  {selectedLanguage === 'php' && (
                    <pre>{`// Receber webhook
$client->webhooks()->onReceive('price_update', function($data) {
    echo "Preço atualizado: " . json_encode($data);
});

// Enviar webhook
$client->webhooks()->send('calculation_completed', [
    'calculationId' => $result->getId()
]);`}</pre>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="download" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download do SDK
              </CardTitle>
              <CardDescription>
                Faça o download do SDK personalizado para seu projeto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Inclui:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>✅ Código fonte completo</li>
                    <li>✅ Documentação detalhada</li>
                    <li>✅ Exemplos de uso</li>
                    <li>✅ Testes unitários</li>
                    <li>✅ Configuração pré-definida</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Formatos:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>📦 Pacote {sdkOptions[selectedLanguage].packageManager}</li>
                    <li>📁 Código fonte (.zip)</li>
                    <li>📚 Documentação (PDF)</li>
                    <li>🔧 Arquivo de configuração</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={downloadSDK} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download SDK
                </Button>
                <Button onClick={generateSDK} variant="outline" className="flex-1">
                  <Code2 className="h-4 w-4 mr-2" />
                  Gerar Customizado
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                O download incluirá a configuração personalizada com sua API key
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
