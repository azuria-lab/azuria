import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EcommerceConnection } from "@/types/ecommerce";
import { ExternalLink, Plus, RefreshCw, Store, TestTube, Trash2 } from "lucide-react";

interface PlatformConnectionsProps {
  connections: EcommerceConnection[];
  isLoading: boolean;
  onConnect: (platform: 'shopify' | 'woocommerce' | 'mercadolivre', credentials: any, storeName: string) => Promise<EcommerceConnection | null>;
  onDisconnect: (connectionId: string) => void;
  onTest: (connectionId: string) => void;
  onRefreshProducts: (connectionId: string) => void;
}

const platformConfigs = {
  shopify: {
    name: "Shopify",
    color: "bg-green-100 text-green-800",
    fields: [
      { key: "storeUrl", label: "URL da Loja", placeholder: "minhaloja.myshopify.com" },
      { key: "apiKey", label: "API Key", placeholder: "Sua API Key do Shopify" },
      { key: "accessToken", label: "Access Token", placeholder: "Seu Access Token" }
    ]
  },
  woocommerce: {
    name: "WooCommerce",
    color: "bg-purple-100 text-purple-800",
    fields: [
      { key: "storeUrl", label: "URL da Loja", placeholder: "https://minhaloja.com" },
      { key: "apiKey", label: "Consumer Key", placeholder: "ck_..." },
      { key: "secretKey", label: "Consumer Secret", placeholder: "cs_..." }
    ]
  },
  mercadolivre: {
    name: "Mercado Livre",
    color: "bg-yellow-100 text-yellow-800",
    fields: [
      { key: "apiKey", label: "App ID", placeholder: "Seu App ID" },
      { key: "secretKey", label: "Secret Key", placeholder: "Sua Secret Key" },
      { key: "accessToken", label: "Access Token", placeholder: "Seu Access Token" }
    ]
  }
};

export default function PlatformConnections({
  connections,
  isLoading,
  onConnect,
  onDisconnect,
  onTest,
  onRefreshProducts
}: PlatformConnectionsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'shopify' | 'woocommerce' | 'mercadolivre' | undefined>(undefined);
  const [storeName, setStoreName] = useState('');
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Ensure we NEVER set selectedPlatform to ''
  const handlePlatformChange = (value: string) => {
    if (value === '' || value == null) {
      setSelectedPlatform(undefined);
      return;
    }
    const valid =
      value === "shopify" || value === "woocommerce" || value === "mercadolivre"
        ? (value as 'shopify' | 'woocommerce' | 'mercadolivre')
        : undefined;
    setSelectedPlatform(valid);
    console.log("Select Platform changed to:", valid);
  };

  const handleConnect = async () => {
    if (!selectedPlatform || !storeName) {return;}

    const result = await onConnect(selectedPlatform, credentials, storeName);
    
    if (result) {
      setIsDialogOpen(false);
      setSelectedPlatform(undefined); // reset to undefined (never '')
      setStoreName('');
      setCredentials({});
    }
  };

  const updateCredential = (key: string, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: EcommerceConnection['status']) => {
    const colors = {
      connected: "bg-green-100 text-green-800",
      disconnected: "bg-gray-100 text-gray-800",
      error: "bg-red-100 text-red-800"
    };
    
    const labels = {
      connected: "Conectado",
      disconnected: "Desconectado",
      error: "Erro"
    };

    return (
      <Badge className={colors[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Botão para adicionar nova conexão */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedPlatform(undefined); // reset to undefined (never '')
        }
      }}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Conectar Nova Plataforma
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar Plataforma de E-commerce</DialogTitle>
            <DialogDescription>
              Escolha a plataforma e forneça as credenciais de acesso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="platform">Plataforma</Label>
              <Select
                value={selectedPlatform ?? undefined}
                onValueChange={handlePlatformChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma plataforma" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(platformConfigs).map(([key, config]) => (
                    <SelectItem
                      key={key}
                      value={key}
                    >
                      {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="storeName">Nome da Loja</Label>
              <Input
                id="storeName"
                placeholder="Nome para identificar sua loja"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            {selectedPlatform && platformConfigs[selectedPlatform].fields.map((field) => (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.key.includes('secret') || field.key.includes('token') ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={credentials[field.key] || ''}
                  onChange={(e) => updateCredential(field.key, e.target.value)}
                />
              </div>
            ))}

            <Button 
              onClick={handleConnect} 
              disabled={!selectedPlatform || !storeName || isLoading}
              className="w-full"
            >
              {isLoading ? "Conectando..." : "Conectar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lista de conexões */}
      <div className="space-y-4">
        {connections.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma plataforma conectada</p>
                <p className="text-sm">Clique em "Conectar Nova Plataforma" para começar</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          connections.map((connection) => {
            const platformConfig = platformConfigs[connection.platform];
            
            return (
              <Card key={connection.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Store className="h-8 w-8 text-brand-600" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{connection.name}</h3>
                          <Badge className={platformConfig.color}>
                            {platformConfig.name}
                          </Badge>
                          {getStatusBadge(connection.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {connection.lastSync 
                            ? `Última sincronização: ${connection.lastSync.toLocaleString('pt-BR')}`
                            : 'Nunca sincronizado'
                          }
                        </p>
                        {connection.webhookUrl && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Webhook configurado
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRefreshProducts(connection.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onTest(connection.id)}
                        disabled={isLoading}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDisconnect(connection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Informações sobre conectores */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 text-lg">💡 Como Conectar suas Plataformas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <div className="space-y-2">
            <p><strong>Shopify:</strong> Vá em Admin → Apps → Develop apps → Create an app</p>
            <p><strong>WooCommerce:</strong> WooCommerce → Settings → Advanced → REST API → Add key</p>
            <p><strong>Mercado Livre:</strong> Desenvolvedores → Suas aplicações → Criar aplicação</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
