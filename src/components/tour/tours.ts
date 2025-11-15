/**
 * Tour Definitions
 * 
 * Define os tours disponíveis na aplicação
 */

import type { Tour } from './types';

export const TOURS: Tour[] = [
  {
    id: 'marketplace-dashboard',
    name: 'Dashboard de Marketplace',
    steps: [
      {
        target: '[data-tour="marketplace-select"]',
        title: 'Bem-vindo ao Dashboard!',
        content: 'Aqui você pode visualizar e gerenciar todos os seus marketplaces conectados. Vamos fazer um tour rápido!',
        placement: 'bottom'
      },
      {
        target: '[data-tour="metrics-cards"]',
        title: 'Métricas Principais',
        content: 'Acompanhe suas principais métricas: receita, pedidos, conversão e mais. Os valores são atualizados em tempo real.',
        placement: 'bottom'
      },
      {
        target: '[data-tour="connect-button"]',
        title: 'Conectar Marketplace',
        content: 'Clique aqui para conectar um novo marketplace. Suportamos Mercado Livre, Amazon, Shopee e mais!',
        placement: 'left'
      },
      {
        target: '[data-tour="products-tab"]',
        title: 'Gerenciar Produtos',
        content: 'Gerencie todos os seus produtos, faça sincronização em lote, importe/exporte e muito mais.',
        placement: 'top'
      },
      {
        target: '[data-tour="ai-insights-tab"]',
        title: 'Insights de IA',
        content: 'Nossa IA analisa seus dados e fornece recomendações inteligentes de preços, previsões de vendas e oportunidades.',
        placement: 'top'
      }
    ]
  },
  {
    id: 'product-management',
    name: 'Gerenciamento de Produtos',
    steps: [
      {
        target: '[data-tour="product-search"]',
        title: 'Buscar Produtos',
        content: 'Use a busca para encontrar produtos rapidamente por nome, SKU ou categoria.',
        placement: 'bottom'
      },
      {
        target: '[data-tour="product-filters"]',
        title: 'Filtros Avançados',
        content: 'Filtre produtos por categoria, status, estoque ou marketplace para visualizações personalizadas.',
        placement: 'bottom'
      },
      {
        target: '[data-tour="product-grid"]',
        title: 'Lista de Produtos',
        content: 'Visualize seus produtos em grade ou lista. Use os checkboxes para seleção em lote.',
        placement: 'top'
      },
      {
        target: '[data-tour="bulk-actions"]',
        title: 'Ações em Lote',
        content: 'Selecione múltiplos produtos e execute ações em lote como sincronização ou edição.',
        placement: 'bottom'
      },
      {
        target: '[data-tour="import-export"]',
        title: 'Importar/Exportar',
        content: 'Importe produtos via CSV ou exporte seus dados para análise externa.',
        placement: 'left'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Avançado',
    steps: [
      {
        target: '[data-tour="time-range"]',
        title: 'Período de Análise',
        content: 'Selecione o período para análise: 7 dias, 30 dias, 90 dias ou personalizado.',
        placement: 'bottom'
      },
      {
        target: '[data-tour="metrics-overview"]',
        title: 'Visão Geral',
        content: 'Métricas principais com comparação ao período anterior e tendências.',
        placement: 'bottom'
      },
      {
        target: '[data-tour="top-products"]',
        title: 'Top Produtos',
        content: 'Veja os produtos com melhor performance e suas métricas detalhadas.',
        placement: 'top'
      },
      {
        target: '[data-tour="marketplace-comparison"]',
        title: 'Comparação de Marketplaces',
        content: 'Compare a performance entre diferentes marketplaces.',
        placement: 'top'
      },
      {
        target: '[data-tour="ai-insights"]',
        title: 'Insights de IA',
        content: 'Recomendações inteligentes com ações sugeridas baseadas em análise de dados.',
        placement: 'top'
      }
    ]
  }
];
