/**
 * Multi-Marketplace Dashboard
 * 
 * Componente principal que exibe o carrossel de marketplaces
 * e permite visualizar o dashboard individual de cada um.
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Crown, Package, Plus, ShoppingBag, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type MarketplaceCard } from './MarketplaceCarousel'; // Import type from original file
import ModernMarketplaceCarousel from './ModernMarketplaceCarousel'; // Import new Modern Carousel
import MarketplaceDashboard from './MarketplaceDashboard';
import { createMarketplaceHandler } from '@/services/marketplace';
import type { MarketplaceDashboardData } from '@/types/marketplace-api';

interface MultiMarketplaceDashboardProps {
  onConnectMarketplace?: () => void;
  isPremium?: boolean;
}

export default function MultiMarketplaceDashboard({
  onConnectMarketplace,
  isPremium = false,
}: Readonly<MultiMarketplaceDashboardProps>) {
  const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<MarketplaceDashboardData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Marketplaces conectados (mock - em produção, viria do backend)
  const [marketplaces] = useState<MarketplaceCard[]>([
    {
      id: 'shopee',
      name: 'Shopee',
      logoUrl: '/images/marketplaces/shopee.png',
      status: {
        isConnected: true,
        lastSync: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
        syncStatus: 'syncing',
      },
      color: '#EE4D2D',
      category: 'internacional',
      region: 'Sudeste Asiático',
    },
    {
      id: 'mercado-livre',
      name: 'Mercado Livre',
      logoUrl: '/images/marketplaces/mercadolivre.png',
      status: {
        isConnected: true,
        lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
        syncStatus: 'success',
      },
      color: '#FFE600',
      category: 'nacional',
      region: 'América Latina',
    },
    {
      id: 'amazon',
      name: 'Amazon',
      logoUrl: '/images/marketplaces/amazon.svg',
      status: {
        isConnected: true,
        lastSync: new Date(Date.now() - 60 * 60 * 1000), // 1h atrás
        syncStatus: 'success',
      },
      color: '#FF9900',
      category: 'internacional',
      region: 'Global',
    },
    {
      id: 'magalu',
      name: 'Magazine Luiza',
      logoUrl: '/images/marketplaces/magalu.png',
      status: {
        isConnected: false,
        syncStatus: 'idle',
        errorMessage: 'Credenciais inválidas',
      },
      color: '#0086FF',
      category: 'nacional',
      region: 'Brasil',
    },
    {
      id: 'temu',
      name: 'Temu',
      logoUrl: '/images/marketplaces/temu.png',
      status: {
        isConnected: false,
        syncStatus: 'idle',
      },
      color: '#FF6F00',
      category: 'internacional',
      region: 'Global',
    },
    {
      id: 'shein',
      name: 'Shein',
      logoUrl: '/images/marketplaces/shein.png',
      status: {
        isConnected: false,
        syncStatus: 'idle',
      },
      color: '#000000',
      category: 'internacional',
      region: 'Global',
    },
    {
      id: 'americanas',
      name: 'Americanas',
      logoUrl: '/images/marketplaces/americanas.png',
      status: {
        isConnected: true,
        lastSync: new Date(Date.now() - 45 * 60 * 1000), // 45 min atrás
        syncStatus: 'success',
      },
      color: '#E31F26',
      category: 'nacional',
      region: 'Brasil',
    },
    {
      id: 'tiktok',
      name: 'TikTok Shop',
      logoUrl: '/images/marketplaces/3d/tiktok.png',
      status: {
        isConnected: false,
        syncStatus: 'idle',
      },
      color: '#000000',
      category: 'internacional',
      region: 'Global',
    },
  ]);

  // Carregar dados do dashboard quando um marketplace é selecionado
  useEffect(() => {
    if (!selectedMarketplaceId) {
      setDashboardData(null);
      return;
    }

    const loadDashboardData = async () => {
      setIsLoadingDashboard(true);

      try {
        const handler = createMarketplaceHandler(selectedMarketplaceId);
      const data = await handler.getDashboardData();
      setDashboardData(data);
      } catch (error) {
        // Error handling - log for debugging
        if (error instanceof Error) {
          // Future enhancement: Show user-friendly error toast
        }
        setDashboardData(null);
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    loadDashboardData();
  }, [selectedMarketplaceId]);

  const handleSelectMarketplace = (marketplaceId: string) => {
    setSelectedMarketplaceId(marketplaceId);
  };

  const handleBackToCarousel = () => {
    setSelectedMarketplaceId(null);
  };

  const handleRefreshDashboard = async () => {
    if (!selectedMarketplaceId) {
      return;
    }

    setIsLoadingDashboard(true);

    try {
      const handler = createMarketplaceHandler(selectedMarketplaceId);
      const data = await handler.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      // Error handling - log for debugging
      if (error instanceof Error) {
        // Future enhancement: Show user-friendly error toast
      }
      setDashboardData(null);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const selectedMarketplace = marketplaces.find((m) => m.id === selectedMarketplaceId);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header Premium - Estilo Dashboard */}
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Marketplaces
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie todos os seus marketplaces em um único lugar
                </p>
              </div>
              <Button 
                onClick={onConnectMarketplace}
                data-tour="connect-button"
                size="lg"
                className="h-10 px-6 gap-2"
              >
                <Plus className="h-4 w-4" />
                Conectar Marketplace
              </Button>
            </div>
          </motion.div>

          {/* Métricas Principais - Estilo Dashboard Premium */}
          {selectedMarketplaceId === null && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total de Marketplaces
                    </CardTitle>
                    <ShoppingBag className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{marketplaces.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600 font-medium">
                        {marketplaces.filter((m) => m.status.isConnected).length}
                      </span>{' '}
                      conectados
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Vendas Totais (30d)
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1.234</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600 font-medium">+15%</span> vs mês anterior
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Receita Total
                    </CardTitle>
                    <Zap className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ 185.432</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-green-600 font-medium">+22%</span> vs mês anterior
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Produtos Ativos
                    </CardTitle>
                    <Package className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">582</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Em todos os marketplaces
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Conteúdo Principal */}
          <AnimatePresence mode="wait">
            {selectedMarketplaceId === null ? (
              // Mostrar Carrossel
              <motion.div
                key="carousel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* 3D Modern Carousel */}
                <div data-tour="marketplace-select">
                  <ModernMarketplaceCarousel
                    marketplaces={marketplaces}
                    onSelectMarketplace={handleSelectMarketplace}
                    selectedMarketplaceId={selectedMarketplaceId ?? undefined}
                  />
                </div>

          {/* Recursos Premium - Estilo Dashboard */}
          {!isPremium && selectedMarketplaceId === null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <CardTitle>Recursos Premium</CardTitle>
                  </div>
                  <CardDescription>
                    Desbloqueie todo o potencial do seu negócio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {[
                      { icon: "📊", title: "Histórico completo", desc: "Preços e vendas dos últimos 12 meses" },
                      { icon: "🤖", title: "IA de precificação", desc: "Recomendações inteligentes automáticas" },
                      { icon: "🔔", title: "Alertas em tempo real", desc: "Notificações configuráveis" },
                      { icon: "📄", title: "Relatórios avançados", desc: "Exportação em PDF, Excel e CSV" },
                      { icon: "⚡", title: "Sync ultra rápida", desc: "Atualização a cada 15 minutos" },
                      { icon: "🎯", title: "Análise competitiva", desc: "Monitore concorrentes 24/7" },
                    ].map((feature) => (
                      <div
                        key={feature.title}
                        className="flex items-start gap-3 p-3 rounded-lg bg-background hover:bg-accent/50 transition-colors"
                      >
                        <span className="text-xl">{feature.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-foreground">{feature.title}</p>
                          <p className="text-xs text-muted-foreground">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full h-10"
                    onClick={() => window.location.href = '/planos'}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Fazer Upgrade para Premium
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
          </motion.div>
              ) : (
                // Mostrar Dashboard Individual
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Button
                    variant="ghost"
                    onClick={handleBackToCarousel}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Marketplaces
                  </Button>

            {dashboardData && selectedMarketplace && (
              <MarketplaceDashboard
                marketplaceId={selectedMarketplaceId}
                marketplaceName={selectedMarketplace.name}
                marketplaceColor={selectedMarketplace.color}
                data={dashboardData}
                onRefresh={handleRefreshDashboard}
                onExport={
                  isPremium
                    ? () => {
                        // Export functionality will be implemented in future version
                      }
                    : undefined
                }
                onSettings={() => {
                  // Settings functionality will be implemented in future version
                }}
                isLoading={isLoadingDashboard}
                isPremium={isPremium}
              />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
