/**
 * Multi-Marketplace Dashboard
 * 
 * Componente principal que exibe o carrossel de marketplaces
 * e permite visualizar o dashboard individual de cada um.
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Crown, Plus, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AnimatedNumber from '@/components/ui/animated-number';
import Sparkline from '@/components/ui/sparkline';
import MarketplaceCarousel, { type MarketplaceCard } from './MarketplaceCarousel';
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
      id: 'mercado-livre',
      name: 'Mercado Livre',
      logoUrl: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png',
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
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
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
      id: 'shopee',
      name: 'Shopee',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg',
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
      id: 'magalu',
      name: 'Magazine Luiza',
      logoUrl: 'https://logodownload.org/wp-content/uploads/2014/05/magazine-luiza-logo-0.png',
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
      id: 'americanas',
      name: 'Americanas',
      logoUrl: 'https://logodownload.org/wp-content/uploads/2014/04/americanas-logo-0.png',
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
      id: 'temu',
      name: 'Temu',
      logoUrl: 'https://asset.brandfetch.io/idKjPl3Yqp/idZzLmqejx.svg',
      status: {
        isConnected: false,
        syncStatus: 'idle',
      },
      color: '#FF6F00',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Cabeçalho Premium com Animações */}
          <motion.div 
            className="text-center space-y-4 py-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <motion.span 
                className="w-2 h-2 bg-brand-500 rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />{' '}
              Multi-Marketplace Dashboard
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4 text-brand-500" />
              </motion.div>
            </motion.div>

            <motion.h1 
              className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-brand-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Marketplaces Integrados
            </motion.h1>

            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Gerencie todos os seus marketplaces em um único lugar com{' '}
              <span className="text-brand-600 font-semibold">análises em tempo real</span>{' '}
              e sincronização automática
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                onClick={onConnectMarketplace}
                data-tour="connect-button"
                size="lg"
                className="gap-2 shadow-lg hover:shadow-xl transition-all mt-4 group"
              >
                <motion.div
                  animate={{ rotate: [0, 90, 0] }}
                  transition={{ duration: 0.3 }}
                  className="group-hover:rotate-90"
                >
                  <Plus className="h-5 w-5" />
                </motion.div>
                Conectar Novo Marketplace
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Zap className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

      {/* Estatísticas Gerais - Premium Cards com Animações */}
      {selectedMarketplaceId === null && (
        <TooltipProvider>
          <motion.div 
            className="grid gap-6 md:grid-cols-4"
            data-tour="metrics-overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {/* Card 1 - Marketplaces */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white via-brand-50/30 to-gray-50 cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-600 group-hover:text-brand-600 transition-colors">
                        Total de Marketplaces
                      </CardTitle>
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="text-2xl">🏪</span>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AnimatedNumber 
                        value={marketplaces.length} 
                        className="text-4xl font-bold text-gray-900"
                      />
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />{' '}
                        <AnimatedNumber value={marketplaces.filter((m) => m.status.isConnected).length} />{' '}
                        conectados ativos
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total de integrações disponíveis</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>

            {/* Card 2 - Vendas com Sparkline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white via-blue-50/30 to-blue-50 cursor-pointer group overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                        Vendas Totais (30d)
                      </CardTitle>
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shadow-sm"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="text-2xl">📈</span>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AnimatedNumber 
                        value={1234} 
                        className="text-4xl font-bold text-gray-900"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          +15% vs mês anterior
                        </p>
                        <Sparkline 
                          data={[800, 950, 1050, 980, 1100, 1150, 1234]}
                          width={60}
                          height={20}
                          color="#3b82f6"
                          strokeWidth={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crescimento de 15% nas vendas</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>

            {/* Card 3 - Receita com Sparkline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white via-green-50/30 to-green-50 cursor-pointer group overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-600 group-hover:text-green-600 transition-colors">
                        Receita Total
                      </CardTitle>
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shadow-sm"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="text-2xl">💰</span>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AnimatedNumber 
                        value={185432} 
                        prefix="R$ "
                        className="text-4xl font-bold text-gray-900"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          +22% vs mês anterior
                        </p>
                        <Sparkline 
                          data={[120000, 140000, 155000, 148000, 170000, 175000, 185432]}
                          width={60}
                          height={20}
                          color="#10b981"
                          strokeWidth={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crescimento de R$ 33.500 em 30 dias</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>

            {/* Card 4 - Produtos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white via-purple-50/30 to-purple-50 cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-sm font-semibold text-gray-600 group-hover:text-purple-600 transition-colors">
                        Produtos Ativos
                      </CardTitle>
                      <motion.div 
                        className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shadow-sm"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <span className="text-2xl">📦</span>
                      </motion.div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AnimatedNumber 
                        value={582} 
                        className="text-4xl font-bold text-gray-900"
                      />
                      <p className="text-sm text-muted-foreground">
                        Em todos os marketplaces
                      </p>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Produtos sincronizados e ativos</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </motion.div>
        </TooltipProvider>
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
            <Card className="border-2 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Seus Marketplaces Conectados</CardTitle>
                <CardDescription className="text-base mt-2">
                  Navegue pelos marketplaces e selecione um para visualizar métricas detalhadas e gerenciar produtos
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div data-tour="marketplace-select">
                  <MarketplaceCarousel
                    marketplaces={marketplaces}
                    onSelectMarketplace={handleSelectMarketplace}
                    selectedMarketplaceId={selectedMarketplaceId ?? undefined}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recursos Premium - Card Melhorado */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 overflow-hidden relative">
                  {/* Efeito de brilho animado */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: [-1000, 1000],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 2
                    }}
                  />
                  
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          >
                            <Crown className="h-6 w-6 text-amber-600" />
                          </motion.div>
                          Recursos Premium
                        </CardTitle>
                        <CardDescription className="text-base">
                          Desbloqueie todo o potencial do seu negócio
                        </CardDescription>
                      </div>
                      <motion.div
                        className="text-5xl"
                        animate={{ 
                          y: [0, -10, 0],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        ✨
                      </motion.div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { icon: "📊", title: "Histórico completo", desc: "Preços e vendas dos últimos 12 meses" },
                        { icon: "🤖", title: "IA de precificação", desc: "Recomendações inteligentes automáticas" },
                        { icon: "🔔", title: "Alertas em tempo real", desc: "Notificações configuráveis por WhatsApp" },
                        { icon: "📄", title: "Relatórios avançados", desc: "Exportação em PDF, Excel e CSV" },
                        { icon: "⚡", title: "Sync ultra rápida", desc: "Atualização a cada 15 minutos" },
                        { icon: "🎯", title: "Análise competitiva", desc: "Monitore concorrentes 24/7" },
                      ].map((feature, index) => (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-colors"
                        >
                          <span className="text-2xl">{feature.icon}</span>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{feature.title}</p>
                            <p className="text-xs text-gray-600">{feature.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all group"
                        size="lg"
                      >
                        <Crown className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                        Fazer Upgrade para Premium
                        <motion.span
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="ml-2"
                        >
                          →
                        </motion.span>
                      </Button>
                    </motion.div>

                    <p className="text-center text-xs text-gray-600">
                      💳 Cancele quando quiser • 🔒 Dados 100% seguros • 🎁 7 dias grátis
                    </p>
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
          >
            <Button
              variant="ghost"
              onClick={handleBackToCarousel}
              className="mb-4 gap-2"
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
