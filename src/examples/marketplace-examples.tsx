/**
 * Exemplo de Uso do Dashboard Multimarketplace
 * 
 * Este arquivo demonstra como integrar e usar o sistema de marketplace
 * em diferentes cenários.
 */

import React from 'react';
import { MultiMarketplaceDashboard } from '@/components/marketplace/MultiMarketplaceDashboard';
import { createMarketplaceHandler } from '@/services/marketplace';

// ============================================
// Exemplo 1: Uso Básico
// ============================================

export function BasicUsageExample() {
  const handleConnectMarketplace = () => {
    // Abrir modal para conectar novo marketplace
    console.log('Abrindo modal de conexão...');
  };

  return (
    <div className="p-6">
      <MultiMarketplaceDashboard 
        onConnectMarketplace={handleConnectMarketplace}
        isPremium={false}
      />
    </div>
  );
}

// ============================================
// Exemplo 2: Conexão Programática
// ============================================

export async function ConnectMarketplaceExample() {
  const handler = createMarketplaceHandler('mercado-livre');
  
  try {
    // Conectar ao Mercado Livre
    await handler.connect({
      clientId: process.env.ML_CLIENT_ID || '',
      clientSecret: process.env.ML_CLIENT_SECRET || '',
      refreshToken: process.env.ML_REFRESH_TOKEN || '',
    });

    // Verificar conexão
    const status = handler.getConnectionStatus();
    console.log('Status da conexão:', status);

    // Buscar produtos
    const products = await handler.getProductList({
      status: 'active',
      limit: 50,
    });
    console.log(`${products.length} produtos encontrados`);

    // Obter estatísticas
    const stats = await handler.getSalesStats({
      start: new Date('2024-01-01'),
      end: new Date(),
    });
    console.log('Estatísticas:', stats);

  } catch (error) {
    console.error('Erro ao conectar:', error);
  }
}

// ============================================
// Exemplo 3: Atualização em Massa de Preços
// ============================================

export async function BulkPriceUpdateExample() {
  const handler = createMarketplaceHandler('mercado-livre');

  // Produtos com novos preços
  const priceUpdates = [
    { productId: 'MLB123456', price: 99.90 },
    { productId: 'MLB123457', price: 149.90 },
    { productId: 'MLB123458', price: 199.90 },
  ];

  try {
    await handler.bulkUpdatePrices(priceUpdates);
    console.log(`${priceUpdates.length} preços atualizados com sucesso`);
  } catch (error) {
    console.error('Erro ao atualizar preços:', error);
  }
}

// ============================================
// Exemplo 4: Monitoramento de Concorrência
// ============================================

export async function CompetitorMonitoringExample() {
  const handler = createMarketplaceHandler('mercado-livre');

  const productId = 'MLB123456';

  try {
    // Buscar preços dos concorrentes
    const competitorPrices = await handler.getCompetitorPrices(productId);

    // Calcular preço médio da concorrência
    const avgCompetitorPrice = 
      competitorPrices.reduce((sum, c) => sum + c.price, 0) / competitorPrices.length;

    console.log('Preço médio dos concorrentes:', avgCompetitorPrice);

    // Estratégia: ficar 5% abaixo da média
    const suggestedPrice = avgCompetitorPrice * 0.95;

    console.log('Preço sugerido:', suggestedPrice);

    // Atualizar preço
    await handler.updatePrice(productId, suggestedPrice);

  } catch (error) {
    console.error('Erro ao monitorar concorrência:', error);
  }
}

// ============================================
// Exemplo 5: Sincronização Automática
// ============================================

export function AutoSyncExample() {
  const handler = createMarketplaceHandler('mercado-livre');

  // Sincronizar a cada 15 minutos
  const syncInterval = setInterval(async () => {
    try {
      console.log('Iniciando sincronização...');

      // Sincronizar estoque
      const inventoryResult = await handler.syncInventory();
      console.log(`Estoque: ${inventoryResult.updated} itens atualizados`);

      // Sincronizar preços
      const priceResult = await handler.syncPrices();
      console.log(`Preços: ${priceResult.updated} itens atualizados`);

    } catch (error) {
      console.error('Erro na sincronização:', error);
    }
  }, 15 * 60 * 1000); // 15 minutos

  // Limpar intervalo ao desmontar componente
  return () => {
    clearInterval(syncInterval);
  };
}

// ============================================
// Exemplo 6: Dashboard Customizado
// ============================================

export function CustomDashboardExample() {
  const [selectedMarketplace, setSelectedMarketplace] = React.useState('mercado-livre');
  const [dashboardData, setDashboardData] = React.useState(null);

  React.useEffect(() => {
    const loadData = async () => {
      const handler = createMarketplaceHandler(selectedMarketplace);
      const data = await handler.getDashboardData();
      setDashboardData(data);
    };

    loadData();
  }, [selectedMarketplace]);

  if (!dashboardData) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Seletor de Marketplace */}
      <select 
        value={selectedMarketplace}
        onChange={(e) => setSelectedMarketplace(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="mercado-livre">Mercado Livre</option>
        <option value="amazon">Amazon</option>
        <option value="shopee">Shopee</option>
      </select>

      {/* Métricas Customizadas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-600">Total de Vendas</h3>
          <p className="text-2xl font-bold">{dashboardData.overview.totalSales}</p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-600">Receita</h3>
          <p className="text-2xl font-bold">
            R$ {dashboardData.overview.grossRevenue.toLocaleString('pt-BR')}
          </p>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <h3 className="text-sm text-gray-600">Margem Média</h3>
          <p className="text-2xl font-bold">{dashboardData.overview.averageMargin}%</p>
        </div>
      </div>

      {/* Alertas de Preço */}
      {dashboardData.pricing.priceAlerts.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold mb-2">⚠️ Alertas de Preço</h3>
          <ul className="space-y-2">
            {dashboardData.pricing.priceAlerts.map((alert) => (
              <li key={alert.id} className="text-sm">
                {alert.productName}: {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// Exemplo 7: Exportação de Dados
// ============================================

export async function DataExportExample() {
  const handler = createMarketplaceHandler('mercado-livre');

  try {
    // Buscar dados completos
    const data = await handler.getDashboardData();

    // Converter para CSV
    const csv = convertToCSV(data);

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marketplace-${Date.now()}.csv`;
    link.click();

  } catch (error) {
    console.error('Erro ao exportar dados:', error);
  }
}

function convertToCSV(data: any): string {
  // Implementação simplificada
  const headers = ['Produto', 'Vendas', 'Receita', 'Margem'];
  const rows = data.topProducts.map((p: any) => 
    [p.name, p.salesCount, p.revenue, p.margin].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// ============================================
// Exemplo 8: Integração com WebSockets
// ============================================

export function RealtimeUpdatesExample() {
  React.useEffect(() => {
    // Conectar ao WebSocket
    const ws = new WebSocket('wss://api.azuria.com.br/marketplace/ws');

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);

      switch (update.type) {
        case 'price_change':
          console.log('Preço atualizado:', update.data);
          break;

        case 'new_sale':
          console.log('Nova venda:', update.data);
          break;

        case 'stock_alert':
          console.log('Alerta de estoque:', update.data);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return <div>Recebendo atualizações em tempo real...</div>;
}
