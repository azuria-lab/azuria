
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const erpSystems = [
  { id: "tiny", name: "Tiny ERP", connected: false, color: "blue" },
  { id: "bling", name: "Bling", connected: false, color: "green" },
  { id: "totvs", name: "TOTVS", connected: false, color: "purple" },
  { id: "omie", name: "Omie", connected: false, color: "orange" },
  { id: "senior", name: "Senior", connected: false, color: "red" },
];

export default function ERPIntegrations() {
  const { toast } = useToast();
  const [selectedERP, setSelectedERP] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedERPs, setConnectedERPs] = useState<string[]>([]);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState("60");

  const handleConnect = async () => {
    if (!selectedERP || !apiKey) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simular conexão com API
    setTimeout(() => {
      setConnectedERPs(prev => [...prev, selectedERP]);
      
      toast({
        title: "ERP Conectado",
        description: `Conexão estabelecida com ${erpSystems.find(e => e.id === selectedERP)?.name}`,
      });
      
      setApiKey("");
      setApiSecret("");
      setSelectedERP("");
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = (erpId: string) => {
    setConnectedERPs(prev => prev.filter(id => id !== erpId));
    
    toast({
      title: "ERP Desconectado",
      description: `Desconectado do ${erpSystems.find(e => e.id === erpId)?.name}`,
    });
  };

  const handleSync = (erpId: string) => {
    toast({
      title: "Sincronizando",
      description: `Sincronizando dados com ${erpSystems.find(e => e.id === erpId)?.name}...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Sincronização Concluída",
        description: "Produtos e preços atualizados com sucesso",
      });
    }, 2000);
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "green": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "purple": return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "orange": return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "red": return "bg-red-100 text-red-800 hover:bg-red-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Conecte seu ERP para sincronizar automaticamente produtos, preços e estoque.
        </p>
      </div>

      {/* Formulário de conexão */}
      <Card>
        <CardHeader>
          <CardTitle>Conectar Novo ERP</CardTitle>
          <CardDescription>
            Configure a integração com seu sistema ERP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="erp">Sistema ERP</Label>
              <Select value={selectedERP} onValueChange={setSelectedERP}>
                <SelectTrigger id="erp">
                  <SelectValue placeholder="Selecione um ERP" />
                </SelectTrigger>
                <SelectContent>
                  {erpSystems.map(erp => (
                    <SelectItem 
                      key={erp.id} 
                      value={erp.id}
                      disabled={connectedERPs.includes(erp.id)}
                    >
                      {erp.name} {connectedERPs.includes(erp.id) && "(Conectado)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">Chave da API *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Sua chave da API"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">Secret da API (opcional)</Label>
            <Input
              id="apiSecret"
              type="password"
              placeholder="Secret da API (se necessário)"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleConnect}
            disabled={isConnecting || !selectedERP || !apiKey}
            className="w-full"
          >
            {isConnecting ? "Conectando..." : "Conectar ERP"}
          </Button>
        </CardContent>
      </Card>

      {/* ERPs conectados */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">ERPs Conectados</h3>
        
        {connectedERPs.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nenhum ERP conectado</p>
        ) : (
          <div className="space-y-3">
            {connectedERPs.map(erpId => {
              const erp = erpSystems.find(e => e.id === erpId);
              if (!erp) {return null;}
              
              return (
                <Card key={erpId}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getBadgeColor(erp.color)}>
                          {erp.name}
                        </Badge>
                        <span className="text-xs text-green-600">Conectado</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSync(erpId)}
                        >
                          Sincronizar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDisconnect(erpId)}
                        >
                          Desconectar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Configurações de sincronização */}
      {connectedERPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Sincronização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSync">Sincronização Automática</Label>
                <p className="text-xs text-gray-500">
                  Sincronizar dados automaticamente em intervalos regulares
                </p>
              </div>
              <Switch
                id="autoSync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>
            
            {autoSync && (
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Intervalo (minutos)</Label>
                <Select value={syncInterval} onValueChange={setSyncInterval}>
                  <SelectTrigger id="syncInterval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="360">6 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Recursos da Integração ERP:</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
          <li>Sincronização automática de produtos e preços</li>
          <li>Atualização de estoque em tempo real</li>
          <li>Importação de dados de custo e fornecedores</li>
          <li>Exportação de preços calculados para o ERP</li>
          <li>Relatórios de sincronização e divergências</li>
        </ul>
      </div>
    </div>
  );
}
