
import { useCallback, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { EcommerceConnection, EcommerceProduct, PriceSync, SyncSettings } from "@/types/ecommerce";

export const useEcommerceIntegrations = () => {
  const [connections, setConnections] = useState<EcommerceConnection[]>([]);
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [syncHistory, setSyncHistory] = useState<PriceSync[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({
    autoSync: false,
    syncInterval: 60,
    priceRules: {
      applyMargin: true,
      marginPercentage: 30,
      roundPrices: true,
      minimumPrice: 10,
    },
    notifications: {
      onSuccess: true,
      onError: true,
    },
  });

  const fetchProducts = useCallback(async (connectionId: string) => {
    setIsLoading(true);
    try {
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) {return;}

      // Simular busca de produtos da API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockProducts: EcommerceProduct[] = Array.from({ length: 15 }, (_, i) => ({
        id: `${connectionId}-prod-${i + 1}`,
        externalId: `ext-${i + 1}`,
        platform: connectionId,
        name: `Produto ${i + 1} - ${connection.platform}`,
        sku: `SKU-${i + 1}`,
        price: Math.round((Math.random() * 200 + 50) * 100) / 100,
        cost: Math.round((Math.random() * 100 + 20) * 100) / 100,
        margin: Math.round((Math.random() * 50 + 20) * 10) / 10,
        category: ['Eletrônicos', 'Roupas', 'Casa', 'Esportes'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.2 ? 'active' : 'inactive',
        inventory: Math.floor(Math.random() * 100),
        lastUpdated: new Date(),
      }));

      setProducts(prev => [
        ...prev.filter(p => p.platform !== connectionId),
        ...mockProducts
      ]);

      toast.success(`${mockProducts.length} produtos importados com sucesso`);
    } catch (_err) {
      toast.error("Erro ao buscar produtos");
    } finally {
      setIsLoading(false);
    }
  }, [connections]);

  const connectPlatform = useCallback(async (
    platform: 'shopify' | 'woocommerce' | 'mercadolivre',
  credentials: EcommerceConnection['credentials'],
    storeName: string
  ) => {
    setIsLoading(true);
    try {
      // Simular conexão com a plataforma
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newConnection: EcommerceConnection = {
        id: Date.now().toString(),
        platform,
        name: storeName,
        status: 'connected',
        credentials,
        webhookUrl: `${window.location.origin}/api/webhooks/${platform}/${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setConnections(prev => [...prev, newConnection]);
      
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} conectado com sucesso!`);
      
  // Buscar produtos automaticamente após conexão
  await fetchProducts(newConnection.id);
      
      return newConnection;
  } catch (_err) {
      toast.error(`Erro ao conectar com ${platform}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProducts]);

  const disconnectPlatform = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    setProducts(prev => prev.filter(prod => prod.platform !== connectionId));
    
    toast.success("Plataforma desconectada com sucesso");
  }, []);

  

  const syncPrices = useCallback(async (productIds: string[]) => {
    setIsLoading(true);
    try {
      const syncPromises = productIds.map(async (productId) => {
        const product = products.find(p => p.id === productId);
        if (!product) {return null;}

        // Aplicar regras de preço
        let newPrice = product.cost || 0;
        
        if (syncSettings.priceRules.applyMargin && syncSettings.priceRules.marginPercentage) {
          newPrice = newPrice * (1 + syncSettings.priceRules.marginPercentage / 100);
        }

        if (syncSettings.priceRules.roundPrices) {
          newPrice = Math.round(newPrice * 100) / 100;
        }

        if (syncSettings.priceRules.minimumPrice && newPrice < syncSettings.priceRules.minimumPrice) {
          newPrice = syncSettings.priceRules.minimumPrice;
        }

        if (syncSettings.priceRules.maximumPrice && newPrice > syncSettings.priceRules.maximumPrice) {
          newPrice = syncSettings.priceRules.maximumPrice;
        }

        // Simular sincronização
        await new Promise(resolve => setTimeout(resolve, 500));

        const syncRecord: PriceSync = {
          id: Date.now().toString() + Math.random(),
          productId,
          platform: product.platform,
          oldPrice: product.price,
          newPrice,
          status: Math.random() > 0.1 ? 'success' : 'error',
          errorMessage: Math.random() > 0.1 ? undefined : 'Erro de conexão com a API',
          syncedAt: new Date(),
        };

        if (syncRecord.status === 'success') {
          // Atualizar preço do produto
          setProducts(prev => prev.map(p => 
            p.id === productId ? { ...p, price: newPrice } : p
          ));
        }

        return syncRecord;
      });

      const results = await Promise.all(syncPromises);
      const validResults = results.filter(Boolean) as PriceSync[];
      
      setSyncHistory(prev => [...validResults, ...prev].slice(0, 100));

      const successCount = validResults.filter(r => r.status === 'success').length;
      const errorCount = validResults.filter(r => r.status === 'error').length;

      if (errorCount === 0) {
        toast.success(`${successCount} preços sincronizados com sucesso`);
      } else {
        toast.warning(`${successCount} preços sincronizados, ${errorCount} com erro`);
      }

  } catch (_err) {
      toast.error("Erro na sincronização de preços");
    } finally {
      setIsLoading(false);
    }
  }, [products, syncSettings]);

  const updateSyncSettings = useCallback((newSettings: Partial<SyncSettings>) => {
    setSyncSettings(prev => ({ ...prev, ...newSettings }));
    toast.success("Configurações de sincronização atualizadas");
  }, []);

  const testWebhook = useCallback(async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection?.webhookUrl) {return;}

    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        platform: connection.platform,
        data: {
          message: 'Teste de webhook do Precifica+',
          connection_id: connectionId,
        }
      };

      // Simular webhook
      void testPayload;
      
      toast.success(`Webhook testado com sucesso para ${connection.name}`);
    } catch (_err) {
      toast.error("Erro no teste de webhook");
    }
  }, [connections]);

  return {
    connections,
    products,
    syncHistory,
    syncSettings,
    isLoading,
    connectPlatform,
    disconnectPlatform,
    fetchProducts,
    syncPrices,
    updateSyncSettings,
    testWebhook,
  };
};
