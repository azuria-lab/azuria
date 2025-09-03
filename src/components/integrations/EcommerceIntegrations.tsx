
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useEcommerceIntegrations } from "@/hooks/useEcommerceIntegrations";
import { History, Settings, Store, Zap } from "lucide-react";
import PlatformConnections from "./ecommerce/PlatformConnections";
import ProductsSync from "./ecommerce/ProductsSync";
import SyncSettings from "./ecommerce/SyncSettings";
import SyncHistory from "./ecommerce/SyncHistory";

export default function EcommerceIntegrations() {
  const {
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
  } = useEcommerceIntegrations();

  const [activeTab, setActiveTab] = useState("connections");

  const connectedCount = connections.filter(c => c.status === 'connected').length;
  const totalProducts = products.length;
  const recentSyncs = syncHistory.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Plataformas Conectadas</p>
                <p className="text-2xl font-bold text-brand-600">{connectedCount}</p>
              </div>
              <Store className="h-8 w-8 text-brand-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produtos Sincronizados</p>
                <p className="text-2xl font-bold text-brand-600">{totalProducts}</p>
              </div>
              <Zap className="h-8 w-8 text-brand-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sincronizações Recentes</p>
                <p className="text-2xl font-bold text-brand-600">{recentSyncs.length}</p>
              </div>
              <History className="h-8 w-8 text-brand-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Conexões</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Plataformas de E-commerce</CardTitle>
              <CardDescription>
                Conecte suas lojas online para sincronizar produtos e preços automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformConnections
                connections={connections}
                isLoading={isLoading}
                onConnect={connectPlatform}
                onDisconnect={disconnectPlatform}
                onTest={testWebhook}
                onRefreshProducts={fetchProducts}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sincronização de Produtos</CardTitle>
              <CardDescription>
                Gerencie e sincronize preços dos seus produtos em todas as plataformas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsSync
                products={products}
                connections={connections}
                isLoading={isLoading}
                onSyncPrices={syncPrices}
                onRefreshProducts={fetchProducts}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>
                Configure como os preços devem ser calculados e sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncSettings
                settings={syncSettings}
                onUpdateSettings={updateSyncSettings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Sincronizações</CardTitle>
              <CardDescription>
                Acompanhe todas as sincronizações de preços realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncHistory
                syncHistory={syncHistory}
                products={products}
                connections={connections}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
