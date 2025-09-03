
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Marketplaces disponíveis
const marketplaces = [
  { id: "mercadolivre", name: "Mercado Livre", connected: false, color: "yellow" },
  { id: "shopee", name: "Shopee", connected: false, color: "orange" },
  { id: "amazon", name: "Amazon", connected: false, color: "blue" },
  { id: "magalu", name: "Magalu", connected: false, color: "blue" },
  { id: "olist", name: "Olist", connected: false, color: "green" },
];

export default function MarketplaceIntegrations() {
  const { toast } = useToast();
  const [selectedMarketplace, setSelectedMarketplace] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedMarketplaces, setConnectedMarketplaces] = useState<string[]>([]);
  
  const handleConnect = async () => {
    if (!selectedMarketplace) {
      toast({
        title: "Erro",
        description: "Selecione um marketplace para conectar",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simular conexão
    setTimeout(() => {
      setConnectedMarketplaces(prev => [...prev, selectedMarketplace]);
      
      toast({
        title: "Conectado com Sucesso",
        description: `Sua conta foi conectada ao ${marketplaces.find(m => m.id === selectedMarketplace)?.name}.`,
      });
      
      setIsConnecting(false);
    }, 1500);
  };
  
  const handleDisconnect = (marketplaceId: string) => {
    setConnectedMarketplaces(prev => prev.filter(id => id !== marketplaceId));
    
    toast({
      title: "Desconectado",
      description: `Você desconectou o ${marketplaces.find(m => m.id === marketplaceId)?.name}.`,
    });
  };
  
  const handleFetchData = (marketplaceId: string) => {
    toast({
      title: "Consultando Produtos",
      description: `Buscando dados de produtos no ${marketplaces.find(m => m.id === marketplaceId)?.name}...`,
    });
    
    // Simulação de busca de dados
    setTimeout(() => {
      toast({
        title: "Dados Obtidos",
        description: "Produtos encontrados: 42",
      });
    }, 1500);
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case "yellow": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "orange": return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "blue": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "green": return "bg-green-100 text-green-800 hover:bg-green-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Conecte sua conta do marketplace para importar e sincronizar dados de produtos.
          Isso permitirá atualizar preços e manter seu catálogo sincronizado.
        </p>
      </div>
      
      {/* Conectar novo marketplace */}
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-sm font-medium">Adicionar Nova Conexão</h3>
        
        <div className="space-y-2">
          <Label htmlFor="marketplace">Marketplace</Label>
          <Select 
            value={selectedMarketplace} 
            onValueChange={setSelectedMarketplace}
          >
            <SelectTrigger id="marketplace" className="w-full">
              <SelectValue placeholder="Selecione um marketplace" />
            </SelectTrigger>
            <SelectContent>
              {marketplaces.map(marketplace => (
                <SelectItem 
                  key={marketplace.id} 
                  value={marketplace.id}
                  disabled={connectedMarketplaces.includes(marketplace.id)}
                >
                  {marketplace.name} 
                  {connectedMarketplaces.includes(marketplace.id) && " (Conectado)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleConnect}
          disabled={isConnecting || !selectedMarketplace || connectedMarketplaces.includes(selectedMarketplace)}
          className="w-full"
        >
          {isConnecting ? "Conectando..." : "Conectar Marketplace"}
        </Button>
      </div>
      
      {/* Lista de marketplaces conectados */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium border-b pb-2">Conexões Ativas</h3>
        
        {connectedMarketplaces.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Nenhum marketplace conectado</p>
        ) : (
          <div className="space-y-3">
            {connectedMarketplaces.map(marketplaceId => {
              const marketplace = marketplaces.find(m => m.id === marketplaceId);
              if (!marketplace) {return null;}
              
              return (
                <div key={marketplaceId} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center space-x-3">
                    <Badge className={getBadgeColor(marketplace.color)}>
                      {marketplace.name}
                    </Badge>
                    <span className="text-xs text-green-600">Conectado</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleFetchData(marketplaceId)}
                    >
                      Buscar Produtos
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDisconnect(marketplaceId)}
                    >
                      Desconectar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2">Recursos de Integração:</h4>
        <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
          <li>Importar produtos do marketplace para calcular preços</li>
          <li>Exportar preços calculados de volta para o marketplace</li>
          <li>Monitorar preços da concorrência</li>
          <li>Acompanhar histórico de vendas e ajustar preços</li>
        </ul>
      </div>
    </div>
  );
}
