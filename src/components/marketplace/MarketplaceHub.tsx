import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Package, Plus, RefreshCw, Settings, ShoppingCart, TrendingUp, Zap } from 'lucide-react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { MarketplacePlatform } from '../../types/marketplace';
import MarketplaceConnectionModal from './MarketplaceConnectionModal';
import MarketplaceCard from './MarketplaceCard';
import DashboardStats from './DashboardStats';

const MarketplaceHub: React.FC = () => {
  const {
    marketplaces,
    dashboardData,
    isLoading,
    error,
    refreshDashboard,
    connectMarketplace,
    testConnection,
    startSync,
    clearError
  } = useMarketplace();

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<MarketplacePlatform | null>(null);
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  const [syncingMarketplaces, setSyncingMarketplaces] = useState<Set<string>>(new Set());

  // Auto-refresh dashboard every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        refreshDashboard();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, refreshDashboard]);

  const handleConnectMarketplace = (platform: MarketplacePlatform) => {
    setSelectedPlatform(platform);
    setShowConnectionModal(true);
  };

  const handleConnectionSubmit = async (credentials: Record<string, unknown>) => {
    if (!selectedPlatform) {
      return;
    }

    try {
      await connectMarketplace(selectedPlatform, credentials);
      setShowConnectionModal(false);
      setSelectedPlatform(null);
      await refreshDashboard();
    } catch (_err) {
      // Erro será tratado pelo contexto do marketplace
    }
  };

  const handleTestConnection = async (marketplaceId: string) => {
    setTestingConnections(prev => new Set(prev).add(marketplaceId));
    
    try {
      await testConnection(marketplaceId);
    } catch (_err) {
      // Erro será tratado pelo contexto do marketplace
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(marketplaceId);
        return newSet;
      });
    }
  };

  const handleSync = async (marketplaceId: string, type: 'products' | 'orders' | 'inventory' = 'products') => {
    setSyncingMarketplaces(prev => new Set(prev).add(marketplaceId));
    
    try {
      await startSync(marketplaceId, type);
    } catch (_err) {
      // Erro será tratado pelo contexto do marketplace
    } finally {
      setSyncingMarketplaces(prev => {
        const newSet = new Set(prev);
        newSet.delete(marketplaceId);
        return newSet;
      });
    }
  };

  const handleBulkSync = async () => {
    const connectedMarketplaces = marketplaces
      .filter(m => m.status === 'connected')
      .map(m => m.id);

    if (connectedMarketplaces.length === 0) {
      alert('Nenhum marketplace conectado para sincronizar');
      return;
    }

    try {
      await Promise.all(
        connectedMarketplaces.map(id => handleSync(id, 'products'))
      );
    } catch (_err) {
      // Erro será tratado pelo contexto do marketplace
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'idle':
        return 'text-gray-500';
      case 'running':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const availablePlatforms: { platform: MarketplacePlatform; name: string; icon: string }[] = [
    { platform: 'amazon', name: 'Amazon', icon: '🛒' },
    { platform: 'mercadolivre', name: 'Mercado Livre', icon: '💛' },
    { platform: 'shopify', name: 'Shopify', icon: '🛍️' },
    { platform: 'shopee', name: 'Shopee', icon: '🧡' },
    { platform: 'americanas', name: 'Americanas', icon: '🔴' },
    { platform: 'casasbahia', name: 'Casas Bahia', icon: '🏠' },
    { platform: 'magento', name: 'Magento', icon: '🔶' },
    { platform: 'woocommerce', name: 'WooCommerce', icon: '🌐' }
  ];

  const connectedPlatforms = new Set(marketplaces.map(m => m.platform));
  const availableToConnect = availablePlatforms.filter(p => !connectedPlatforms.has(p.platform));

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-900">Erro</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-3">
            <button
              onClick={clearError}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Hub Multi-Marketplace</h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {getStatusIcon(dashboardData?.syncStatus || 'idle')}
                <span className={getSyncStatusColor(dashboardData?.syncStatus || 'idle')}>
                  {dashboardData?.syncStatus === 'idle' && 'Sincronizado'}
                  {dashboardData?.syncStatus === 'syncing' && 'Sincronizando...'}
                  {dashboardData?.syncStatus === 'error' && 'Erro na sincronização'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkSync}
                disabled={isLoading || marketplaces.filter(m => m.status === 'connected').length === 0}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Sincronizar Tudo</span>
              </button>
              
              <button
                onClick={refreshDashboard}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4${isLoading ? ' animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboardData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardStats data={dashboardData} />
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Connected Marketplaces */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Marketplaces Conectados ({marketplaces.length})</span>
            </h2>
          </div>
          
          {marketplaces.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum marketplace conectado</h3>
              <p className="text-gray-500 mb-6">
                Conecte seu primeiro marketplace para começar a sincronizar produtos e pedidos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaces.map((marketplace) => (
                <MarketplaceCard
                  key={marketplace.id}
                  marketplace={marketplace}
                  onDisconnect={() => alert('Desconectar - Em desenvolvimento')}
                  onTestConnection={() => handleTestConnection(marketplace.id)}
                  onSync={(type) => handleSync(marketplace.id, type)}
                  isTestingConnection={testingConnections.has(marketplace.id)}
                  isSyncing={syncingMarketplaces.has(marketplace.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Available Marketplaces */}
        {availableToConnect.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Conectar Novo Marketplace</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableToConnect.map((platform) => (
                <button
                  key={platform.platform}
                  onClick={() => handleConnectMarketplace(platform.platform)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{platform.icon}</div>
                    <h3 className="font-medium text-gray-900 mb-1">{platform.name}</h3>
                    <div className="flex items-center justify-center space-x-1 text-blue-600 group-hover:text-blue-700">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm">Conectar</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Connection Modal */}
      {showConnectionModal && selectedPlatform && (
        <MarketplaceConnectionModal
          platform={selectedPlatform}
          onSubmit={handleConnectionSubmit}
          onClose={() => {
            setShowConnectionModal(false);
            setSelectedPlatform(null);
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default MarketplaceHub;