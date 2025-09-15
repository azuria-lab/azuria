
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Copy, Key, Webhook } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ApiDocumentation() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado para a área de transferência!");
  };

  const apiExamples = {
    calculate: `curl -X POST https://api.precifica.app/v1/calculate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "cost": 100,
    "margin": 30,
    "marketplace": "mercado_livre",
    "tax_regime": "simples"
  }'`,
    
    competitors: `curl -X GET "https://api.precifica.app/v1/competitors?product=smartphone&marketplace=mercado_livre" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  
    webhook: `{
  "event": "calculation.completed",
  "data": {
    "calculation_id": "calc_123",
    "selling_price": 142.85,
    "profit_margin": 30,
    "created_at": "2024-01-15T10:30:00Z"
  }
}`
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">API do Azuria+</h1>
        <p className="text-muted-foreground">
          Integre o poder do Azuria+ em suas aplicações
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Exemplos</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Use sua chave da API no cabeçalho Authorization:</p>
              <div className="bg-muted p-3 rounded border relative">
                <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="secondary">Grátis</Badge>
                  <p className="mt-2 text-sm">100 req/dia</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-brand-50 text-brand-700">PRO</Badge>
                  <p className="mt-2 text-sm">10.000 req/dia</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">Enterprise</Badge>
                  <p className="mt-2 text-sm">Ilimitado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>POST /v1/calculate</CardTitle>
              <CardDescription>Calcula preço de venda com base nos parâmetros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Parâmetros:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li><code>cost</code> (number) - Custo do produto</li>
                      <li><code>margin</code> (number) - Margem de lucro desejada (%)</li>
                      <li><code>marketplace</code> (string) - Marketplace (opcional)</li>
                      <li><code>tax_regime</code> (string) - Regime tributário</li>
                    </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GET /v1/competitors</CardTitle>
              <CardDescription>Busca dados de concorrência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Query Parameters:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li><code>product</code> (string) - Nome do produto</li>
                      <li><code>marketplace</code> (string) - Marketplace</li>
                      <li><code>limit</code> (number) - Limite de resultados (padrão: 10)</li>
                    </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Cálculo de Preço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded border relative">
                <pre className="text-sm overflow-x-auto">
                  <code>{apiExamples.calculate}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(apiExamples.calculate)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Busca de Concorrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded border relative">
                <pre className="text-sm overflow-x-auto">
                  <code>{apiExamples.competitors}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(apiExamples.competitors)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Configuração de Webhooks
              </CardTitle>
              <CardDescription>
                Receba notificações em tempo real sobre eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Eventos Disponíveis:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• <code>calculation.completed</code> - Cálculo finalizado</li>
                      <li>• <code>competitor.updated</code> - Dados de concorrência atualizados</li>
                      <li>• <code>api.limit_reached</code> - Limite da API atingido</li>
                    </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Exemplo de Payload:</h4>
                  <div className="bg-muted p-4 rounded border relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{apiExamples.webhook}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(apiExamples.webhook)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
