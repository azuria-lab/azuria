import React from 'react';
import { DollarSign, Package, ShoppingCart, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { MarketplaceDashboardData } from '../../types/marketplace';

interface DashboardStatsProps {
  readonly data: MarketplaceDashboardData;
}

interface StatsCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ReactNode;
  readonly trend?: {
    value: number;
    isPositive: boolean;
  };
  readonly subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, subtitle }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const getSyncStatusColor = (status: string): string => {
  switch (status) {
    case 'idle':
      return 'bg-green-500';
    case 'syncing':
      return 'bg-blue-500 animate-pulse';
    default:
      return 'bg-red-500';
  }
};

const getSyncHistoryStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ data }) => {
  const connectionRate = data.totalMarketplaces > 0 
    ? Math.round((data.connectedMarketplaces / data.totalMarketplaces) * 100) 
    : 0;

  const averageOrderValue = data.totalOrders > 0 
    ? data.totalRevenue / data.totalOrders 
    : 0;

  const stats = [
    {
      title: 'Marketplaces Conectados',
      value: `${data.connectedMarketplaces}/${data.totalMarketplaces}`,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      subtitle: `${connectionRate}% de conexão`,
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: 'Total de Produtos',
      value: data.totalProducts,
      icon: <Package className="w-6 h-6 text-green-600" />,
      subtitle: 'Em todos os marketplaces'
    },
    {
      title: 'Pedidos Totais',
      value: data.totalOrders,
      icon: <ShoppingCart className="w-6 h-6 text-purple-600" />,
      subtitle: 'Este mês',
      trend: {
        value: 8,
        isPositive: true
      }
    },
    {
      title: 'Receita Total',
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`,
      icon: <DollarSign className="w-6 h-6 text-orange-600" />,
      subtitle: `Ticket médio: R$ ${averageOrderValue.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`,
      trend: {
        value: 15,
        isPositive: true
      }
    }
  ];

  return (
    <div>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, _index) => (
          <StatsCard
            key={`stat-${stat.title}`}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            subtitle={stat.subtitle}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Marketplace Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Marketplaces */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Marketplace</h3>
          <div className="space-y-4">
            {data.marketplaceStats.slice(0, 4).map((marketplace) => (
              <div key={marketplace.marketplace} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    marketplace.status === 'connected' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900 capitalize">{marketplace.marketplace}</p>
                    <p className="text-sm text-gray-500">{marketplace.products} produtos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {marketplace.revenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">{marketplace.orders} pedidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-4">
            {data.topProducts.slice(0, 4).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.title}</p>
                    <p className="text-sm text-gray-500">
                      {product.marketplaces.length} marketplace{product.marketplaces.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {product.revenue.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-sm text-gray-500">{product.totalSold} vendidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Status de Sincronização</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              getSyncStatusColor(data.syncStatus)
            }`} />
            <span className="text-sm text-gray-600 capitalize">
              {data.syncStatus === 'idle' && 'Sincronizado'}
              {data.syncStatus === 'syncing' && 'Sincronizando'}
              {data.syncStatus === 'error' && 'Erro'}
            </span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          Última sincronização: {data.recentSync ? 
            new Date(data.recentSync).toLocaleString('pt-BR') : 
            'Nunca'
          }
        </div>

        {data.syncHistory && data.syncHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Histórico Recente</h4>
            {data.syncHistory.slice(0, 3).map((sync, index) => (
              <div key={`${sync.type}-${index}`} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{sync.type}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  getSyncHistoryStatusColor(sync.status)
                }`}>
                  {sync.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;