import React, { useState } from 'react';
import { 
  AlertCircle, 
  Calendar,
  CheckCircle, 
  Clock, 
  Package,
  RefreshCw, 
  Settings, 
  ShoppingCart,
  TestTube, 
  Trash2, 
  TrendingUp,
  Zap
} from 'lucide-react';
import { Marketplace } from '../../types/marketplace';

interface MarketplaceCardProps {
  readonly marketplace: Marketplace;
  readonly onDisconnect: () => void;
  readonly onTestConnection: () => void;
  readonly onSync: (type: 'products' | 'orders' | 'inventory') => void;
  readonly isTestingConnection: boolean;
  readonly isSyncing: boolean;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  marketplace,
  onDisconnect,
  onTestConnection,
  onSync,
  isTestingConnection,
  isSyncing
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = () => {
    switch (marketplace.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (marketplace.status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'syncing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (marketplace.status) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro de conexão';
      case 'syncing':
        return 'Sincronizando';
      default:
        return 'Desconectado';
    }
  };

  const getPlatformIcon = () => {
    const icons: Record<string, string> = {
      amazon: '🛒',
      mercadolivre: '💛',
      shopify: '🛍️',
      shopee: '🧡',
      americanas: '🔴',
      casasbahia: '🏠',
      magento: '🔶',
      woocommerce: '🌐',
      extra: '⭐',
      custom: '🏪'
    };
    return icons[marketplace.platform] || '🏪';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getPlatformIcon()}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{marketplace.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{marketplace.platform}</p>
            </div>
          </div>
          {getStatusIcon()}
        </div>
        
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Produtos</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {marketplace.totalProducts.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs">Pedidos</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {marketplace.totalOrders.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Sync Info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Última sincronização</span>
          <Calendar className="w-4 h-4" />
        </div>
        <p className="text-sm text-gray-900">
          {marketplace.lastSync ? formatDate(marketplace.lastSync) : 'Nunca'}
        </p>
        
        {marketplace.syncStats && (
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Produtos: {marketplace.syncStats.productsSync.success}/{marketplace.syncStats.productsSync.total}</span>
              <span>Pedidos: {marketplace.syncStats.ordersSync.success}/{marketplace.syncStats.ordersSync.total}</span>
            </div>
            {marketplace.syncStats.lastSyncDuration && (
              <div className="text-xs text-gray-500">
                Duração: {marketplace.syncStats.lastSyncDuration}s
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={onTestConnection}
            disabled={isTestingConnection || marketplace.status === 'syncing'}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <TestTube className="w-4 h-4" />
            <span>{isTestingConnection ? 'Testando...' : 'Testar'}</span>
          </button>
          
          <button
            onClick={() => onSync('products')}
            disabled={isSyncing || marketplace.status !== 'connected'}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSync('orders')}
            disabled={isSyncing || marketplace.status !== 'connected'}
            className="flex items-center justify-center space-x-1 bg-purple-600 text-white py-1.5 px-2 rounded text-xs hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-3 h-3" />
            <span>Pedidos</span>
          </button>
          
          <button
            onClick={() => onSync('inventory')}
            disabled={isSyncing || marketplace.status !== 'connected'}
            className="flex items-center justify-center space-x-1 bg-orange-600 text-white py-1.5 px-2 rounded text-xs hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Package className="w-3 h-3" />
            <span>Estoque</span>
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-center space-x-1 bg-gray-600 text-white py-1.5 px-2 rounded text-xs hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Config</span>
          </button>
        </div>
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Configurações</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sincronização automática:</span>
                  <span className={marketplace.settings.autoSync ? 'text-green-600' : 'text-red-600'}>
                    {marketplace.settings.autoSync ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Intervalo:</span>
                  <span className="text-gray-900">{marketplace.settings.syncInterval}min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Markup de preço:</span>
                  <span className="text-gray-900">{marketplace.settings.priceMarkup}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Buffer de estoque:</span>
                  <span className="text-gray-900">{marketplace.settings.stockBuffer} un.</span>
                </div>
              </div>
            </div>
            
            {marketplace.syncStats && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Estatísticas de Sync</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Taxa de sucesso:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${(marketplace.syncStats.productsSync.success / marketplace.syncStats.productsSync.total) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-gray-900 text-xs">
                        {Math.round((marketplace.syncStats.productsSync.success / marketplace.syncStats.productsSync.total) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <button
                onClick={onDisconnect}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Desconectar</span>
              </button>
              
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12% este mês</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceCard;